import { apiGet, apiPost } from '@/lib/api-client';

interface AIContext {
  page: string;
  entityId?: string | null;
  caseId?: string | null;
  alertId?: string | null;
}

export const aiApi = {
  async generateAIResponse(query: string, context: AIContext): Promise<string> {
    const result = await apiPost<{ response: string }>('/ai/response', { query, context });
    return result.response;
  },

  /**
   * Streams AI response via SSE. Returns an async generator of string chunks.
   */
  async *streamResponse(query: string, context: AIContext): AsyncGenerator<string> {
    const res = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });

    if (!res.ok || !res.body) {
      throw new Error('Stream request failed');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') return;
            yield JSON.parse(payload) as string;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  getSuggestedPrompts(page: string): Promise<string[]> {
    return apiGet<string[]>('/ai/prompts', { page });
  },
};
