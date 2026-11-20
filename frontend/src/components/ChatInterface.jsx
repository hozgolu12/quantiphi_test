import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble.jsx';
import StreamingView from './StreamingView.jsx';
import { Send, Sparkles, AlertCircle, Briefcase, Smile, Zap, Cpu } from 'lucide-react';
import { INTEGRATED_MODELS } from './ModelSelector.jsx';

const SUGGESTED_PROMPTS = [
  {
    title: 'Code Generation',
    desc: 'Write an SSE stream reader in JavaScript',
    prompt: 'Write a clean JavaScript utility to read Server-Sent Events (SSE) with robust error handling.',
    icon: Sparkles,
  },
  {
    title: 'Architecture Review',
    desc: 'Explain the Vibe Check & System Instructions',
    prompt: 'How does the tone toggle work as a system instruction modifier on the backend?',
    icon: Briefcase,
  },
  {
    title: 'Casual Discussion',
    desc: 'Test the casual vibe conversational personality',
    prompt: 'Hey! Tell me what makes vibe coding innovative and fun.',
    icon: Smile,
  },
  {
    title: 'Concise Summary',
    desc: 'Compare MongoDB vs PostgreSQL',
    prompt: 'Compare MongoDB and PostgreSQL for a real-time chat application in bullet points.',
    icon: Zap,
  },
];

export default function ChatInterface({
  messages = [],
  activeTone,
  selectedModelId = 'gpt-4o-mini',
  onSendMessage,
  isStreaming,
  streamText,
  errorMessage,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeModel =
    INTEGRATED_MODELS.find((m) => m.id === selectedModelId) || INTEGRATED_MODELS[0];

  // Auto-scroll to bottom smoothly
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
    <div className="flex-1 flex flex-col h-full bg-[#0B0F17] relative overflow-hidden">
      {/* Scrollable Conversation View */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center py-10 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
              AI Assistant Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-md leading-relaxed">
              Real-time progressive streaming, dynamic tone modulation, and persistent MongoDB history. Select a prompt or ask anything below.
            </p>

            {/* Suggested Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
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
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-medium text-slate-200 group-hover:text-indigo-400 mb-1">
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{card.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{card.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Character-by-character Streaming View */}
            {isStreaming && (
              <StreamingView
                streamText={streamText}
                tone={activeTone}
                modelName={activeModel.name}
              />
            )}

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="my-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 shadow-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Modern SaaS Prompt Bar */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/90 to-transparent">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative rounded-2xl bg-slate-900/95 border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 shadow-2xl transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeModel.name} in ${activeTone} mode...`}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none px-4 pt-3.5 pb-12 focus:outline-none min-h-[52px]"
          />

          {/* Integrated Bar Toolbar */}
          <div className="absolute left-3 right-3 bottom-2.5 flex items-center justify-between text-xs text-slate-500 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                <Cpu className="w-2.5 h-2.5 text-indigo-400" />
                {activeModel.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                Vibe: <span className="text-indigo-400 font-semibold">{activeTone}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
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
