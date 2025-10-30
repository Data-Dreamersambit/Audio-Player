import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/Slices/userSlice";
import audioReducer from "../store/Slices/audioSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    audio: audioReducer,
  
  },
});