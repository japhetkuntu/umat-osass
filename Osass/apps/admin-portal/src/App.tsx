import { AdminLayout } from "@/components/layout/AdminLayout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SchoolsPage from "./pages/SchoolsPage";
import FacultiesPage from "./pages/FacultiesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import AcademicStaffPage from "./pages/AcademicStaffPage";
import NonAcademicStaffPage from "./pages/NonAcademicStaffPage";
import AcademicPositionsPage from "./pages/AcademicPositionsPage";
import ServiceCategoriesPage from "./pages/ServiceCategoriesPage";
import ServicePositionsPage from "./pages/ServicePositionsPage";
import PublicationTypesPage from "./pages/PublicationTypesPage";
import CommitteesPage from "./pages/CommitteesPage";
import StaffUpdatesPage from "./pages/StaffUpdatesPage";
import AuditLogsPage from "./pages/AuditLogsPage";import NonAcademicCommitteesPage from './pages/NonAcademicCommitteesPage';
import NonAcademicPositionsPage from './pages/NonAcademicPositionsPage';
import UnitsSectionsPage from './pages/UnitsSectionsPage';
import KnowledgeMaterialTypesPage from './pages/KnowledgeMaterialTypesPage';
import AdminsPage from './pages/AdminsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
              <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/schools" element={<SchoolsPage />} />
              <Route path="/faculties" element={<FacultiesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/academic-staff" element={<AcademicStaffPage />} />
              <Route path="/non-academic-staff" element={<NonAcademicStaffPage />} />
              <Route path="/academic-positions" element={<AcademicPositionsPage />} />
              <Route path="/service-categories" element={<ServiceCategoriesPage />} />
              <Route path="/service-positions" element={<ServicePositionsPage />} />
              <Route path="/publication-types" element={<PublicationTypesPage />} />
              <Route path="/committees" element={<CommitteesPage />} />
              <Route path="/staff-updates" element={<StaffUpdatesPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/non-academic-committees" element={<NonAcademicCommitteesPage />} />
              <Route path="/non-academic-positions" element={<NonAcademicPositionsPage />} />
              <Route path="/units-sections" element={<UnitsSectionsPage />} />
              <Route path="/knowledge-material-types" element={<KnowledgeMaterialTypesPage />} />
              <Route path="/admins" element={<ProtectedRoute requiredRole="SuperAdmin"><AdminsPage /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
