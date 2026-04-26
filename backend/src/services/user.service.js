import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/user.model.js"

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