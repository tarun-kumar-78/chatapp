import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getConversationId, getMessages } from '../controllers/message.controller.js';
const router = express.Router();

router.post("/getConversationId", protectedRoute, getConversationId);
router.post("/getMessages", protectedRoute, getMessages);

export default router;