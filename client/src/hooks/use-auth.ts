import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, UserCredentials, RegisterData } from "@/types";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        // User is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: UserCredentials) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(credentials);
      setUser(userData);
      setLocation("/dashboard");
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const userData = await registerUser(data);
      setUser(userData);
      setLocation("/dashboard");
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.firstName}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement(
    AuthContext.Provider,
    { 
      value: {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      } 
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
