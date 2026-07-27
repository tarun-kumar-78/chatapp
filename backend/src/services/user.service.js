import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/user.model.js"
import crypto from 'crypto';
import { ResetPassword } from '../models/resetPassword.model.js';
import { sendEmail } from "../lib/emailConfig.js";
import bcrypt from "bcryptjs";

export const getUsersWithConversationId = async (userId) => {
    try {
        const users = await User.find({ _id: { $ne: userId } }).select("-password").lean();
        const conversations = await Conversation.find({ participants: userId });
        const conversationMap = {};
        conversations.forEach(conv => {
            const otherUser = conv.participants.find(
                id => id.toString() !== userId.toString()
            );

            conversationMap[otherUser.toString()] = conv._id.toString();
        });
        const usersWithConversationId = users.map(user => ({
            ...user,
            conversationId: conversationMap[user._id.toString()] || null
        }));
        return usersWithConversationId;
    } catch (err) {
        console.log("Error in getting users");
        throw err;
    }
}

export const updateUserProfile = async (userId, updatedData, file) => {
    try {
        const updatedPayload = { ...updatedData };
        if (file) {
            updatedPayload.avatar = file.path;
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedPayload },
            { new: true }
        );
        return updatedUser;
    } catch (err) {
        console.log("Error in updating profile service", err);
        throw err;
    }
}

export const getChatUsersService = async (userId) => {
    try {
        const conversations = await Conversation.find({ participants: userId });
        const allParticipants = conversations.flatMap(c => c.participants);
        const uniqueOtherUsers = [...new Set(allParticipants.filter(id => id.toString() !== userId.toString()))];
        return uniqueOtherUsers;
    } catch (err) {
        console.log("Error in getChatUsersService", err);
        throw err;
    }
}

export const resetPasswordService = async (email) => {
    try {
        const user = await User.findOne({ email: email }).lean();
        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${user.email}`
            await ResetPassword.create({
                user: user,
                token: hashedToken,
                expireAt: new Date(Date.now() + 15 * 60 * 1000),
            });
            await sendEmail(email, resetLink, user.name);

        }
    } catch (err) {
        console.error("Error in reset password service", err);
        throw err;
    }
}

export const verifyPasswordService = async (password, token, email) => {
    try {
        const user = await User.findOne({ email: email }).lean();
        if (!user) {
            throw new Error("User not found");
        }
        const dbHashedToken = await ResetPassword.findOne({ user: user._id }).lean();
        if (!dbHashedToken.token) {
            throw new Error("Token not found");
        }
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        if (hashedToken !== dbHashedToken.token) {
            throw new Error("Invalid Token");
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ _id: user._id }, {
            $set: { password: encryptedPassword }
        });
        await ResetPassword.deleteOne({ user: user._id });
        return { success: true, message: "Password reset successfully" };
    } catch (err) {
        console.error("Error in verify reset password token service", err);
        throw err;
    }
}