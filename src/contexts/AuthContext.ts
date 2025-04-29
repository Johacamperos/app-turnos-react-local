
import React, { createContext, useContext, useEffect, useState } from "react";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AuthService from "../api/AuthService";
import ApiService from "@/api/ApiService";

// Define user type
export interface User {
  id: string;
  name: string;
  counter: string;
  advisorId: string;
  userId: string;
  email: string;
  role: "user" | "admin";
  authProvider?: "email" | "google" | "azure";
}

// Define authentication state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
export const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user")),
  token: localStorage.getItem("auth_token"),
  isAuthenticated: !!localStorage.getItem("auth_token"),
  loading: false,
  error: null,
};




// Async thunks for authentication
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(email, password);    
      localStorage.setItem("auth_token", response.token);
      const user = await ApiService.me();  
      console.log(user);
              
      localStorage.setItem("user", JSON.stringify(user.data)); // Store user data in local storage
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await AuthService.register(name, email, password);
      localStorage.setItem("auth_token", response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const loginWithGoogle = createAsyncThunk("auth/loginWithGoogle", async (_, { rejectWithValue }) => {
  try {
    const response = await AuthService.loginWithGoogle();
    localStorage.setItem("auth_token", response.token);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Google login failed");
  }
});

export const loginWithAzure = createAsyncThunk("auth/loginWithAzure", async (_, { rejectWithValue }) => {
  try {
    const response = await AuthService.loginWithAzure();
    localStorage.setItem("auth_token", response.token);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Azure login failed");
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await AuthService.logout();
    localStorage.removeItem("auth_token");
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message || "Logout failed");
  }
});

// Auth slice
const AuthContext = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: any; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ user: any; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action: PayloadAction<{ user: any; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Azure login
      .addCase(loginWithAzure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithAzure.fulfilled, (state, action: PayloadAction<{ user: any; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginWithAzure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = AuthContext.actions;
export default AuthContext.reducer;
