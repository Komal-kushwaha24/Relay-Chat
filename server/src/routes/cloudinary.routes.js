import { Router } from 'express';
import { getSignature } from '../controllers/cloudinary.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/signature', protect, getSignature);

export default router;
