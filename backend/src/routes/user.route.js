import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getChatUsersController, getUser, resetPasswordController, updateProfile, verifyPasswordController } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router.put("/update-profile", protectedRoute, upload.single("avatar"), updateProfile);
router.get("/user", protectedRoute, getUser);
router.get("/getAllUsers", protectedRoute, getAllUsers);
router.get("/getChatUsers", protectedRoute, getChatUsersController);
router.post("/reset-password", resetPasswordController);
router.post("/verify-password", verifyPasswordController);

export default router;