import type { Message } from "@/type/message";
import type { User } from "@/type/user";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



interface UserState {
    user: User | null
    selectedUser: User | null
    conversationId: string | null
    selectedUserMessages: Message[];
    unreadMessagesCount: { [Key: string]: number; }
}

const initialState: UserState = {
    user: null,
    selectedUser: null,
    conversationId: null,
    selectedUserMessages: [],
    unreadMessagesCount: {}
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setSelectedUser: (state, action: PayloadAction<User>) => {
            state.selectedUser = action.payload;
        },
        setConversationId: (state, action: PayloadAction<string>) => {
            state.conversationId = action.payload;
            state.unreadMessagesCount[action.payload] = 0;
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.selectedUserMessages = action.payload;
        },
        setUnreadCount: (state, action: PayloadAction<{ [key: string]: number }>) => {
            state.unreadMessagesCount = action.payload;
        },
        incrementUnreadCount: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            if (state.unreadMessagesCount[conversationId]) {
                state.unreadMessagesCount[conversationId] += 1;
            } else {
                state.unreadMessagesCount[conversationId] = 1;
            }
        },
    }
});

export const { addUser, setSelectedUser, setConversationId, setMessages, setUnreadCount, incrementUnreadCount } = userSlice.actions;
export default userSlice.reducer;