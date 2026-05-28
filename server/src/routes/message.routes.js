import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;
