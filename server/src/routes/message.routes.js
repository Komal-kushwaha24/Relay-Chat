import { Router } from 'express';
import { getMessages, sendMessage, undoMessage } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);
router.delete('/:messageId', protect, undoMessage);

export default router;
