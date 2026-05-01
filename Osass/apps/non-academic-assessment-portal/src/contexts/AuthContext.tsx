import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CommitteeMemberInfo, StaffLoginMetaData, CommitteeMembership } from "@/types/assessment";
import { authService } from "@/services/authService";
import assessmentApi from "@/services/assessmentApi";
import { toast } from "sonner";

interface AuthUser extends StaffLoginMetaData {
  committees: CommitteeMembership[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to extract user from response
const extractUserData = (data: any): StaffLoginMetaData | null => {
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

  const fetchCommitteeInfo = async (): Promise<CommitteeMembership[]> => {
    try {
      const response = await assessmentApi.getMemberInfo();
      if (response.code >= 200 && response.code < 300 && response.data) {
        return response.data.committees || [];
      }
    } catch {
      console.error("Failed to fetch committee info");
    }
    return [];
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const profileRes = await authService.getProfile();
          if (profileRes.success && profileRes.data) {
            const userData = extractUserData(profileRes.data);
            if (userData) {
              const committees = await fetchCommitteeInfo();
              setUser({ ...userData, committees });
              setIsAuthenticated(true);
            } else {
              authService.logout();
            }
          } else {
            authService.logout();
          }
        } catch {
          authService.logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data?.accessToken) {
        const userData = extractUserData(res.data);
        if (!userData) {
          toast.error("Unable to retrieve user information");
          return false;
        }

        const committees = await fetchCommitteeInfo();
        
        if (committees.length === 0) {
          toast.error("You are not a member of any assessment committee");
          authService.logout();
          setIsLoading(false);
          return false;
        }

        setUser({ ...userData, committees });
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        toast.error(res.message || "Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      toast.error("An unexpected error occurred during sign in");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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
