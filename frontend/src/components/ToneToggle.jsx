import React from 'react';
import { Briefcase, Smile, Zap } from 'lucide-react';

const TONES = [
  {
    id: 'Professional',
    label: 'Professional',
    icon: Briefcase,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    activeBg: 'bg-blue-600 text-white shadow-lg shadow-blue-500/25',
    tag: 'Formal & Structured',
  },
  {
    id: 'Casual',
    label: 'Casual',
    icon: Smile,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    activeBg: 'bg-amber-600 text-white shadow-lg shadow-amber-500/25',
    tag: 'Friendly & Upbeat',
  },
  {
    id: 'Concise',
    label: 'Concise',
    icon: Zap,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
    tag: 'Direct & Bulleted',
  },
];

export default function ToneToggle({ activeTone, onToneChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md">
      <span className="hidden sm:inline-block px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Vibe:
      </span>
      {TONES.map((tone) => {
        const Icon = tone.icon;
        const isActive = activeTone === tone.id;

        return (
          <button
            key={tone.id}
            type="button"
            disabled={disabled}
            onClick={() => onToneChange(tone.id)}
            title={`${tone.label} mode: ${tone.tag}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive
                ? tone.activeBg
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
            <span>{tone.label}</span>
          </button>
        );
      })}
    </div>
  );
}
