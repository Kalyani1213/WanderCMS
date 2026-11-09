import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  travellerLookup: (email: string, enquiryId?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isTraveller: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  travellerLookup: async () => {},
  logout: async () => {},
  isAdmin: false,
  isTraveller: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const res = await api.getMe();
          setUser(res.user);
        }
      } catch (err) {
        api.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
  };

  const travellerLookup = async (email: string, enquiryId?: string) => {
    const res = await api.travellerLookup(email, enquiryId);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'staff-admin';
  const isTraveller = user?.role === 'traveller';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, travellerLookup, logout, isAdmin, isTraveller }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
