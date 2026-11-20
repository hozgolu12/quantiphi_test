import { Router } from 'express';
import { streamChat } from '../controllers/chatController.js';

const router = Router();

// Streaming endpoint
router.post('/', streamChat);

export default router;
