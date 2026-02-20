/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponseDto } from '../services/auth/authService';

interface AuthContextType {
  user: { userId: string; email: string; role: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuthData: (data: AuthResponseDto) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ userId: string; email: string; role: string } | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser && localStorage.getItem('token') ? JSON.parse(storedUser) : null;
  });

  const setAuthData = (data: AuthResponseDto) => {
    localStorage.setItem('token', data.token);
    
    const userData = { userId: data.userId, email: data.email, role: data.role };
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(data.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      setAuthData,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
