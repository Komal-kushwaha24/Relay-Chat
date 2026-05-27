import { Router } from 'express';
import { getUserConversations } from '../controllers/conversation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, getUserConversations);

export default router;
