"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, User } from "@/types/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on mount and listen for storage changes
  useEffect(() => {
    const loadUserFromStorage = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({
            ...parsedUser,
            token,
          });
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Load user on mount
    loadUserFromStorage();
    setIsLoading(false);

    // Listen for storage changes (e.g., when token is cleared by API client)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        if (!e.newValue) {
          // Token or user was removed
          setUser(null);
        } else {
          // Token or user was updated
          loadUserFromStorage();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (token: string, userData: User) => {
    const authUser: AuthUser = {
      ...userData,
      token,
    };

    setUser(authUser);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (userData: User) => {
    if (user) {
      const updatedUser = { ...userData, token: user.token };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
