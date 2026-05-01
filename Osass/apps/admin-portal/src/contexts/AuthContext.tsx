import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { adminLogin as apiLogin, adminLogout as apiLogout, getAdminProfile } from '@/services/api';
import type { AdminProfile } from '@/types';

interface AuthContextType {
  user: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing session
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Try to load from cached user first, then verify with server
    const cached = localStorage.getItem('admin_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        // ignore parse errors
      }
    }

    getAdminProfile()
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('admin_user', JSON.stringify(res.data));
        } else {
          // Token invalid
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          setUser(null);
        }
      })
      .catch(() => {
        // Keep cached user if network error
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (res.success && res.data?.accessToken) {
      const profile = res.data.metaData ?? { id: '', email, firstName: '', lastName: '', role: '' };
      setUser(profile);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
