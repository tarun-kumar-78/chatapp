import express from "express";
import {
  loginController,
  logoutController,
  signupController,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/logout", logoutController);


export default router;
