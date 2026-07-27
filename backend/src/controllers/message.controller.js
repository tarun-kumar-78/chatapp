import { deleteMessageService, getChatService, getOrCreatePrivateConversation, getUnreadMessagesCount, markMessagesAsRead, searchTextService, uploadImage } from "../services/message.service.js";

export const getConversationId = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId } = req.body;
        const conversation = await getOrCreatePrivateConversation(receiverId, userId);
        res.status(200).json({ conversationId: conversation.id });
    } catch (error) {
        console.error("Error fetching conversation ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// export const getMessages = async (req, res) => {
//     try {
//         const { conversationId } = req.body;
//         const userId = req.user.id;
//         const messages = await getPrivateMessages(conversationId, userId);
//         res.status(200).json({ success: true, messages });
//     } catch (error) {
//         console.error("Error fetching private messages:", error);
//         res.status(500).json({ success: false, error: "Internal server error" });
//     }
// }

export const getUnreadCounts = async (req, res) => {
    try {
        const userId = req.user.id;
        const unreadCounts = await getUnreadMessagesCount(userId);
        return res.status(200).json({ success: true, unreadCounts });
    } catch (err) {
        console.error("Error fetching unread message counts:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.body;
        await markMessagesAsRead(conversationId, req.user.id);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error marking messages as read:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export const shareImage = async (req, res) => {
    try {
        const data = req.body;
        const { file } = req;
        const imageUrl = await uploadImage(file, data);
        res.status(200).json({ success: true, message: "Image uploaded successfully", imageUrl, });
    } catch (err) {
        console.log("Error in uploading image controller", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const searchTextController = async (req, res) => {
    try {
        const { text } = req.body;
        const result = await searchTextService(text);
        return res.status(200).json({ success: true, res: result });
    } catch (err) {
        console.log("Error in search controller", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const getChatsController = async (req, res) => {
    try {
        const { lastMessageId } = req.query;
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { messages, hasMore, messageId } = await getChatService(conversationId, lastMessageId, userId);
        return res.status(200).json({ success: true, messages: messages, hasMore: hasMore, lastMessageId: messageId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const deleteMessageController = async (req, res) => {
    try {
        const messageIds = req.body;
        const userId = req.user.id;
        await deleteMessageService(messageIds, userId);
        return res.status(200).json({ success: true, messages: "Messages deleted successfully" });
    } catch (err) {
        console.error("Err in deleteMessageController", err);
        return res.status(500).json({ success: false, messages: "Internal Server Error" });
    }
}