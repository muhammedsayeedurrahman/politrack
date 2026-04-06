'use client';

import { useEffect, useState } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/stores/ai-store';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [displayedContent, setDisplayedContent] = useState(
    message.role === 'user' ? message.content : '',
  );

  useEffect(() => {
    if (message.role === 'user') {
      setDisplayedContent(message.content);
      return;
    }

    if (!isStreaming) {
      setDisplayedContent(message.content);
      return;
    }

    // Typewriter effect for assistant messages
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.content.length) {
        setDisplayedContent(message.content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [message.content, message.role, isStreaming]);

  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/70',
        )}
      >
        {isUser ? (
          <p>{displayedContent}</p>
        ) : (
          <div
            className="prose-sm [&_strong]:font-semibold [&_br]:my-1"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(displayedContent) }}
          />
        )}
        {isStreaming && !isUser && displayedContent.length < message.content.length && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/60 animate-pulse" />
        )}
      </div>
    </div>
  );
}
