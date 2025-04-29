
// src/store.ts
import { configureStore } from "@reduxjs/toolkit";
import themeReducer, { loadThemeFromServer } from "../slices/themeSlice";
import authReducer from "../contexts/AuthContext";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
  },
});

store.dispatch(loadThemeFromServer()); // Cargar el tema al iniciar

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
