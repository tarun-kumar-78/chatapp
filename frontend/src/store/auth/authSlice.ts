import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: false,
    },
    reducers: {
        setLogin: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setLogout: (state, action) => {
            state.isAuthenticated = action.payload;
        }

    }
});

export const { setLogin, setLogout } = authSlice.actions;
export default authSlice.reducer;