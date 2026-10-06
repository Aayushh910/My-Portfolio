import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('todo_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('todo_auth_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('todo_auth_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Session verification failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token]);

  const register = async (username, password, email) => {
    const res = await authService.register(username, password, email);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('todo_auth_token', res.token);
      localStorage.setItem('todo_auth_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('todo_auth_token', res.token);
      localStorage.setItem('todo_auth_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const googleLogin = async (payload) => {
    const res = await authService.googleAuth(payload);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('todo_auth_token', res.token);
      localStorage.setItem('todo_auth_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Google authentication failed');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('todo_auth_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        updateUser(res.user);
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        googleLogin,
        updateUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
