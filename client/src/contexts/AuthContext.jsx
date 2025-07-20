import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Read API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
      setUser(null);
    }
    
  }, [token]);

  // Helper function to safely parse JSON or return null
  const safeJsonParse = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJsonParse(response);

      if (response.ok && data) {
        setUser(data);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await safeJsonParse(response);

      if (response.ok && data) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        toast.success("Welcome back!");
      } else {
        const errorMsg = data?.error || "Login failed";
        throw new Error(errorMsg);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await safeJsonParse(response);

      if (response.ok && data) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        toast.success("Account created successfully!");
      } else {
        const errorMsg = data?.error || "Registration failed";
        throw new Error(errorMsg);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      toast.info("You have been logged out");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
