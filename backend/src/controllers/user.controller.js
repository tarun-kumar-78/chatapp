
import { getChatUsersService, getUsersWithConversationId, resetPasswordService, updateUserProfile, verifyPasswordService } from "../services/user.service.js";


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedData = req.body;
        const { file } = req;
        const updatedUser = await updateUserProfile(userId, updatedData, file);
        res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        console.log("Update profile controller error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getUser = (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await getUsersWithConversationId(req.user._id);
        res.status(200).json(users);
    } catch (err) {
        console.log("Get all users controller error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const getChatUsersController = async (req, res) => {
    try {
        const userId = req.user.id;
        const users = await getChatUsersService(userId);
        return res.json({ success: true, users: users })
    } catch (err) {
        console.log("Error in getChatUsers", err);
        return res.json({ success: false, message: "Internal Server Error" });
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });
        res.status(200).json({ success: true, message: "If email exists password reset link will send to your email" })
        await resetPasswordService(email);
    } catch (err) {
        console.error("Error in reset password controller", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const verifyPasswordController = async (req, res) => {
    try {
        const { password, token, email } = req.body;
        if (!password || !email || !token) res.status(400).json({ success: false, message: "All fields are required" });
        const response = await verifyPasswordService(password, token, email);
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}