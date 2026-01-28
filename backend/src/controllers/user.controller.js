
import { getUsersWithConversationId, updateUserProfile } from "../services/user.service.js";


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedData  = req.body;
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
