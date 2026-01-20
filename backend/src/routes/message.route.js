import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getConversationId, getMessages, getUnreadCounts, markAsRead } from '../controllers/message.controller.js';
const router = express.Router();

router.post("/getConversationId", protectedRoute, getConversationId);
router.post("/getMessages", protectedRoute, getMessages);
router.get("/getUnreadCounts", protectedRoute, getUnreadCounts);
router.put("/readMessages", protectedRoute, markAsRead);

export default router;