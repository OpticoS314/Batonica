import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
  avatarUrl: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  loginAsAdmin: (email?: string, password?: string) => boolean;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AUTH_STORAGE_KEY = 'botanica_admin_auth_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const loginAsAdmin = (email: string = 'admin@botanica.com') => {
    const adminProfile: AdminUser = {
      email,
      name: 'Nursery Admin',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
    setUser(adminProfile);
    setShowLoginModal(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: !!user && user.role === 'admin',
        loginAsAdmin,
        logout,
        showLoginModal,
        setShowLoginModal
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
