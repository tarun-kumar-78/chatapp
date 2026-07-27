import mongoose, { trusted } from "mongoose";
import { Conversation } from "../models/conversation.model.js"
import Messages from '../models/message.model.js';
import getConversationKey from "../utils/getConversationKey.js";
import { getEmbeddings } from "../utils/getEmbeddings.js";

export const getOrCreatePrivateConversation = async (userOneId, userTwoId) => {
    const key = getConversationKey(userOneId, userTwoId);
    let conversation = await Conversation.findOne({ conversationKey: key });
    if (!conversation) {
        conversation = await Conversation.create({
            type: "private",
            participants: [userOneId, userTwoId],
            conversationKey: key,
        })
    }
    return conversation;
}

// export const getPrivateMessages = async (conversationId, userId) => {
//     const messages = await Messages.find({ conversationId, deletedFor: { $ne: userId } }).sort({ createdAt: 1 }).select("conversationId senderId type content createdAt");
//     return messages;
// }

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

export const saveMessage = async (msg, conversation, socket) => {
    try {
        const vector = await getEmbeddings(msg.content);
        const message = await Messages.create({
            conversationId: conversation._id,
            senderId: socket.userId,
            receiverId: msg.recieverId,
            type: msg.type,
            content: msg.content,
            embeddings: vector
        });
        return message;
    } catch (err) {
        console.error("Error saving message:", err);
        throw err;
    }
}

export const updateLastMessage = async (message) => {
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(message.conversationId, {
            lastMessage: {
                messageId: message._id,
                senderId: message.senderId,
                content: message.content,
                type: message.type,
                createdAt: message.createdAt
            }
        }, { new: true });
    } catch (err) {
        console.error("Error updating last message:", err);
        throw err;
    }
}

export const uploadImage = async (file, data) => {
    try {
        const conversation = await getOrCreatePrivateConversation(data.senderId, data.receiverId);
        await Messages.create({
            conversationId: conversation.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            type: "image",
            content: file.path,
        })
        return file.path;
    } catch (err) {
        console.log("Send image error", err);
        throw err;
    }
}

export const searchTextService = async (text) => {
    try {
        const vector = await getEmbeddings(text);
        const result = await Messages.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embeddings",
                    queryVector: vector,
                    numCandidates: 100,
                    limit: 5
                }
            }
        ]);
        return result;
    } catch (err) {
        console.log("Error in search text service", err);
        return err;
    }
}


export const getChatService = async (chatId, lastMessageId, userId) => {
    try {
        const LIMIT = 15;
        const query = { conversationId: chatId, deletedFor: { $ne: userId } };
        if (lastMessageId) {
            query.createdAt = { $lt: new Date(lastMessageId) };
        }
        const messages = await Messages.find(query)
            .select("conversationId senderId type content createdAt")
            .sort({ createdAt: -1 }).lean();
        const hasMore = messages.length >= LIMIT;
        const slicedMessages = hasMore ? messages.slice(0, LIMIT) : messages;
        return { messages: slicedMessages.reverse(), hasMore, messageId: messages.length > 1 ? messages[messages.length - 1].createdAt : "" };
    } catch (err) {
        console.error("getChatService err", err);
        throw err;
    }
}

export const deleteMessageService = async (messageIds, userId) => {
    try {
        const messages = await Messages.updateMany({ _id: { $in: messageIds } }, { $addToSet: { deletedFor: userId } })
    } catch (err) {
        console.error("error in deleteMessageService", err);
        throw err;
    }
}