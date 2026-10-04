import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CommitteeMemberInfo, StaffLoginMetaData, CommitteeMembership } from "@/types/assessment";
import { authService } from "@/services/authService";
import assessmentApi from "@/services/assessmentApi";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";

interface AuthUser extends StaffLoginMetaData {
  committees: CommitteeMembership[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to extract user from response
const extractUserData = (data: Partial<StaffLoginMetaData> & { metaData?: StaffLoginMetaData; rank?: string }): StaffLoginMetaData | null => {
  try {
    const meta = data.metaData;
    if (meta) return meta;

    if (data.id && data.email && data.fullName) {
      return {
        id: data.id,
        email: data.email,
        firstName: data.firstName || data.fullName.split(" ")[0],
        lastName: data.lastName || data.fullName.split(" ").pop() || "",
        fullName: data.fullName,
        position: data.position || data.rank || "Unknown",
        title: data.title || "",
        staffCategory: data.staffCategory || "",
        universityRole: data.universityRole || null,
        staffId: data.staffId || "",
      };
    }
    return null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchCommitteeInfo = async (): Promise<CommitteeMembership[] | null> => {
    try {
      const response = await assessmentApi.getMemberInfo();
      if (response.code >= 200 && response.code < 300 && response.data) {
        return response.data.committees || [];
      }
    } catch {
      console.error("Failed to fetch committee info");
    }
    return null;
  };

  const completeLogin = async (userData: StaffLoginMetaData | null): Promise<boolean> => {
    if (!userData) {
      toast.error("Unable to retrieve user information");
      authService.logout();
      return false;
    }

    const committees = await fetchCommitteeInfo();
    if (committees === null) {
      toast.error("Unable to load your committee memberships. Please try again.");
      authService.logout();
      return false;
    }

    if (committees.length === 0) {
      toast.error("You are not a member of any assessment committee");
      authService.logout();
      return false;
    }

    setUser({ ...userData, committees });
    setIsAuthenticated(true);
    return true;
  };

  useEffect(() => {
    const isSessionInvalid = (code: number) => code === 401 || code === 403;

    const checkAuth = async () => {
      try {
        if (!authService.getToken()) return;

        let profileRes = await authService.getProfile();
        if (!profileRes.success && !isSessionInvalid(profileRes.code)) {
          // Network error or 5xx: retry once before giving up, never clear the session for it.
          await new Promise((resolve) => setTimeout(resolve, 1500));
          profileRes = await authService.getProfile();
        }

        if (profileRes.success && profileRes.data) {
          const userData = extractUserData(profileRes.data);
          if (!userData) {
            authService.logout();
            return;
          }
          const committees = await fetchCommitteeInfo();
          if (committees === null) return;
          setUser({ ...userData, committees });
          setIsAuthenticated(true);
        } else if (isSessionInvalid(profileRes.code)) {
          authService.logout();
        }
      } catch {
        // Unexpected failure: leave stored tokens untouched
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data?.accessToken) {
        return await completeLogin(extractUserData(res.data));
      }
      toast.error(res.message || "Invalid credentials");
      return false;
    } catch (error) {
      toast.error("An unexpected error occurred during sign in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.loginWithGoogle(idToken);
      if (res.success && res.data?.accessToken) {
        return await completeLogin(extractUserData(res.data));
      }
      toast.error(res.message || "Unable to sign in with Google");
      return false;
    } catch (error) {
      toast.error("An unexpected error occurred during Google sign in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    queryClient.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
