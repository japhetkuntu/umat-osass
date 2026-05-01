import React from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface RootLayoutProps {
    children: React.ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // The ProtectedRoute handles authentication check, so user will be available here
    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar
                userName={user.fullName}
                userRank={user.position}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col transition-all duration-300 ml-20 sm:ml-64">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto pt-6 px-4 sm:px-8 pb-12 w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
