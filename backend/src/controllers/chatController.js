import { Conversation } from '../models/Conversation.js';
import { generateStreamingResponse } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/chat
 * Streams real-time AI responses using Server-Sent Events (SSE)
 * Enforces server-side validations, tone modifiers, and MongoDB persistence.
 */
export const streamChat = async (req, res) => {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevents reverse proxy buffering (Nginx, etc.)

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  const sendSSE = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (res.flush) res.flush();
  };

  try {
    const { conversationId, message, tone = 'Professional' } = req.body;

    // Server-side validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      sendSSE({ type: 'error', error: 'User message is required and cannot be empty.' });
      return res.end();
    }

    const validatedTone = ['Professional', 'Casual', 'Concise'].includes(tone)
      ? tone
      : 'Professional';

    let conversation;

    // Retrieve or initialize conversation in MongoDB
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        // If an invalid ID was sent, create a new conversation
        conversation = new Conversation({
          title: message.trim().slice(0, 36) + (message.length > 36 ? '...' : ''),
          tone: validatedTone,
          messages: [],
        });
      } else {
        // Update conversation tone to match the latest user selection
        conversation.tone = validatedTone;
      }
    } else {
      conversation = new Conversation({
        title: message.trim().slice(0, 36) + (message.length > 36 ? '...' : ''),
        tone: validatedTone,
        messages: [],
      });
    }

    // Persist user message immediately to MongoDB
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      tone: validatedTone,
      timestamp: new Date(),
    };

    conversation.messages.push(userMessage);
    await conversation.save();

    // Signal client stream initiation
    sendSSE({
      type: 'start',
      conversationId: conversation._id.toString(),
      userMessage,
    });

    // Prepare conversational history context for AI API
    const history = conversation.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let fullAiResponse = '';

    // Invoke streaming AI generation
    await generateStreamingResponse({
      prompt: message.trim(),
      tone: validatedTone,
      conversationHistory: history,
      onChunk: (chunk) => {
        fullAiResponse += chunk;
        sendSSE({
          type: 'chunk',
          text: chunk,
        });
      },
    });

    // Persist completed AI response to MongoDB
    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: fullAiResponse,
      tone: validatedTone,
      timestamp: new Date(),
    };

    conversation.messages.push(aiMessage);
    await conversation.save();

    // Signal completion with final saved message
    sendSSE({
      type: 'done',
      conversationId: conversation._id.toString(),
      aiMessage,
    });

    res.end();
  } catch (error) {
    console.error('[ChatController] Stream error:', error);
    sendSSE({
      type: 'error',
      error: error.message || 'Internal server error while streaming response.',
    });
    res.end();
  }
};
