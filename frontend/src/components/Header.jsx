import React from 'react';
import { Menu, Download, Sparkles } from 'lucide-react';
import ToneToggle from './ToneToggle.jsx';
import ModelSelector from './ModelSelector.jsx';

export default function Header({
  activeTone,
  onToneChange,
  selectedModelId,
  onSelectModel,
  isStreaming,
  onOpenSidebar,
  onOpenExport,
  hasMessages,
}) {
  return (
    <header className="h-14 px-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          type="button"
          aria-label="Toggle Sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              VibeChat
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live SSE
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Model Selector (Integrated models only) */}
        <ModelSelector
          selectedModelId={selectedModelId}
          onSelectModel={onSelectModel}
          disabled={isStreaming}
        />

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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Export</span>
          </button>
        )}
      </div>
    </header>
  );
}
