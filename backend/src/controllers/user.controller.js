import cloudinary from "../lib/cloudinary.js";
import { User } from "../models/user.model.js";
import { getUsersWithConversationId } from "../services/user.service.js";


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic)
            return res.status(400).json({ success: false, message: "Select a profile picture" });
        const response = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: response.secure_url }, { new: true });
        return res.status(200).json({ suceess: true, message: "User updated successfully", user: updatedUser });
    } catch (err) {
        console.log("Failed to update user", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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
