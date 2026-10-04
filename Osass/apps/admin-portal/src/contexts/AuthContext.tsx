import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_EXPIRED_EVENT } from '@/services/apiClient';
import {
  adminLogin as apiLogin,
  adminLoginWithGoogle as apiLoginWithGoogle,
  adminLogout as apiLogout,
  getAdminProfile,
} from '@/services/api';
import type { AdminProfile } from '@/types';

interface AuthContextType {
  user: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  profileError: boolean;
  retryProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [profileAttempt, setProfileAttempt] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    apiLogout();
    setUser(null);
    setProfileError(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const onExpired = () => {
      clearSession();
      navigate('/login', { replace: true });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [clearSession, navigate]);

  // On mount (and on manual retry), check for an existing session
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const cached = localStorage.getItem('admin_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        // ignore parse errors
      }
    }

    let cancelled = false;
    getAdminProfile()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setUser(res.data);
          setProfileError(false);
          localStorage.setItem('admin_user', JSON.stringify(res.data));
        } else if (res.status === 401 || res.status === 403) {
          clearSession();
        } else {
          setProfileError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setProfileError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profileAttempt, clearSession]);

  const retryProfile = useCallback(() => {
    setProfileError(false);
    setProfileAttempt((n) => n + 1);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (res.success && res.data?.accessToken) {
      queryClient.clear();
      const profile = res.data.metaData ?? { id: '', email, firstName: '', lastName: '', role: '' };
      setUser(profile);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  }, [queryClient]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await apiLoginWithGoogle(idToken);
    if (res.success && res.data?.accessToken) {
      queryClient.clear();
      const profile = res.data.metaData ?? { id: '', email: '', firstName: '', lastName: '', role: '' };
      setUser(profile);
      return { success: true };
    }
    return { success: false, message: res.message || 'Google sign-in failed' };
  }, [queryClient]);

  const logout = useCallback(() => {
    clearSession();
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithGoogle, logout, profileError, retryProfile }}>
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
