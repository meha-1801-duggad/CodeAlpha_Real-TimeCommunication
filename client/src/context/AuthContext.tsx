import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  guestLogin: (name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, avatar: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('nexus_token');
            setToken(null);
          }
        } catch (err) {
          localStorage.removeItem('nexus_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem('nexus_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.register(name, email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem('nexus_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const guestLogin = async (name: string): Promise<boolean> => {
    try {
      const res = await api.createGuest(name);
      if (res.success && res.token && res.user) {
        localStorage.setItem('nexus_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name: string, avatar: string) => {
    try {
      const res = await api.updateProfile({ name, avatar });
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Update profile failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, guestLogin, logout, updateProfile }}>
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
