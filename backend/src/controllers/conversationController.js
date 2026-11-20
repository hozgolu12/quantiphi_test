import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';

const ALLOWED_TONES = ['Professional', 'Casual', 'Concise'];

/**
 * GET /api/conversations
 * Retrieve all past conversations for the History Sidebar (supports search query)
 */
export const getAllConversations = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && typeof search === 'string' && search.trim()) {
      // Escape special regex characters to prevent regex injection
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query = {
        $or: [
          { title: { $regex: sanitized, $options: 'i' } },
          { 'messages.content': { $regex: sanitized, $options: 'i' } },
        ],
      };
    }

    const conversations = await Conversation.find(query)
      .select('title tone updatedAt createdAt messages')
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((conv) => {
      const messages = conv.messages || [];
      const lastMessage = messages[messages.length - 1];
      return {
        id: conv._id.toString(),
        title: conv.title,
        tone: conv.tone,
        messageCount: messages.length,
        lastMessageSnippet: lastMessage ? lastMessage.content.slice(0, 75) : '',
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('[ConversationController] Error getting conversations:', error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve conversations' });
  }
};

/**
 * GET /api/conversations/:id
 * Retrieve a single conversation thread with full message history
 */
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid conversation ID format' });
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: conversation._id.toString(),
        title: conversation.title,
        tone: conversation.tone,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error(`[ConversationController] Error retrieving conversation ${req.params.id}:`, error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve conversation' });
  }
};

/**
 * POST /api/conversations
 * Create a new conversation thread
 */
export const createConversation = async (req, res) => {
  try {
    const { title, tone = 'Professional' } = req.body;

    if (tone && !ALLOWED_TONES.includes(tone)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tone. Allowed options: ${ALLOWED_TONES.join(', ')}`,
      });
    }

    const conversation = new Conversation({
      title: title && typeof title === 'string' && title.trim() ? title.trim() : 'New Conversation',
      tone: tone || 'Professional',
      messages: [],
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      data: {
        id: conversation._id.toString(),
        title: conversation.title,
        tone: conversation.tone,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error('[ConversationController] Error creating conversation:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
};

/**
 * DELETE /api/conversations/:id
 * Delete a conversation thread (Extra Feature 2)
 */
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid conversation ID format' });
    }

    const deleted = await Conversation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error(`[ConversationController] Error deleting conversation ${req.params.id}:`, error.message);
    res.status(500).json({ success: false, error: 'Failed to delete conversation' });
  }
};

/**
 * PATCH /api/conversations/:id/tone
 * Update tone preference for active conversation
 */
export const updateConversationTone = async (req, res) => {
  try {
    const { id } = req.params;
    const { tone } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid conversation ID format' });
    }

    if (!ALLOWED_TONES.includes(tone)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tone specified. Allowed options: ${ALLOWED_TONES.join(', ')}`,
      });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { tone },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: conversation._id.toString(),
        tone: conversation.tone,
      },
    });
  } catch (error) {
    console.error(`[ConversationController] Error updating tone:`, error.message);
    res.status(500).json({ success: false, error: 'Failed to update conversation tone' });
  }
};
