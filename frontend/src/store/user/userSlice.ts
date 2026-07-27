import type { Message } from "@/type/message";
import type { User } from "@/type/user";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserChat {
    messages: Message[],
    loading: boolean,
}

interface ChatState {
    userMessages: Record<string, UserChat>
}

interface UserState {
    user: User | null
    selectedUser: User | null
    conversationId: string | null
    selectedUserMessages: ChatState
    unreadMessagesCount: { [Key: string]: number; }
}

const initialState: UserState = {
    user: null,
    selectedUser: null,
    conversationId: null,
    selectedUserMessages: { userMessages: {} },
    unreadMessagesCount: {},
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
        setConversationId: (state, action: PayloadAction<string>) => {
            state.conversationId = action.payload;
            state.unreadMessagesCount[action.payload] = 0;
        },
        setMessages: (state, action: PayloadAction<ChatState>) => {
            state.selectedUserMessages.userMessages = {
                ...state.selectedUserMessages.userMessages,
                ...action.payload.userMessages
            }
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