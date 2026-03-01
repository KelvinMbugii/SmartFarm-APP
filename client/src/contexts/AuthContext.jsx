import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "@/services/api";
import { toast } from "sonner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);
  const socket = null;

  // // Axios interceptor to attach token to requests
  // useEffect(() => {
  //   api.interceptors.request.use((config) => {
  //     if (token) {
  //       config.headers.Authorization = `Bearer ${token}`;
  //     }
  //     return config;
  //   });
  // }, [token]);

  // Fetch current user info
  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
      setError(null);
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      setError("Session expired. Please login again.");
      toast.error("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Sync user when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  // // Initialize Socket.IO with token
  // useEffect(() => {
  //   if (token && user) {
  //     const newSocket = io("https://smartfarm-app.onrender.com", {
  //       auth: { token },
  //       transports: ["websocket"],
  //     });

  //     setSocket(newSocket);

  //     newSocket.on("connect", () => {
  //       console.log("Socket connected:", newSocket.id);
  //     });

  //     newSocket.on("disconnect", () => {
  //       console.log("Socket disconnected");
  //     });

  //     return () => {
  //       newSocket.disconnect();
  //     };
  //   }
  // }, [token, user]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setError(null);
      toast.success("Welcome back!");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      toast.error(err.response?.data?.error || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", userData);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success("Account created successfully!");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      toast.error(err.response?.data?.error || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/api/auth/forgot-password", { email });
    return data;
  }

  const resetPassword = async (tokenValue, password) => {
    const { data } = await api.post(`/api/auth/reset-password/${tokenValue}`,{
      password,
    });
    return data;
  }

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    toast.info("You have been logged out");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error,
        registerUser,
        forgotPassword,
        resetPassword,
        socket, // expose socket to other components
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
