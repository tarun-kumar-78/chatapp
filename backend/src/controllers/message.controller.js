import { getOrCreatePrivateConversation, getPrivateMessages } from "../services/message.service.js";

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

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.body;
        const messages = await getPrivateMessages(conversationId);
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching private messages:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}