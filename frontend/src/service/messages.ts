import api from "./axios";

export const getChats = async (conversationId: string, lastMessageId: string) => {
    try {
        const response = await api.get(`/api/message/${conversationId}?lastMessageId=${lastMessageId}`)
        return response.data;
    } catch (err) {
        console.log(err)
    }
}