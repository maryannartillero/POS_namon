import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    id: number;
    name: string;
    display_name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.me();
      if (response.data.status === "success") {
        setUser(response.data.data.user);
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.data.status === "success") {
        const { user, token } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);

        toast.success(`Welcome back, ${user.first_name}!`);
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.values(errors).forEach((messages: any) => {
          messages.forEach((message: string) => {
            toast.error(message);
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
