import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const auth = vi.hoisted(() => ({ isAuthenticated: true, isLoading: false, user: { role: "Admin" } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/components/layout/AdminSidebar", () => ({
  AdminSidebar: () => {
    const [expanded, setExpanded] = useState(false);
    return <button onClick={() => setExpanded(!expanded)}>{expanded ? "Expanded sidebar" : "Collapsed sidebar"}</button>;
  },
}));

const renderRoutes = (path = "/schools") => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/" element={<p>Dashboard page</p>} />
        <Route path="/schools" element={<Link to="/faculties">Go to faculties</Link>} />
        <Route path="/faculties" element={<p>Faculties page</p>} />
        <Route path="/admins" element={<ProtectedRoute requiredRole="SuperAdmin"><p>Admin management</p></ProtectedRoute>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe("shared admin route layout", () => {
  beforeEach(() => { auth.isAuthenticated = true; });

  it("preserves sidebar state when navigating between admin pages", async () => {
    renderRoutes();
    fireEvent.click(screen.getByText("Collapsed sidebar"));
    fireEvent.click(screen.getByText("Go to faculties"));
    expect(await screen.findByText("Faculties page")).toBeInTheDocument();
    expect(screen.getByText("Expanded sidebar")).toBeInTheDocument();
  });

  it("protects all routes in the shared layout", async () => {
    auth.isAuthenticated = false;
    renderRoutes();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Collapsed sidebar")).toBeNull();
  });

  it("retains the SuperAdmin restriction", async () => {
    renderRoutes("/admins");
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    expect(screen.queryByText("Admin management")).toBeNull();
  });
});
