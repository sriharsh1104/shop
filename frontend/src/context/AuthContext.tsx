import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userService, getAuthToken, setAuthToken, clearAuthToken } from '../services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    userService
      .getMe()
      .then(({ user }) => setUserState(user))
      .catch(() => {
        clearAuthToken();
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUserState(newUser);
  };

  const logout = async () => {
    try {
      if (getAuthToken()) {
        await userService.logout();
      }
    } catch {
      // Clear local session even if API fails
    } finally {
      clearAuthToken();
      setToken(null);
      setUserState(null);
    }
  };

  const setUser = (updated: User) => setUserState(updated);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
