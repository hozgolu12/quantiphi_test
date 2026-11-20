import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble.jsx';
import StreamingView from './StreamingView.jsx';
import { Send, CornerDownLeft, Sparkles, AlertCircle, Briefcase, Smile, Zap } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    title: 'Code Analysis',
    desc: 'Write an SSE stream reader in JavaScript',
    prompt: 'Write a clean JavaScript utility to read Server-Sent Events (SSE) with error handling.',
    icon: Sparkles,
  },
  {
    title: 'Explain Architecture',
    desc: 'Explain the Vibe Check & Tone Modifier system',
    prompt: 'How does the tone toggle work as a system instruction modifier on the backend?',
    icon: Briefcase,
  },
  {
    title: 'Casual Chat',
    desc: 'Test the casual vibe personality',
    prompt: 'Hey! Tell me about what makes vibe coding exciting.',
    icon: Smile,
  },
  {
    title: 'Concise Bullet Points',
    desc: 'Compare MongoDB vs PostgreSQL',
    prompt: 'Compare MongoDB and PostgreSQL for a real-time chat application.',
    icon: Zap,
  },
];

export default function ChatInterface({
  messages = [],
  activeTone,
  onSendMessage,
  isStreaming,
  streamText,
  errorMessage,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom smoothly when new messages or streaming chunks arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Scrollable Conversation View */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-6 space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Intelligent AI Chat Assistant
            </h2>
            <p className="text-sm text-slate-400 mb-8 max-w-md">
              Powered by real-time streaming, instant tone switching, and MongoDB persistence. Select a vibe and start exploring!
            </p>

            {/* Suggested Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {SUGGESTED_PROMPTS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(card.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-200 group-hover:text-indigo-400 mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{card.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{card.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Character-by-character Streaming View */}
            {isStreaming && (
              <StreamingView streamText={streamText} tone={activeTone} />
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="my-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800/90 backdrop-blur-md">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative rounded-2xl bg-slate-950/90 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/40 shadow-xl transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything in ${activeTone} mode... (Enter to send, Shift+Enter for newline)`}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none px-4 pt-3 pb-12 focus:outline-none min-h-[52px]"
          />

          {/* Bottom Toolbar inside input */}
          <div className="absolute left-3 right-3 bottom-2.5 flex items-center justify-between text-xs text-slate-500 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Active Vibe: <span className="font-semibold text-indigo-400">{activeTone}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">
                {input.length} chars
              </span>
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 shadow-md shadow-indigo-600/30 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
