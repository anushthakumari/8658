import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('freelancer-token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to authenticate user:', error);
          localStorage.removeItem('freelancer-token');
          localStorage.removeItem('freelancer-user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
      localStorage.setItem('freelancer-token', response.tokens.accessToken);
      localStorage.setItem('freelancer-refresh-token', response.tokens.refreshToken);
      localStorage.setItem('freelancer-user', JSON.stringify(response.user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(name, email, password);
      setUser(response.user);
      localStorage.setItem('freelancer-token', response.tokens.accessToken);
      localStorage.setItem('freelancer-refresh-token', response.tokens.refreshToken);
      localStorage.setItem('freelancer-user', JSON.stringify(response.user));
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('freelancer-token');
      localStorage.removeItem('freelancer-refresh-token');
      localStorage.removeItem('freelancer-user');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateMe(userData);
      setUser(updatedUser);
      localStorage.setItem('freelancer-user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};