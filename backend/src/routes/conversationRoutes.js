import { Router } from 'express';
import {
  getAllConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  updateConversationTone,
} from '../controllers/conversationController.js';

const router = Router();

router.get('/', getAllConversations);
router.post('/', createConversation);
router.get('/:id', getConversationById);
router.delete('/:id', deleteConversation);
router.patch('/:id/tone', updateConversationTone);

export default router;
