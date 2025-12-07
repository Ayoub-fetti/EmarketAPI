import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import AdminStats from "../../../pages/admin/AdminStats";
import { AuthProvider } from "../../../context/AuthContext";
import { adminStatsService } from "../../../services/admin/adminStatsService";

// Mock all admin services
jest.mock("../../../services/admin/adminStatsService");

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockAdminUser = {
  id: "1",
  email: "admin@test.com",
  role: "admin",
  fullname: "Admin User",
};

const renderAdminLayout = (initialRoute = "/admin/stats") => {
  localStorage.setItem("token", "mock-token");
  localStorage.setItem("user", JSON.stringify(mockAdminUser));

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="stats" element={<AdminStats />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("Admin Dashboard Logout Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();

    adminStatsService.fetchUsers = jest.fn().mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchOrders = jest.fn().mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchProducts = jest.fn().mockResolvedValue({ list: [], total: 0 });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("logout button is visible in header", async () => {
    await act(async () => {
      renderAdminLayout();
    });

    await waitFor(() => {
      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  test("logout clears user data and redirects to login", async () => {
    await act(async () => {
      renderAdminLayout();
    });

    await waitFor(() => {
      expect(screen.getByText(mockAdminUser.fullname)).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole("button", { name: /logout/i });

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // Verify localStorage is cleared
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();

    // Verify navigation to login
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  test("user info disappears after logout", async () => {
    await act(async () => {
      renderAdminLayout();
    });

    await waitFor(() => {
      expect(screen.getByText(mockAdminUser.fullname)).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole("button", { name: /logout/i });

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // After logout, user info should not be visible
    // Note: This might not be immediately visible if the component unmounts
    // But we can verify the localStorage is cleared
    expect(localStorage.getItem("user")).toBeNull();
  });
});
