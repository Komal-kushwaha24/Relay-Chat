import { Router } from 'express';
import { getUserConversations, createConversation } from '../controllers/conversation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, getUserConversations);

router.post("/", protect, createConversation);

export default router;
