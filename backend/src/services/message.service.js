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
    const messages = await Messages.find({ conversationId }).sort({ createdAt: 1 }).select("senderId type content createdAt");
    return messages;
}