import React from 'react';
import { Menu, Download, Sparkles } from 'lucide-react';
import ToneToggle from './ToneToggle.jsx';

export default function Header({
  activeTone,
  onToneChange,
  isStreaming,
  onOpenSidebar,
  onOpenExport,
  hasMessages,
}) {
  return (
    <header className="h-16 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between backdrop-blur-lg sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          type="button"
          aria-label="Toggle Sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                AI Assistant
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live SSE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Real-Time Chat with Tone Control
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tone Toggle (The Vibe Check) */}
        <ToneToggle
          activeTone={activeTone}
          onToneChange={onToneChange}
          disabled={isStreaming}
        />

        {/* Export Chat Button (Extra Feature 2) */}
        {hasMessages && (
          <button
            onClick={onOpenExport}
            type="button"
            title="Export conversation history"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Export</span>
          </button>
        )}
      </div>
    </header>
  );
}
