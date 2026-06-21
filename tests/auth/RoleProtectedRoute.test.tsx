import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import { MemoryRouter, Routes, Route } from "react-router-dom";
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useToast hook (since RoleProtectedRoute calls it)
vi.mock("@/frontend/src/hooks/use-toast", () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

describe("RoleProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      role: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RoleProtectedRoute allowedRoles={["mentor"]}>
          <div>Restricted Content</div>
        </RoleProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Checking authorization...")).toBeInTheDocument();
    expect(screen.queryByText("Restricted Content")).not.toBeInTheDocument();
  });

  it("should redirect to /auth when user is unauthenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      role: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/mentor"]}>
        <Routes>
          <Route
            path="/mentor"
            element={
              <RoleProtectedRoute allowedRoles={["mentor"]}>
                <div>Restricted Content</div>
              </RoleProtectedRoute>
            }
          />
          <Route path="/auth" element={<div>Auth Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Auth Login Screen")).toBeInTheDocument();
    expect(screen.queryByText("Restricted Content")).not.toBeInTheDocument();
  });

  it("should redirect to /dashboard when user does not have allowed role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" } as any,
      session: {} as any,
      loading: false,
      role: "student",
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Content</div>
              </RoleProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Dispatcher</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard Dispatcher")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("should render children when user has an allowed role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" } as any,
      session: {} as any,
      loading: false,
      role: "mentor",
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RoleProtectedRoute allowedRoles={["mentor", "admin"]}>
          <div>Mentor Content</div>
        </RoleProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Mentor Content")).toBeInTheDocument();
  });
});
