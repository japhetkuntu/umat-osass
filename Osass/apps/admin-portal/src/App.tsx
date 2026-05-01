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
import StaffPage from "./pages/StaffPage";
import AcademicStaffPage from "./pages/AcademicStaffPage";
import NonAcademicStaffPage from "./pages/NonAcademicStaffPage";
import AcademicPositionsPage from "./pages/AcademicPositionsPage";
import ServicePositionsPage from "./pages/ServicePositionsPage";
import PublicationTypesPage from "./pages/PublicationTypesPage";
import CommitteesPage from "./pages/CommitteesPage";
import StaffUpdatesPage from "./pages/StaffUpdatesPage";
import AuditLogsPage from "./pages/AuditLogsPage";import NonAcademicCommitteesPage from './pages/NonAcademicCommitteesPage';
import NonAcademicPositionsPage from './pages/NonAcademicPositionsPage';
import UnitsSectionsPage from './pages/UnitsSectionsPage';
import KnowledgeMaterialTypesPage from './pages/KnowledgeMaterialTypesPage';
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
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/schools" element={<ProtectedRoute><SchoolsPage /></ProtectedRoute>} />
              <Route path="/faculties" element={<ProtectedRoute><FacultiesPage /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
              <Route path="/academic-staff" element={<ProtectedRoute><AcademicStaffPage /></ProtectedRoute>} />
              <Route path="/non-academic-staff" element={<ProtectedRoute><NonAcademicStaffPage /></ProtectedRoute>} />
              <Route path="/academic-positions" element={<ProtectedRoute><AcademicPositionsPage /></ProtectedRoute>} />
              <Route path="/service-positions" element={<ProtectedRoute><ServicePositionsPage /></ProtectedRoute>} />
              <Route path="/publication-types" element={<ProtectedRoute><PublicationTypesPage /></ProtectedRoute>} />
              <Route path="/committees" element={<ProtectedRoute><CommitteesPage /></ProtectedRoute>} />
              <Route path="/staff-updates" element={<ProtectedRoute><StaffUpdatesPage /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
              <Route path="/non-academic-committees" element={<ProtectedRoute><NonAcademicCommitteesPage /></ProtectedRoute>} />
              <Route path="/non-academic-positions" element={<ProtectedRoute><NonAcademicPositionsPage /></ProtectedRoute>} />
              <Route path="/units-sections" element={<ProtectedRoute><UnitsSectionsPage /></ProtectedRoute>} />
              <Route path="/knowledge-material-types" element={<ProtectedRoute><KnowledgeMaterialTypesPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
