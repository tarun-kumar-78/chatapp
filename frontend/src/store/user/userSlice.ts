import type { User } from "@/type/user";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



interface UserState {
    user: User | null
    selectedUser: User | null
    conversationId: string | null
    selectedUserMessages: [] | null;
}

const initialState: UserState = {
    user: null,
    selectedUser: null,
    conversationId: null,
    selectedUserMessages: []
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
        },
        setMessages: (state, action: PayloadAction<[]>) => {
            state.selectedUserMessages = action.payload;
        }
    }
});

export const { addUser, setSelectedUser, setConversationId, setMessages } = userSlice.actions;
export default userSlice.reducer;