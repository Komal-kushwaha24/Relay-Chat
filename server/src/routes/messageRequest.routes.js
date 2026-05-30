import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMessageRequests,
  createMessageRequest,
  acceptMessageRequest,
  deleteMessageRequest,
} from '../controllers/messageRequest.controller.js';

const router = Router();

router.get('/', protect, getMessageRequests);
router.post('/', protect, createMessageRequest);
router.post('/:requestId/accept', protect, acceptMessageRequest);
router.delete('/:requestId', protect, deleteMessageRequest);

export default router;
