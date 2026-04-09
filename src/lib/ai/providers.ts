/**
 * LLM Provider Chain with Free Tier Fallback
 *
 * Primary:   Google Gemini 2.0 Flash (15 RPM, 1M tokens/min, FREE)
 * Fallback1: Groq Llama-3.3-70B (1000 req/day, tool calling, FREE)
 * Fallback2: DeepSeek V3 (cheap fallback)
 *
 * Each provider is wrapped with @langchain/ adapters for a unified interface.
 * Automatic fallback on rate limit (429) or error.
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { auditLog } from './audit';

// ---------------------------------------------------------------------------
// Provider Configuration
// ---------------------------------------------------------------------------

interface ProviderConfig {
  name: string;
  create: () => BaseChatModel;
  isAvailable: () => boolean;
}

const providers: ProviderConfig[] = [
  {
    name: 'gemini-2.0-flash',
    create: () =>
      new ChatGoogleGenerativeAI({
        model: 'gemini-2.0-flash',
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        temperature: 0.3,
        maxOutputTokens: 4096,
      }),
    isAvailable: () => !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
  {
    name: 'groq-llama-3.3-70b',
    create: () =>
      new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.3,
        maxTokens: 4096,
      }),
    isAvailable: () => !!process.env.GROQ_API_KEY,
  },
  {
    name: 'groq-llama-3.1-8b',
    create: () =>
      new ChatGroq({
        model: 'llama-3.1-8b-instant',
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.3,
        maxTokens: 4096,
      }),
    isAvailable: () => !!process.env.GROQ_API_KEY,
  },
];

// ---------------------------------------------------------------------------
// Singleton model cache
// ---------------------------------------------------------------------------

const modelCache = new Map<string, BaseChatModel>();

function getModel(config: ProviderConfig): BaseChatModel {
  const cached = modelCache.get(config.name);
  if (cached) return cached;

  const model = config.create();
  modelCache.set(config.name, model);
  return model;
}

// ---------------------------------------------------------------------------
// Rate limit tracking
// ---------------------------------------------------------------------------

const rateLimitUntil = new Map<string, number>();

function isRateLimited(providerName: string): boolean {
  const until = rateLimitUntil.get(providerName);
  if (!until) return false;
  if (Date.now() > until) {
    rateLimitUntil.delete(providerName);
    return false;
  }
  return true;
}

function markRateLimited(providerName: string, retryAfterMs: number = 60_000): void {
  rateLimitUntil.set(providerName, Date.now() + retryAfterMs);
}

// ---------------------------------------------------------------------------
// isRateLimitError
// ---------------------------------------------------------------------------

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('429') || msg.includes('rate limit') || msg.includes('quota');
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the best available LLM model, with automatic fallback.
 * Returns a LangChain BaseChatModel that can be used with .invoke(), .stream(), etc.
 */
export function getLLM(): BaseChatModel {
  for (const config of providers) {
    if (!config.isAvailable()) continue;
    if (isRateLimited(config.name)) continue;
    return getModel(config);
  }

  throw new Error(
    'No LLM provider available. Set at least one of: GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY',
  );
}

/**
 * Get the name of the currently active provider.
 */
export function getActiveProviderName(): string {
  for (const config of providers) {
    if (!config.isAvailable()) continue;
    if (isRateLimited(config.name)) continue;
    return config.name;
  }
  return 'none';
}

/**
 * Invoke an LLM with automatic fallback on rate limit errors.
 * Logs every call for the audit trail.
 */
export async function invokeLLMWithFallback(
  messages: BaseMessage[],
  options?: { agentId?: string; traceId?: string },
): Promise<AIMessage> {
  const errors: Array<{ provider: string; error: string }> = [];

  for (const config of providers) {
    if (!config.isAvailable()) continue;
    if (isRateLimited(config.name)) continue;

    try {
      const model = getModel(config);
      const result = await model.invoke(messages);

      auditLog({
        agentId: options?.agentId ?? 'system',
        action: 'llm_call',
        input: {
          provider: config.name,
          messageCount: messages.length,
        },
        output: {
          contentLength: typeof result.content === 'string' ? result.content.length : 0,
        },
        reasoning: `Used provider ${config.name}`,
        parentTraceId: options?.traceId,
      });

      return result as AIMessage;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({ provider: config.name, error: errorMsg });

      if (isRateLimitError(error)) {
        markRateLimited(config.name);
        auditLog({
          agentId: options?.agentId ?? 'system',
          action: 'reasoning',
          input: { provider: config.name },
          output: { error: errorMsg },
          reasoning: `Rate limited on ${config.name}, falling back to next provider`,
          parentTraceId: options?.traceId,
        });
        continue;
      }

      // Non-rate-limit error — try next provider
      continue;
    }
  }

  throw new Error(
    `All LLM providers failed:\n${errors.map((e) => `  ${e.provider}: ${e.error}`).join('\n')}`,
  );
}

/**
 * Get a fast model specifically for routing/classification tasks.
 */
export function getRoutingLLM(): BaseChatModel {
  // Prefer Groq for fast routing (lower latency)
  const groqConfig = providers.find(
    (p) => p.name === 'groq-llama-3.1-8b' && p.isAvailable() && !isRateLimited(p.name),
  );
  if (groqConfig) return getModel(groqConfig);

  // Fall back to default
  return getLLM();
}
