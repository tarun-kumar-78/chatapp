import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getUser, updateProfile } from "../controllers/user.controller.js";
const router = express.Router();

router.put("/update-profile", protectedRoute, updateProfile);
router.get("/user", protectedRoute, getUser);
router.get("/getAllUsers", protectedRoute, getAllUsers);

export default router;