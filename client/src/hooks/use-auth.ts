import * as React from "react";
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

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [, setLocation] = React.useState("");
  const { toast } = useToast();

  const navigateTo = (path: string) => {
    // Simpler, more reliable navigation
    window.location.href = path;
  };

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Only set user to null if we get a 401 (not authenticated)
        // Don't clear user state for network errors or other issues
        if (error instanceof Error && error.message.includes('401')) {
          setUser(null);
        }
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
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
      // Navigate to dashboard after successful login
      navigateTo("/dashboard");
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
      navigateTo("/dashboard");
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
      navigateTo("/login");
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

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
