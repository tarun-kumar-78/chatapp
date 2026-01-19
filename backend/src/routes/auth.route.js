import express from "express";
import {
  checkAuth,
  getAllUsers,
  getUser,
  loginController,
  logoutController,
  signupController,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.put("/update-profile", protectedRoute, updateProfile);
router.get("/check", protectedRoute, checkAuth);
router.get("/user", protectedRoute, getUser);
router.get("/getAllUsers", protectedRoute, getAllUsers);

export default router;
