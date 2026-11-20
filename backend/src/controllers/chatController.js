import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { streamOpenAIResponse } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

const MAX_MESSAGE_LENGTH = 4000;
const ALLOWED_TONES = ['Professional', 'Casual', 'Concise'];

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

    // 1. Authoritative Server-side validation: Empty message
    if (!message || typeof message !== 'string' || !message.trim()) {
      sendSSE({ type: 'error', error: 'Validation Error: User prompt cannot be empty.' });
      return res.end();
    }

    // 2. Authoritative Server-side validation: Message size limit
    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      sendSSE({
        type: 'error',
        error: `Validation Error: Message exceeds maximum length limit of ${MAX_MESSAGE_LENGTH} characters.`,
      });
      return res.end();
    }

    // 3. Authoritative Server-side validation: Tone option
    if (tone && !ALLOWED_TONES.includes(tone)) {
      sendSSE({
        type: 'error',
        error: `Validation Error: Invalid tone "${tone}". Allowed options are: ${ALLOWED_TONES.join(', ')}.`,
      });
      return res.end();
    }

    const validatedTone = tone || 'Professional';
    let conversation;

    // 4. Authoritative Server-side validation: Conversation identifier
    if (conversationId) {
      if (mongoose.isValidObjectId && !mongoose.isValidObjectId(conversationId)) {
        sendSSE({
          type: 'error',
          error: `Validation Error: Invalid conversation identifier "${conversationId}".`,
        });
        return res.end();
      }

      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        sendSSE({
          type: 'error',
          error: `Not Found: Conversation with ID "${conversationId}" does not exist.`,
        });
        return res.end();
      }

      // Update active tone for this thread
      conversation.tone = validatedTone;
    } else {
      // Create new conversation document in MongoDB
      const titleSnippet = message.trim().slice(0, 38) + (message.trim().length > 38 ? '...' : '');
      conversation = new Conversation({
        title: titleSnippet,
        tone: validatedTone,
        messages: [],
      });
    }

    // Persist user prompt immediately to MongoDB with timestamp
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

    // Prepare conversational history context for OpenAI
    const history = (conversation.messages || [])
      .slice(0, -1) // Exclude current prompt since it's passed as prompt
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    let fullAiResponse = '';

    // Invoke genuine OpenAI streaming
    await streamOpenAIResponse({
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

    // CRITICAL: Only persist the assistant response if stream succeeded with content
    if (!fullAiResponse || !fullAiResponse.trim()) {
      throw new Error('Incomplete response received from AI provider.');
    }

    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: fullAiResponse,
      tone: validatedTone,
      timestamp: new Date(),
    };

    conversation.messages.push(aiMessage);
    await conversation.save();

    // Signal stream completion with saved AI message
    sendSSE({
      type: 'done',
      conversationId: conversation._id.toString(),
      aiMessage,
    });

    res.end();
  } catch (error) {
    console.error('[ChatController] Stream error:', error.message);
    // Send clear error payload to UI without saving partial failed answer
    sendSSE({
      type: 'error',
      error: error.message || 'An error occurred while streaming response.',
    });
    res.end();
  }
};
