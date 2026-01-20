import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js"
import Messages from '../models/message.model.js';

export const getOrCreatePrivateConversation = async (userOneId, userTwoId) => {
    let conversation = await Conversation.findOne({ type: "private", participants: { $all: [userOneId, userTwoId], $size: 2 } });
    if (!conversation) {
        conversation = await Conversation.create({
            type: "private",
            participants: [userOneId, userTwoId],
            createdBy: userOneId
        });
    }
    return conversation;
}

export const getPrivateMessages = async (conversationId) => {
    const messages = await Messages.find({ conversationId }).sort({ createdAt: 1 }).select("conversationId senderId type content createdAt");
    return messages;
}

export const getUnreadMessagesCount = async (userId) => {
    const conversations = await Conversation.find({
        participants: userId,
    }).select("_id");

    const conversationIds = conversations.map(c => c._id);

    if (!conversationIds.length) return {};

    const results = await Messages.aggregate([
        {
            $match: {
                conversationId: { $in: conversationIds },
                senderId: { $ne: new mongoose.Types.ObjectId(userId) },
                isRead: false,
            },
        },
        {
            $group: {
                _id: "$conversationId",
                count: { $sum: 1 },
            },
        },
    ]);

    return results.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});
};

export const markMessagesAsRead = async (conversationId, userId) => {
    try {
        await Messages.updateMany(
            {
                conversationId: conversationId,
                senderId: { $ne: userId },
                isRead: false,
            },
            {
                $set: { isRead: true },
            }
        );

    } catch (err) {
        console.error("Error marking messages as read:", err);
        throw err;
    }
}

export const saveMessage = async (message, conversation, socket) => {
    try {
        const message = await Messages.create({
            conversationId: conversation._id,
            senderId: socket.userId,
            receiverId: msg.recieverId,
            type: msg.type,
            content: msg.content,
        });
        return message;
    } catch (err) {
        console.error("Error saving message:", err);
        throw err;
    }
}