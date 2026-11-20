import React, { useState } from 'react';
import { Download, FileText, Code, Check, X } from 'lucide-react';

export default function ExportModal({ conversation, isOpen, onClose }) {
  const [format, setFormat] = useState('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const generateMarkdown = () => {
    let md = `# Conversation: ${conversation.title}\n\n`;
    md += `- **Date**: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    md += `- **Vibe Tone**: ${conversation.tone}\n`;
    md += `- **Total Messages**: ${conversation.messages?.length || 0}\n\n---\n\n`;

    (conversation.messages || []).forEach((msg) => {
      const roleLabel = msg.role === 'user' ? '👤 User' : `🤖 AI Assistant (${msg.tone || 'AI'})`;
      const time = new Date(msg.timestamp).toLocaleTimeString();
      md += `### ${roleLabel} [${time}]\n\n${msg.content}\n\n---\n\n`;
    });

    return md;
  };

  const generateJSON = () => {
    return JSON.stringify(conversation, null, 2);
  };

  const activeContent = format === 'markdown' ? generateMarkdown() : generateJSON();

  const handleDownload = () => {
    const filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${
      format === 'markdown' ? 'md' : 'json'
    }`;
    const blob = new Blob([activeContent], {
      type: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Export Conversation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormat('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                format === 'markdown'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Markdown (.md)
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                format === 'json'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              JSON (.json)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <span>Copy Preview</span>
            )}
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80 font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-all">
          {activeContent}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/25"
          >
            <Download className="w-3.5 h-3.5" />
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
