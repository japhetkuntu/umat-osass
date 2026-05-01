import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ReactNode, lazy, Suspense } from "react";
import Index from "./pages/Index";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import { RootLayout } from "@/components/layout/RootLayout";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Lazy load protected routes
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Eligibility = lazy(() => import("./pages/Eligibility"));
const EligibilityGuidance = lazy(() => import("./pages/EligibilityGuidance"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Application = lazy(() => import("./pages/Application"));
const TeachingSection = lazy(() => import("./pages/TeachingSection"));
const PublicationsSection = lazy(() => import("./pages/PublicationsSection"));
const ServiceSection = lazy(() => import("./pages/ServiceSection"));
const Review = lazy(() => import("./pages/Review"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const ApplicationProgress = lazy(() => import("./pages/ApplicationProgress"));
const ApplicationView = lazy(() => import("./pages/ApplicationView"));
const NotApproved = lazy(() => import("./pages/NotApproved"));
const PromotionHistory = lazy(() => import("./pages/PromotionHistory"));
const Settings = lazy(() => import("./pages/Settings"));
const Guidelines = lazy(() => import("./pages/Guidelines"));
const ScoreGuide = lazy(() => import("./pages/ScoreGuide"));
const StaffUpdates = lazy(() => import("./pages/StaffUpdates"));
const PromotionLetter = lazy(() => import("./pages/PromotionLetter"));
const Guide = lazy(() => import("./pages/Guide"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Authenticated Routes wrapped in RootLayout and ProtectedRoute */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <RootLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/change-password" element={<ChangePassword />} />
                          <Route path="/eligibility" element={<Eligibility />} />
                          <Route path="/eligibility-guidance" element={<EligibilityGuidance />} />
                          <Route path="/forecast" element={<Forecast />} />
                          <Route path="/application" element={<Application />} />
                          <Route path="/application/teaching" element={<TeachingSection />} />
                          <Route path="/application/publications" element={<PublicationsSection />} />
                          <Route path="/application/service" element={<ServiceSection />} />
                          <Route path="/application/view" element={<ApplicationView />} />
                          <Route path="/review" element={<Review />} />
                          <Route path="/confirmation" element={<Confirmation />} />
                          <Route path="/progress" element={<ApplicationProgress />} />
                          <Route path="/not-approved" element={<NotApproved />} />
                          <Route path="/promotion-history" element={<PromotionHistory />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/guidelines" element={<Guidelines />} />
                          <Route path="/score-guide" element={<ScoreGuide />} />
                          <Route path="/updates" element={<StaffUpdates />} />
                          <Route path="/promotion-letter/:applicationId?" element={<PromotionLetter />} />
                          <Route path="/guide" element={<Guide />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </RootLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
