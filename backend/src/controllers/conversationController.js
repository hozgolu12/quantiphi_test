import { Conversation } from '../models/Conversation.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/conversations
 * Retrieve all past conversations for the History Sidebar
 */
export const getAllConversations = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim()) {
      query = {
        $or: [
          { title: { $regex: search.trim(), $options: 'i' } },
          { 'messages.content': { $regex: search.trim(), $options: 'i' } },
        ],
      };
    }

    const conversations = await Conversation.find(query)
      .select('title tone updatedAt createdAt messages')
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((conv) => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      return {
        id: conv._id.toString(),
        title: conv.title,
        tone: conv.tone,
        messageCount: conv.messages.length,
        lastMessageSnippet: lastMessage ? lastMessage.content.slice(0, 75) : '',
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('[ConversationController] Error getting conversations:', error);
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
    console.error(`[ConversationController] Error retrieving conversation ${req.params.id}:`, error);
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
    const conversation = new Conversation({
      title: title || 'New Conversation',
      tone: ['Professional', 'Casual', 'Concise'].includes(tone) ? tone : 'Professional',
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
    console.error('[ConversationController] Error creating conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
};

/**
 * DELETE /api/conversations/:id
 * Delete a conversation thread
 */
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Conversation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error(`[ConversationController] Error deleting conversation ${req.params.id}:`, error);
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

    if (!['Professional', 'Casual', 'Concise'].includes(tone)) {
      return res.status(400).json({ success: false, error: 'Invalid tone specified' });
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
    console.error(`[ConversationController] Error updating tone:`, error);
    res.status(500).json({ success: false, error: 'Failed to update conversation tone' });
  }
};
