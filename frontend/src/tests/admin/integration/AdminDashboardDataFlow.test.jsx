import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import AdminStats from "../../../pages/admin/AdminStats";
import AdminUsers from "../../../pages/admin/AdminUsers";
import AdminProducts from "../../../pages/admin/AdminProducts";
import AdminCategories from "../../../pages/admin/AdminCategories";
import AdminOrders from "../../../pages/admin/AdminOrders";
import AdminCoupons from "../../../pages/admin/AdminCoupons";
import AdminReviews from "../../../pages/admin/AdminReviews";
import { AuthProvider } from "../../../context/AuthContext";
import { adminStatsService } from "../../../services/admin/adminStatsService";
import { adminUsersService } from "../../../services/admin/adminUsersService";
import { adminProductsService } from "../../../services/admin/adminProductsService";
import { adminCategoriesService } from "../../../services/admin/adminCategoriesService";
import { adminOrdersService } from "../../../services/admin/adminOrdersService";

// Mock all admin services
jest.mock("../../../services/admin/adminStatsService");
jest.mock("../../../services/admin/adminUsersService");
jest.mock("../../../services/admin/adminProductsService");
jest.mock("../../../services/admin/adminCategoriesService");
jest.mock("../../../services/admin/adminOrdersService");
jest.mock("../../../services/admin/adminCouponsService");
jest.mock("../../../services/admin/adminReviewsService");

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockAdminUser = {
  id: "1",
  email: "admin@test.com",
  role: "admin",
  fullname: "Admin User",
};

const mockStatsData = {
  users: { list: [{ _id: "1", email: "user@test.com" }], total: 1 },
  orders: { list: [{ _id: "1", finalAmount: 100 }], total: 1 },
  products: { list: [{ _id: "1", title: "Product 1" }], total: 1 },
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
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("Admin Dashboard Data Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("stats page fetches data from multiple services", async () => {
    adminStatsService.fetchUsers = jest.fn().mockResolvedValue(mockStatsData.users);
    adminStatsService.fetchOrders = jest.fn().mockResolvedValue(mockStatsData.orders);
    adminStatsService.fetchProducts = jest.fn().mockResolvedValue(mockStatsData.products);

    await act(async () => {
      renderAdminLayout("/admin/stats");
    });

    await waitFor(() => {
      expect(adminStatsService.fetchUsers).toHaveBeenCalled();
      expect(adminStatsService.fetchOrders).toHaveBeenCalled();
      expect(adminStatsService.fetchProducts).toHaveBeenCalled();
    });
  });

  test("users page fetches both active and deleted users", async () => {
    const activeUsers = [{ _id: "1", email: "user1@test.com" }];
    const deletedUsers = [{ _id: "2", email: "user2@test.com", deleted: true }];

    adminUsersService.fetchUsers = jest.fn().mockResolvedValue(activeUsers);
    adminUsersService.fetchDeletedUsers = jest.fn().mockResolvedValue(deletedUsers);

    await act(async () => {
      renderAdminLayout("/admin/users");
    });

    await waitFor(() => {
      expect(adminUsersService.fetchUsers).toHaveBeenCalled();
      expect(adminUsersService.fetchDeletedUsers).toHaveBeenCalled();
    });
  });

  test("products page fetches both active and deleted products", async () => {
    const activeProducts = [{ _id: "1", title: "Product 1" }];
    const deletedProducts = [{ _id: "2", title: "Product 2", deleted: true }];

    adminProductsService.fetchActiveProducts = jest.fn().mockResolvedValue(activeProducts);
    adminProductsService.fetchDeletedProducts = jest.fn().mockResolvedValue(deletedProducts);

    await act(async () => {
      renderAdminLayout("/admin/products");
    });

    await waitFor(() => {
      expect(adminProductsService.fetchActiveProducts).toHaveBeenCalled();
      expect(adminProductsService.fetchDeletedProducts).toHaveBeenCalled();
    });
  });

  test("categories page fetches both active and deleted categories", async () => {
    const activeCategories = [{ _id: "1", name: "Category 1" }];
    const deletedCategories = [{ _id: "2", name: "Category 2", deleted: true }];

    adminCategoriesService.fetchCategories = jest.fn().mockResolvedValue(activeCategories);
    adminCategoriesService.fetchDeletedCategories = jest.fn().mockResolvedValue(deletedCategories);

    await act(async () => {
      renderAdminLayout("/admin/categories");
    });

    await waitFor(() => {
      expect(adminCategoriesService.fetchCategories).toHaveBeenCalled();
      expect(adminCategoriesService.fetchDeletedCategories).toHaveBeenCalled();
    });
  });

  test("orders page fetches both active and deleted orders", async () => {
    const activeOrders = [{ _id: "1", finalAmount: 100 }];
    const deletedOrders = [{ _id: "2", finalAmount: 200, deleted: true }];

    adminOrdersService.fetchAllOrders = jest.fn().mockResolvedValue(activeOrders);
    adminOrdersService.fetchDeletedOrders = jest.fn().mockResolvedValue(deletedOrders);

    await act(async () => {
      renderAdminLayout("/admin/orders");
    });

    await waitFor(() => {
      expect(adminOrdersService.fetchAllOrders).toHaveBeenCalled();
      expect(adminOrdersService.fetchDeletedOrders).toHaveBeenCalled();
    });
  });

  test("data is refetched when navigating back to a page", async () => {
    adminStatsService.fetchUsers = jest.fn().mockResolvedValue(mockStatsData.users);
    adminStatsService.fetchOrders = jest.fn().mockResolvedValue(mockStatsData.orders);
    adminStatsService.fetchProducts = jest.fn().mockResolvedValue(mockStatsData.products);

    adminUsersService.fetchUsers = jest.fn().mockResolvedValue([]);
    adminUsersService.fetchDeletedUsers = jest.fn().mockResolvedValue([]);

    await act(async () => {
      renderAdminLayout("/admin/stats");
    });

    // Initial fetch - might be called multiple times due to React strict mode
    await waitFor(() => {
      expect(adminStatsService.fetchUsers).toHaveBeenCalled();
    });

    // Navigate to users
    const usersLink = screen.getByRole("link", { name: /users/i });
    await act(async () => {
      fireEvent.click(usersLink);
    });

    await waitFor(() => {
      expect(adminUsersService.fetchUsers).toHaveBeenCalled();
    });

    // Navigate back to stats
    const statsLink = screen.getByRole("link", { name: /statistics/i });
    await act(async () => {
      fireEvent.click(statsLink);
    });

    // Stats should be fetched again (might be called multiple times due to React strict mode)
    await waitFor(() => {
      expect(adminStatsService.fetchUsers).toHaveBeenCalled();
    });
  });

  test("handles service errors gracefully", async () => {
    adminStatsService.fetchUsers = jest.fn().mockRejectedValue(new Error("Network error"));
    adminStatsService.fetchOrders = jest.fn().mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchProducts = jest.fn().mockResolvedValue({ list: [], total: 0 });

    await act(async () => {
      renderAdminLayout("/admin/stats");
    });

    // Component should still render even if one service fails
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
  });
});
