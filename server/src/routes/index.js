import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import conversationRoutes from './conversation.routes.js';
import messageRoutes from './message.routes.js';
import cloudinaryRoutes from './cloudinary.routes.js';
import messageRequestRoutes from './messageRequest.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/cloudinary', cloudinaryRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages/requests', messageRequestRoutes);
router.use('/messages', messageRoutes);

export default router;
