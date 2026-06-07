import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMessageRequests,
  getSentMessageRequests,
  createMessageRequest,
  acceptMessageRequest,
  cancelSentMessageRequest,
  deleteMessageRequest,
} from '../controllers/messageRequest.controller.js';

const router = Router();

router.get('/', protect, getMessageRequests);
router.post('/', protect, createMessageRequest);
router.get('/sent', protect, getSentMessageRequests);
router.delete('/sent/:requestId', protect, cancelSentMessageRequest);
router.post('/:requestId/accept', protect, acceptMessageRequest);
router.delete('/:requestId', protect, deleteMessageRequest);

export default router;
