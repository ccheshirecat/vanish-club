"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import Cookies from 'js-cookie';

type User = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar: string | null;
  isVendor: boolean;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth token...");
        const token = Cookies.get('token');
        if (!token) {
          console.log("No token found");
          setIsLoading(false);
          return;
        }

        console.log("Fetching user data...");
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (response.ok) {
          console.log("User data received:", data.user);
          setUser(data.user);
        } else {
          console.log("Auth failed:", data.error);
          Cookies.remove('token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        Cookies.remove('token');
      } finally {
        console.log("Setting loading to false");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

