import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Trash2, X, Briefcase, Smile, Zap, RotateCw } from 'lucide-react';

const TonePill = ({ tone }) => {
  const config = {
    Professional: { icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10' },
    Casual: { icon: Smile, color: 'text-amber-400 bg-amber-500/10' },
    Concise: { icon: Zap, color: 'text-emerald-400 bg-emerald-500/10' },
  }[tone] || { icon: Briefcase, color: 'text-slate-400 bg-slate-800' };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {tone}
    </span>
  );
};

export default function HistorySidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
  onRefresh,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(query) ||
      c.lastMessageSnippet?.toLowerCase().includes(query)
    );
  });

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              VC
            </div>
            <span className="text-xs font-semibold text-slate-200">Conversation History</span>
          </div>

          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Sync with MongoDB"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Button: New Conversation */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Bar (Extra Feature 1) */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {searchQuery ? 'No matching conversations' : 'No previous conversations yet'}
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isConfirming = deleteConfirmId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                      : 'hover:bg-slate-900/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />

                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-medium truncate">{conv.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                      <span>{formatRelativeTime(conv.updatedAt)}</span>
                      <span>•</span>
                      <TonePill tone={conv.tone} />
                    </div>
                  </div>

                  {/* Delete Button (Extra Feature 2) */}
                  <div
                    className="absolute right-2 top-2 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isConfirming ? (
                      <div className="flex items-center gap-1 bg-rose-950 border border-rose-800/80 px-1.5 py-0.5 rounded text-[10px] text-rose-300">
                        <button
                          onClick={() => {
                            onDeleteConversation(conv.id);
                            setDeleteConfirmId(null);
                          }}
                          className="font-bold hover:underline"
                        >
                          Del
                        </button>
                        <span>|</span>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(conv.id)}
                        title="Delete conversation"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            MongoDB Connected
          </span>
          <span className="font-mono">{filtered.length} threads</span>
        </div>
      </aside>
    </>
  );
}
