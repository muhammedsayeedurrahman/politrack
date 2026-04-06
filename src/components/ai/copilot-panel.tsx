'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageBubble } from './message-bubble';
import { SuggestedPrompts } from './suggested-prompts';
import { useAIStore } from '@/stores/ai-store';
import { streamResponse, getSuggestedPrompts } from '@/services/ai-service';
import { cn } from '@/lib/utils';

export function CopilotPanel() {
  const {
    panelOpen,
    setPanelOpen,
    messages,
    addMessage,
    isStreaming,
    setStreaming,
    currentPage,
    selectedEntityId,
    selectedCaseId,
    clearMessages,
  } = useAIStore();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef(false);

  const suggestedPrompts = getSuggestedPrompts(currentPage);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (panelOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [panelOpen]);

  const handleSend = useCallback(async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isStreaming) return;

    setInput('');
    addMessage({ role: 'user', content: query, context: { page: currentPage, entityId: selectedEntityId ?? undefined, caseId: selectedCaseId ?? undefined } });

    setStreaming(true);
    abortRef.current = false;

    let fullResponse = '';
    const context = { page: currentPage, entityId: selectedEntityId, caseId: selectedCaseId };

    try {
      for await (const chunk of streamResponse(query, context)) {
        if (abortRef.current) break;
        fullResponse += chunk;
      }
    } finally {
      addMessage({ role: 'assistant', content: fullResponse.trim(), context: { page: currentPage } });
      setStreaming(false);
    }
  }, [input, isStreaming, currentPage, selectedEntityId, selectedCaseId, addMessage, setStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!panelOpen) return null;

  return (
    <div
      className={cn(
        'fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l bg-background shadow-2xl sm:w-[420px]',
        'animate-in slide-in-from-right duration-300',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Copilot</h2>
            <p className="text-[10px] text-muted-foreground capitalize">Context: {currentPage}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={clearMessages} aria-label="Clear chat">
            <Trash2 size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setPanelOpen(false)} aria-label="Close panel">
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-5 pt-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Bot size={24} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold">AI Investigation Copilot</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-[280px] mx-auto">
                  Ask me anything about your investigations, entities, alerts, or network connections. I adapt to the page you&apos;re on.
                </p>
              </div>

              {/* What I can do */}
              <div className="rounded-lg bg-muted/40 p-3 space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground">What I can help with:</p>
                <div className="grid gap-2">
                  {[
                    { label: 'Analyze cases', desc: 'Risk breakdowns, evidence patterns, next steps' },
                    { label: 'Triage alerts', desc: 'Which alerts to escalate, investigate, or dismiss' },
                    { label: 'Explain entities', desc: 'Why an entity is flagged, who they connect to' },
                    { label: 'Spot patterns', desc: 'Find shell companies, bid rigging, hub entities' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                      <div>
                        <span className="text-xs font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground"> — {item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context awareness hint */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <p className="text-[11px] text-center">
                  I&apos;m currently aware of the <strong className="capitalize">{currentPage}</strong> page.
                  {currentPage === 'dashboard' && ' Ask me about threats, risks, or platform overview.'}
                  {currentPage === 'investigations' && ' Select a case and ask me to analyze it.'}
                  {currentPage === 'network' && ' Select an entity or ask about patterns.'}
                  {currentPage === 'alerts' && ' Ask me to triage or cluster your alerts.'}
                </p>
              </div>

              <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleSend} disabled={isStreaming} />
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              {isStreaming && (
                <div className="flex gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot size={14} className="text-primary animate-pulse" />
                  </div>
                  <div className="rounded-xl bg-muted/70 px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <Separator className="my-2" />
              <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleSend} disabled={isStreaming} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI copilot..."
            className="min-h-[40px] max-h-32 resize-none text-sm"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon"
            className="shrink-0"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
          >
            <Send size={14} />
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
          Press Ctrl+J to toggle &middot; Enter to send &middot; Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
