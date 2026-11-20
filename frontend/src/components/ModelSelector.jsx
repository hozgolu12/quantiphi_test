import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

export const INTEGRATED_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    providerName: 'OpenAI',
    badge: 'Integrated',
    accentColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    providerName: 'Anthropic',
    badge: 'Integrated',
    accentColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
    borderColor: 'border-amber-500/20',
  },
];

export default function ModelSelector({
  selectedModelId = 'gpt-4o-mini',
  onSelectModel,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeModel =
    INTEGRATED_MODELS.find((m) => m.id === selectedModelId) || INTEGRATED_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isOpen
            ? 'bg-slate-800 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`w-2 h-2 rounded-full ${activeModel.dotColor}`} />
        <span className="text-slate-400 font-normal">{activeModel.providerName}</span>
        <span className="text-slate-200 font-semibold">{activeModel.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-60 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-fade-in">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Connected AI Models
          </div>
          <div className="space-y-1 mt-1">
            {INTEGRATED_MODELS.map((model) => {
              const isSelected = model.id === activeModel.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-slate-800/90 text-white font-medium border border-slate-700/80 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/40 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${model.dotColor}`} />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{model.name}</span>
                      <span className="text-[10px] text-slate-400">{model.providerName}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
