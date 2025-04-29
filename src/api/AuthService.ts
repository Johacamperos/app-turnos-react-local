import ApiService from "./ApiService";
import { User } from "../contexts/AuthContext";
import { jwtDecode } from 'jwt-decode';

class AuthService {

  // Login with email and password
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      
     return await ApiService.login(email, password).then((response) => {
        const decoded: any = jwtDecode(response.access_token);   
        return {
          user: decoded,
          token: response.access_token          
        }  
      });

    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid credentials. Please try again.");
    }
  }

  // Register with email and password
  static async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // For demonstration, we'll simulate a successful registration
      // In production, this would make an actual API call
      // return await ApiService.request<{ user: User; token: string }>("/auth/register", {
      //   method: "POST",
      //   body: JSON.stringify({ name, email, password }),
      // });
      
      // Mock successful registration (replace with real API call in production)
      return {
        user: {
          id: Date.now().toString(),
          name,
          email,
          role: "user",
          authProvider: "email",
        },
        token: "mock-jwt-token-" + Math.random().toString(36).substring(2),
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Registration failed. Please try again.");
    }
  }

  // Login with Google
  static async loginWithGoogle(): Promise<{ user: User; token: string }> {
    try {
      // In a real implementation, this would redirect to Google OAuth
      // and handle the callback, then process the returned tokens
      
      // Mock successful Google login
      return {
        user: {
          id: "google-" + Date.now().toString(),
          name: "Google User",
          email: "user@gmail.com",
          role: "user",
          authProvider: "google",
        },
        token: "mock-google-token-" + Math.random().toString(36).substring(2),
      };
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error("Google login failed. Please try again.");
    }
  }

  // Login with Azure AD
  static async loginWithAzure(): Promise<{ user: User; token: string }> {
    try {
      // In a real implementation, this would redirect to Azure AD OAuth
      // and handle the callback, then process the returned tokens
      
      // Mock successful Azure login
      return {
        user: {
          id: "azure-" + Date.now().toString(),
          name: "Azure User",
          email: "user@company.com",
          role: "user",
          authProvider: "azure",
        },
        token: "mock-azure-token-" + Math.random().toString(36).substring(2),
      };
    } catch (error) {
      console.error("Azure login error:", error);
      throw new Error("Azure login failed. Please try again.");
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      // In a real implementation, this might invalidate the token on the server
      // await ApiService.request("/auth/logout", { method: "POST" });
      
      // For now, we just resolve the promise
      return Promise.resolve();
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed.");
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      // In a real implementation, this would verify the token and return user data
      // return await ApiService.request<User>("/auth/me");
      
      // For demonstration, we'll just return null
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
}

export default AuthService;
