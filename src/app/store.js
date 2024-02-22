import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import authSliceReducer from "../features/auth/authSlice"
import conversationReducer from "../features/coversations/coversationSlice"
import messagesReducer from "../features/messages/messagesSlice"

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath] : apiSlice.reducer,
    auth : authSliceReducer,
    conversation : conversationReducer,
    messages : messagesReducer

  },
  devTools : process.env.NODE_ENV !== "production",
  middleware : (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});
