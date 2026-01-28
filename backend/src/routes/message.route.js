import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getConversationId, getMessages, getUnreadCounts, markAsRead, shareImage } from '../controllers/message.controller.js';
import { upload } from '../middleware/multer.middleware.js';
const router = express.Router();

router.post("/getConversationId", protectedRoute, getConversationId);
router.post("/getMessages", protectedRoute, getMessages);
router.get("/getUnreadCounts", protectedRoute, getUnreadCounts);
router.put("/readMessages", protectedRoute, markAsRead);
router.post("/share-image", protectedRoute, upload.single("image"), shareImage);

export default router;