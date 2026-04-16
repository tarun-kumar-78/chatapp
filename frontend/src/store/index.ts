import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice';
import authReducer from './auth/authSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
