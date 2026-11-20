import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Sparkles } from 'lucide-react';

export default function StreamingView({ streamText, tone }) {
  if (!streamText) {
    return (
      <div className="flex items-start gap-3 my-4 px-2 sm:px-4 animate-fade-in">
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center flex-shrink-0 animate-pulse">
          <Bot className="w-4 h-4" />
        </div>
        <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-4 max-w-[85%] sm:max-w-[75%] flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Generating real-time response ({tone} mode)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 my-4 px-2 sm:px-4 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl rounded-tl-none p-4 max-w-[85%] sm:max-w-[75%] shadow-sm">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800/80 text-xs">
          <span className="font-semibold text-indigo-400 text-xs">AI Assistant</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping mr-0.5" />
            Streaming ({tone})
          </span>
        </div>

        <div className="markdown-body text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {streamText}
          </ReactMarkdown>
          <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse align-middle" />
        </div>
      </div>
    </div>
  );
}
