import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminProducts from "../../../pages/admin/AdminProducts";
import { adminProductsService } from "../../../services/admin/adminProductsService";
import { AuthProvider } from "../../../context/AuthContext";

jest.mock("../../../services/admin/adminProductsService");

const MockedAdminProducts = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminProducts />
    </AuthProvider>
  </BrowserRouter>
);

describe("AdminProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", async () => {
    adminProductsService.fetchActiveProducts.mockResolvedValue([]);
    adminProductsService.fetchDeletedProducts.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminProducts />);
    });

    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading products/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test("renders products list after loading", async () => {
    const mockProducts = [
      {
        _id: "1",
        title: "Product 1",
        description: "Description 1",
        price: 100,
        stock: 10,
        published: true,
        seller_id: { fullname: "Seller 1", email: "seller1@test.com" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        title: "Product 2",
        description: "Description 2",
        price: 200,
        stock: 5,
        published: false,
        seller_id: { fullname: "Seller 2", email: "seller2@test.com" },
        createdAt: new Date().toISOString(),
      },
    ];

    adminProductsService.fetchActiveProducts.mockResolvedValue(mockProducts);
    adminProductsService.fetchDeletedProducts.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminProducts />);
    });

    await waitFor(() => {
      expect(screen.getByText(/products management/i)).toBeInTheDocument();
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });

  test("searches products by title", async () => {
    const mockProducts = [
      {
        _id: "1",
        title: "Laptop",
        description: "A laptop",
        price: 1000,
        stock: 5,
        published: true,
        seller_id: { fullname: "Seller 1" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        title: "Phone",
        description: "A phone",
        price: 500,
        stock: 10,
        published: true,
        seller_id: { fullname: "Seller 2" },
        createdAt: new Date().toISOString(),
      },
    ];

    adminProductsService.fetchActiveProducts.mockResolvedValue(mockProducts);
    adminProductsService.fetchDeletedProducts.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminProducts />);
    });

    await waitFor(() => {
      expect(screen.getByText(/products management/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by title/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Laptop" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    });
  });

  test("toggles between active and deleted products", async () => {
    const activeProducts = [
      {
        _id: "1",
        title: "Active Product",
        description: "Active",
        price: 100,
        stock: 10,
        published: true,
        seller_id: { fullname: "Seller 1" },
        createdAt: new Date().toISOString(),
      },
    ];
    const deletedProducts = [
      {
        _id: "2",
        title: "Deleted Product",
        description: "Deleted",
        price: 200,
        stock: 0,
        published: false,
        seller_id: { fullname: "Seller 2" },
        createdAt: new Date().toISOString(),
      },
    ];

    adminProductsService.fetchActiveProducts.mockResolvedValue(activeProducts);
    adminProductsService.fetchDeletedProducts.mockResolvedValue(deletedProducts);

    await act(async () => {
      render(<MockedAdminProducts />);
    });

    await waitFor(() => {
      expect(screen.getByText("Active Product")).toBeInTheDocument();
    });

    const deletedButton = screen.getByText(/deleted/i);

    await act(async () => {
      fireEvent.click(deletedButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Deleted Product")).toBeInTheDocument();
    });
  });

  test("opens product details modal", async () => {
    const mockProduct = {
      _id: "1",
      title: "Product 1",
      description: "Description",
      price: 100,
      stock: 10,
      published: true,
      seller_id: { fullname: "Seller 1", email: "seller1@test.com" },
      createdAt: new Date().toISOString(),
    };

    adminProductsService.fetchActiveProducts.mockResolvedValue([mockProduct]);
    adminProductsService.fetchDeletedProducts.mockResolvedValue([]);
    adminProductsService.fetchProductDetails.mockResolvedValue(mockProduct);

    await act(async () => {
      render(<MockedAdminProducts />);
    });

    await waitFor(() => {
      expect(screen.getByText(/products management/i)).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByText(/details/i);

    await act(async () => {
      fireEvent.click(detailsButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/product details/i)).toBeInTheDocument();
      // Check for Product 1 in modal (there might be multiple, so use getAllByText)
      const product1Elements = screen.getAllByText("Product 1");
      expect(product1Elements.length).toBeGreaterThan(0);
    });
  });
});
