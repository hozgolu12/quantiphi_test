import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, Briefcase, Smile, Zap } from 'lucide-react';

const ToneBadge = ({ tone }) => {
  if (!tone) return null;
  const config = {
    Professional: { icon: Briefcase, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    Casual: { icon: Smile, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    Concise: { icon: Zap, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  }[tone] || { icon: Briefcase, color: 'text-slate-400 bg-slate-800' };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {tone}
    </span>
  );
};

// Code block renderer with syntax styling and 1-Click Copy
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!inline && (match || codeString.includes('\n'))) {
    return (
      <div className="relative my-3 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 font-mono text-xs">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
            {language || 'code'}
          </span>
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-3 overflow-x-auto text-slate-200">
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    );
  }

  return (
    <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs" {...props}>
      {children}
    </code>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copiedFull, setCopiedFull] = useState(false);

  const handleCopyFullMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`group flex items-start gap-3 my-4 px-2 sm:px-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-500/20'
            : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-indigo-400 border border-slate-700 shadow-black/40'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
        }`}
      >
        {/* Header line for AI: Tone badge & timestamp */}
        {!isUser && (
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-400 text-xs">AI Assistant</span>
              <ToneBadge tone={message.tone} />
            </div>
            <button
              onClick={handleCopyFullMessage}
              type="button"
              title="Copy message"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
            >
              {copiedFull ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Message Body */}
        {isUser ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-indigo-50 font-normal">
            {message.content}
          </div>
        ) : (
          <div className="markdown-body text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Footer timestamp */}
        <div
          className={`flex items-center mt-1 text-[10px] ${
            isUser ? 'justify-end text-indigo-200/80' : 'justify-end text-slate-500'
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
