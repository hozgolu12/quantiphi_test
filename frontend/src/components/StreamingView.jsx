import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Sparkles } from 'lucide-react';

export default function StreamingView({ streamText, tone, modelName = 'AI' }) {
  if (!streamText) {
    return (
      <div className="flex items-start gap-3 my-4 px-2 sm:px-4 animate-fade-in">
        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 animate-pulse" />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 text-slate-400 rounded-xl rounded-tl-none p-3.5 max-w-[85%] sm:max-w-[80%] flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Generating real-time response ({modelName} • {tone})...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 my-4 px-2 sm:px-4 animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl rounded-tl-none p-4 max-w-[85%] sm:max-w-[80%] shadow-sm">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-xs">
          <span className="font-semibold text-slate-200">{modelName}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse mr-0.5" />
            Streaming ({tone})
          </span>
        </div>

        <div className="markdown-body text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {streamText}
          </ReactMarkdown>
          <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-1 animate-pulse align-middle" />
        </div>
      </div>
    </div>
  );
}
