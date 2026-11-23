import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { UserRole } from '@serviqa/shared';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  customerProfileId?: string;
  providerProfileId?: string;
  verificationStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  updateAvatar: (avatarDataUrl: string | null) => void;
  switchDemoUser: (role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('serviqa_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await ApiClient.get('/auth/me');
        const savedAvatar = localStorage.getItem(`serviqa_avatar_${profile.id}`);
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone || '',
          role: profile.role,
          avatar: savedAvatar || undefined,
          customerProfileId: profile.customerProfile?.id,
          providerProfileId: profile.providerProfile?.id,
          verificationStatus: profile.providerProfile?.verificationStatus,
        });
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('serviqa_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await ApiClient.post('/auth/login', { email, password });
    localStorage.setItem('serviqa_token', res.token);
    const savedAvatar = localStorage.getItem(`serviqa_avatar_${res.user.id}`);
    setUser({
      ...res.user,
      avatar: savedAvatar || undefined,
    });
  };

  const register = async (data: any) => {
    const res = await ApiClient.post('/auth/register', data);
    localStorage.setItem('serviqa_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('serviqa_token');
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      if (updatedData.avatar !== undefined) {
        if (updatedData.avatar) {
          localStorage.setItem(`serviqa_avatar_${prev.id}`, updatedData.avatar);
        } else {
          localStorage.removeItem(`serviqa_avatar_${prev.id}`);
        }
      }
      return updated;
    });
  };

  const updateAvatar = (avatarDataUrl: string | null) => {
    if (!user) return;
    if (avatarDataUrl) {
      localStorage.setItem(`serviqa_avatar_${user.id}`, avatarDataUrl);
    } else {
      localStorage.removeItem(`serviqa_avatar_${user.id}`);
    }
    setUser((prev) => (prev ? { ...prev, avatar: avatarDataUrl || undefined } : null));
  };

  const switchDemoUser = async (role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN') => {
    if (role === 'CUSTOMER') {
      await login('rahul.sharma@example.com', 'password123');
    } else if (role === 'PROVIDER') {
      await login('rajesh.ac@example.com', 'password123');
    } else if (role === 'ADMIN') {
      await login('admin@serviqa.com', 'admin123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        updateAvatar,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
