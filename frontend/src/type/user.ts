export interface User {
    _id: string,
    name: string,
    email: string,
    password: string,
    avatar: string,
    isOnline: boolean,
    lastSeenAt: string | null,
    conversationId: string
}