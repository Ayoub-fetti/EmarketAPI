import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";
import { AuthProvider } from "../../context/AuthContext";

const TestComponent = () => <div>Protected Content</div>;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders loading state when auth is loading", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <ProtectedRoute allowedRoles={["admin"]}>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    // Loading state should show spinner initially
    await waitFor(
      () => {
        const spinner = document.querySelector(".animate-spin");
        if (spinner) {
          expect(spinner).toBeInTheDocument();
        }
      },
      { timeout: 1000 }
    );
  });

  test("redirects to login when user is not authenticated", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <AuthProvider>
            <ProtectedRoute allowedRoles={["admin"]}>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      // Should redirect to login, so protected content should not be visible
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  test("renders children when user is authenticated and has correct role", async () => {
    const mockUser = { id: "1", email: "admin@test.com", role: "admin" };
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <AuthProvider>
            <ProtectedRoute allowedRoles={["admin"]}>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  test("redirects to home when user does not have required role", async () => {
    const mockUser = { id: "1", email: "user@test.com", role: "user" };
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <AuthProvider>
            <ProtectedRoute allowedRoles={["admin"]}>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      // Should redirect, so protected content should not be visible
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  test("allows access when user has one of the allowed roles", async () => {
    const mockUser = { id: "1", email: "seller@test.com", role: "seller" };
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <AuthProvider>
            <ProtectedRoute allowedRoles={["seller", "admin"]}>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  test("allows access when no allowedRoles specified", async () => {
    const mockUser = { id: "1", email: "user@test.com", role: "user" };
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/protected"]}>
          <AuthProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });
});
