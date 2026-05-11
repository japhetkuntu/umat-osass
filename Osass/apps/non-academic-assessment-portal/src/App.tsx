import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PendingApplicationsPage from "@/pages/PendingApplicationsPage";
import ApplicationHistoryPage from "@/pages/ApplicationHistoryPage";
import ApplicationReviewPage from "@/pages/ApplicationReviewPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pending/:committeeType"
              element={
                <ProtectedRoute>
                  <PendingApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/:committeeType"
              element={
                <ProtectedRoute>
                  <ApplicationHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:applicationId"
              element={
                <ProtectedRoute>
                  <ApplicationReviewPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
