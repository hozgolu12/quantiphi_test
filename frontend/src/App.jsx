import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import HistorySidebar from './components/HistorySidebar.jsx';
import ChatInterface from './components/ChatInterface.jsx';
import ExportModal from './components/ExportModal.jsx';
import {
  getConversations,
  getConversationById,
  deleteConversation,
  streamChatResponse,
} from './services/api.js';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [activeTone, setActiveTone] = useState('Professional');
  const [selectedModelId, setSelectedModelId] = useState('gpt-4o-mini');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  // Load conversation list from MongoDB on startup
  const refreshConversations = useCallback(async (query = '') => {
    try {
      const data = await getConversations(query);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => {
    refreshConversations(searchQuery);
  }, [refreshConversations, searchQuery]);

  // Load selected conversation
  const handleSelectConversation = async (id) => {
    if (isStreaming) return;
    try {
      setErrorMessage(null);
      const conv = await getConversationById(id);
      setActiveConversationId(conv.id);
      setCurrentConversation(conv);
      if (conv.tone) {
        setActiveTone(conv.tone);
      }
    } catch (err) {
      console.error('Failed to select conversation:', err);
      setErrorMessage('Could not load selected conversation.');
    }
  };

  // Start a fresh conversation
  const handleNewChat = () => {
    if (isStreaming) return;
    setActiveConversationId(null);
    setCurrentConversation(null);
    setStreamText('');
    setErrorMessage(null);
  };

  // Delete conversation
  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversation(id);
      if (activeConversationId === id) {
        handleNewChat();
      }
      refreshConversations(searchQuery);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setErrorMessage('Failed to delete conversation.');
    }
  };

  // Switch Tone Toggle ("The Vibe Check")
  const handleToneChange = (tone) => {
    setActiveTone(tone);
    if (currentConversation) {
      setCurrentConversation((prev) => (prev ? { ...prev, tone } : null));
    }
  };

  // Send message and stream real-time response
  const handleSendMessage = async (prompt) => {
    if (!prompt.trim() || isStreaming) return;

    setIsStreaming(true);
    setStreamText('');
    setErrorMessage(null);

    // Optimistically create temporary user message on UI
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: prompt,
      tone: activeTone,
      timestamp: new Date().toISOString(),
    };

    setCurrentConversation((prev) => ({
      id: prev?.id || activeConversationId,
      title: prev?.title || prompt.slice(0, 36),
      tone: activeTone,
      createdAt: prev?.createdAt || new Date().toISOString(),
      messages: [...(prev?.messages || []), tempUserMsg],
    }));

    await streamChatResponse({
      conversationId: activeConversationId,
      message: prompt,
      tone: activeTone,
      provider: selectedProvider,
      model: selectedModelId,
      onStart: (data) => {
        if (data.conversationId && (!activeConversationId || activeConversationId !== data.conversationId)) {
          setActiveConversationId(data.conversationId);
        }
        refreshConversations(searchQuery);
      },
      onChunk: (chunk) => {
        setStreamText((prev) => prev + chunk);
      },
      onDone: (data) => {
        setIsStreaming(false);
        setStreamText('');

        if (data.aiMessage) {
          setCurrentConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              id: data.conversationId,
              messages: [...prev.messages, data.aiMessage],
            };
          });
        }
        refreshConversations(searchQuery);
      },
      onError: (err) => {
        setIsStreaming(false);
        setErrorMessage(err.message || 'Stream connection error');
        // Refresh sidebar so newly created user prompt thread is visible immediately
        refreshConversations(searchQuery);
      },
    });
  };

  const handleSelectModel = (modelObj) => {
    setSelectedModelId(modelObj.id);
    setSelectedProvider(modelObj.provider);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* History Sidebar */}
      <HistorySidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRefresh={() => refreshConversations(searchQuery)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header
          activeTone={activeTone}
          onToneChange={handleToneChange}
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          isStreaming={isStreaming}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          hasMessages={(currentConversation?.messages?.length || 0) > 0}
        />

        <ChatInterface
          messages={currentConversation?.messages || []}
          activeTone={activeTone}
          selectedModelId={selectedModelId}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          streamText={streamText}
          errorMessage={errorMessage}
        />
      </div>

      {/* Export Conversation Modal (Extra Feature 2) */}
      <ExportModal
        conversation={currentConversation}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
