import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);

  // Fetch current user info
  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      setError(null);
    } catch (err) {
      console.error('Auth error:', err.response?.data || err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      setError('Session expired. Please login again.');
      toast.error('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
      toast.success('Welcome back!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      toast.error(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', userData);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Account created successfully!');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      toast.error(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.info('You have been logged out');
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
