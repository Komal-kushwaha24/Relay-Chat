import { Router } from 'express';
import { getUserConversations, createConversation, deleteConversationForUser } from '../controllers/conversation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, getUserConversations);

router.post("/", protect, createConversation);

router.delete('/:conversationId', protect, deleteConversationForUser);

export default router;
