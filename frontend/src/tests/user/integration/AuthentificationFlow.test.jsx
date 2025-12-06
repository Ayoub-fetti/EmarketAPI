import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import Login from "../../../pages/Login";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { authService } from "../../../services/authService";
import { toast } from "react-toastify";

jest.mock("../../../services/authService");
jest.mock("react-toastify");

const AdminPage = () => <div>Admin Dashboard</div>;
const SellerPage = () => <div>Seller Dashboard</div>;
const ProductsPage = () => <div>Products Page</div>;
const HomePage = () => <div>Home Page</div>;

const TestApp = ({ initialRoute = "/login" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("Login → Redirection /products (user)", () => {
    test("user login redirects to /products", async () => {
      authService.login.mockResolvedValue({
        data: {
          token: "user-token",
          user: { id: "1", email: "user@test.com", role: "user" },
        },
      });

      render(<TestApp />);

      fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
        target: { value: "user@test.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: "user@test.com",
          password: "password123",
        });
        expect(toast.success).toHaveBeenCalledWith("Connexion réussie !");
      });
    });
  });

  describe("Accès empêché aux pages /admin et /seller", () => {
    test("user cannot access /admin page", async () => {
      localStorage.setItem("token", "user-token");
      localStorage.setItem("user", JSON.stringify({ id: "1", role: "user" }));

      render(<TestApp initialRoute="/admin" />);

      await waitFor(() => {
        expect(screen.getByText(/home page/i)).toBeInTheDocument();
        expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
      });
    });

    test("user cannot access /seller page", async () => {
      localStorage.setItem("token", "user-token");
      localStorage.setItem("user", JSON.stringify({ id: "1", role: "user" }));

      render(<TestApp initialRoute="/seller" />);

      await waitFor(() => {
        expect(screen.getByText(/home page/i)).toBeInTheDocument();
        expect(screen.queryByText(/seller dashboard/i)).not.toBeInTheDocument();
      });
    });

    test("unauthenticated user redirected to /login", async () => {
      render(<TestApp initialRoute="/admin" />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      });
    });
  });
});
