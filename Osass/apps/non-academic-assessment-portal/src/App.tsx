import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const PendingApplicationsPage = lazy(() => import("@/pages/PendingApplicationsPage"));
const ApplicationHistoryPage = lazy(() => import("@/pages/ApplicationHistoryPage"));
const ApplicationReviewPage = lazy(() => import("@/pages/ApplicationReviewPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
