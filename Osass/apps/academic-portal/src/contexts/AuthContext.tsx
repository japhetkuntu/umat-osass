import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StaffLoginMetaData, EligibilityData, AuthState } from "../types/auth";
import { authService } from "../services/authService";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely extract user data from API response
const extractUserData = (data: any): StaffLoginMetaData | null => {
    try {
        const meta = data.metaData;
        if (meta) {
            return meta;
        }

        // Fallback: construct from response data
        if (data.id && data.email && data.fullName) {
            return {
                id: data.id,
                email: data.email,
                firstName: data.firstName || data.fullName.split(' ')[0],
                lastName: data.lastName || data.fullName.split(' ').pop() || '',
                fullName: data.fullName,
                position: data.position || data.rank || '',
                title: data.title || '',
                staffCategory: data.staffCategory || '',
                universityRole: data.universityRole || null,
                staffId: data.staffId || ''
            };
        }
        return null;
    } catch (error) {
        console.error("Error extracting user data:", error);
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        eligibility: null,
        token: authService.getToken(),
        isAuthenticated: !!authService.getToken(),
        isLoading: true,
    });
    const { toast } = useToast();

    const refreshProfile = async () => {
        try {
            const [profileRes, eligibilityRes] = await Promise.all([
                authService.getProfile(),
                authService.getEligibility(),
            ]);

            if (profileRes.success && profileRes.data) {
                const userData = extractUserData(profileRes.data);
                if (userData) {
                    setState((prev) => ({
                        ...prev,
                        user: userData,
                        eligibility: eligibilityRes.success ? eligibilityRes.data : null,
                        isAuthenticated: true,
                        isLoading: false,
                    }));
                } else {
                    throw new Error("Unable to extract user data from profile response");
                }
            } else {
                // Only logout if profile fetch definitively fails
                authService.logout();
                setState({
                    user: null,
                    eligibility: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            refreshProfile();
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
            const res = await authService.login(email, password);
            if (res.success && res.data) {
                const userData = extractUserData(res.data);
                if (!userData) {
                    throw new Error("Unable to extract user data from login response");
                }

                setState((prev) => ({
                    ...prev,
                    token: res.data.accessToken,
                    user: userData,
                    isAuthenticated: true,
                }));
                // Fetch eligibility after login
                await refreshProfile();
                return true;
            } else {
                toast({
                    title: "Login Failed",
                    description: res.message || "Invalid credentials",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error) {
            toast({
                title: "Login Error",
                description: "An unexpected error occurred during sign in.",
                variant: "destructive",
            });
            return false;
        } finally {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const logout = () => {
        authService.logout();
        setState({
            user: null,
            eligibility: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
