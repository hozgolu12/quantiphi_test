import React from 'react';
import { Briefcase, Smile, Zap } from 'lucide-react';

const TONES = [
  {
    id: 'Professional',
    label: 'Professional',
    icon: Briefcase,
    activeClass: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30',
  },
  {
    id: 'Casual',
    label: 'Casual',
    icon: Smile,
    activeClass: 'bg-amber-600 text-white shadow-sm shadow-amber-600/30',
  },
  {
    id: 'Concise',
    label: 'Concise',
    icon: Zap,
    activeClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
  },
];

export default function ToneToggle({ activeTone, onToneChange, disabled = false }) {
  return (
    <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
      {TONES.map((tone) => {
        const Icon = tone.icon;
        const isActive = activeTone === tone.id;

        return (
          <button
            key={tone.id}
            type="button"
            disabled={disabled}
            onClick={() => onToneChange(tone.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? tone.activeClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{tone.label}</span>
          </button>
        );
      })}
    </div>
  );
}
