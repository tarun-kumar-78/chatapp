import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

export const signupController = async (req, res) => {
  const { email, name, password, avatar } = req.body;
  try {
    if (!email || !name || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered" });
    const hashedPass = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      email,
      name,
      password: hashedPass,
      lastSeenAt: Date.now(),
    });
    if (createdUser) {
      generateToken(createdUser._id, res);
      await createdUser.save();
      res
        .status(201)
        .json({ success: true, message: "User created successfully", user: createdUser });
    }
  } catch (err) {
    console.log("Failed to create user", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Incorrect email address" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(400).json({ success: false, message: "Incorrect password" });
    generateToken(user.id, res);
    return res.status(200).json({ success: true, message: "Login successfully", user: user });
  } catch (err) {
    console.log("Failed to login", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logoutController = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logout successfully" });
  } catch (err) {
    console.log("Failed to logout", err);
    res.status(500).json({ success: false, message: "Failed to logout" });
  }
};

