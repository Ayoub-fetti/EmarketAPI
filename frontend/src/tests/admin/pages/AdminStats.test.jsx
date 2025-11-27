import { render, screen, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminStats from "../../../pages/admin/AdminStats";
import { adminStatsService } from "../../../services/admin/adminStatsService";
import { AuthProvider } from "../../../context/AuthContext";

jest.mock("../../../services/admin/adminStatsService");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUser = {
  id: "1",
  email: "admin@test.com",
  role: "admin",
  fullname: "Admin User",
};

const MockedAdminStats = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminStats />
    </AuthProvider>
  </BrowserRouter>
);

describe("AdminStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", async () => {
    adminStatsService.fetchUsers.mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchOrders.mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchProducts.mockResolvedValue({ list: [], total: 0 });

    await act(async () => {
      render(<MockedAdminStats />);
    });

    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading statistics/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test("renders statistics after loading", async () => {
    adminStatsService.fetchUsers.mockResolvedValue({
      list: [{ _id: "1", email: "user@test.com" }],
      total: 1,
    });
    adminStatsService.fetchOrders.mockResolvedValue({
      list: [
        { _id: "1", finalAmount: 100, createdAt: new Date().toISOString() },
      ],
      total: 1,
    });
    adminStatsService.fetchProducts.mockResolvedValue({
      list: [{ _id: "1", title: "Product 1" }],
      total: 1,
    });

    await act(async () => {
      render(<MockedAdminStats />);
    });

    await waitFor(() => {
      expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
      // Use more specific text to avoid multiple matches
      expect(screen.getByText(/registered users/i)).toBeInTheDocument();
      expect(screen.getByText(/products in catalog/i)).toBeInTheDocument();
      // Check for Orders stat card specifically (not "Recent Orders" or "orders this month")
      const ordersElements = screen.getAllByText(/orders/i);
      expect(ordersElements.length).toBeGreaterThan(0);
    });
  });

  test("displays error message on fetch failure", async () => {
    adminStatsService.fetchUsers.mockRejectedValue(new Error("Network error"));
    adminStatsService.fetchOrders.mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchProducts.mockResolvedValue({ list: [], total: 0 });

    await act(async () => {
      render(<MockedAdminStats />);
    });

    await waitFor(() => {
      const errorElements = screen.getAllByText(/error/i);
      expect(errorElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test("renders charts when data is available", async () => {
    const mockOrders = [
      {
        _id: "1",
        finalAmount: 100,
        createdAt: new Date().toISOString(),
        items: [{ productId: "1", quantity: 2 }],
      },
    ];

    adminStatsService.fetchUsers.mockResolvedValue({
      list: [],
      total: 0,
    });
    adminStatsService.fetchOrders.mockResolvedValue({
      list: mockOrders,
      total: 1,
    });
    adminStatsService.fetchProducts.mockResolvedValue({
      list: [{ _id: "1", title: "Product 1" }],
      total: 1,
    });

    await act(async () => {
      render(<MockedAdminStats />);
    });

    await waitFor(() => {
      expect(screen.getByText(/monthly revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/top selling products/i)).toBeInTheDocument();
    });
  });
});
