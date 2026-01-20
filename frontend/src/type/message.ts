export interface Message {
    _id: string;
    senderId: string;
    recieverId: string;
    createdAt: string;
    content: string;
    type: string;
}