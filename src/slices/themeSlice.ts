
// src/slices/themeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ApiService from "../api/ApiService";
import { ThemeConfig, defaultTheme } from "../slices/themeDefaults";

// Estado inicial con el tema por defecto
const initialState: ThemeConfig = ApiService.getThemeFromLocalStorage() || defaultTheme;

// Thunk para cargar el tema desde el servidor
export const loadThemeFromServer = createAsyncThunk("theme/loadTheme", async () => {
  return await ApiService.fetchTheme();
});

// Thunk para actualizar el tema en el servidor y Redux
export const updateTheme = createAsyncThunk(
  "theme/updateTheme",
  async (themeData: Partial<ThemeConfig>) => {
    return await ApiService.updateTheme({
      ...defaultTheme,
      ...themeData,
      colors: {
        ...defaultTheme.colors,
        ...(themeData.colors || {}),
      },
    });
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeConfig>) => {
      return action.payload;
    },
    resetTheme: () => {
      ApiService.saveThemeLocally(defaultTheme);
      return defaultTheme;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemeFromServer.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        return action.payload;
      });
  },
});

export const { setTheme, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
