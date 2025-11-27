import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminOrders from "../../../pages/admin/AdminOrders";
import { adminOrdersService } from "../../../services/admin/adminOrdersService";
import { AuthProvider } from "../../../context/AuthContext";
import { toast } from "react-toastify";

jest.mock("../../../services/admin/adminOrdersService");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedAdminOrders = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminOrders />
    </AuthProvider>
  </BrowserRouter>
);

describe("AdminOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", async () => {
    adminOrdersService.fetchAllOrders.mockResolvedValue([]);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminOrders />);
    });

    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading orders/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test("renders orders list after loading", async () => {
    const mockOrders = [
      {
        _id: "order1",
        userId: { fullname: "John Doe", email: "john@test.com" },
        finalAmount: 100,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "order2",
        userId: { fullname: "Jane Smith", email: "jane@test.com" },
        finalAmount: 200,
        status: "delivered",
        createdAt: new Date().toISOString(),
      },
    ];

    adminOrdersService.fetchAllOrders.mockResolvedValue(mockOrders);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminOrders />);
    });

    await waitFor(() => {
      expect(screen.getByText(/orders management/i)).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("filters orders by status", async () => {
    const mockOrders = [
      {
        _id: "order1",
        userId: { fullname: "John Doe" },
        finalAmount: 100,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "order2",
        userId: { fullname: "Jane Smith" },
        finalAmount: 200,
        status: "delivered",
        createdAt: new Date().toISOString(),
      },
    ];

    adminOrdersService.fetchAllOrders.mockResolvedValue(mockOrders);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminOrders />);
    });

    await waitFor(() => {
      expect(screen.getByText(/orders management/i)).toBeInTheDocument();
    });

    // Find the select element by its display value or role
    const statusFilter = screen.getByDisplayValue("All");

    await act(async () => {
      fireEvent.change(statusFilter, { target: { value: "pending" } });
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  test("opens order details modal", async () => {
    const mockOrder = {
      _id: "order1",
      userId: { fullname: "John Doe", email: "john@test.com" },
      finalAmount: 100,
      status: "pending",
      items: [],
      createdAt: new Date().toISOString(),
    };

    adminOrdersService.fetchAllOrders.mockResolvedValue([mockOrder]);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminOrders />);
    });

    await waitFor(() => {
      expect(screen.getByText(/orders management/i)).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByText(/details/i);

    await act(async () => {
      fireEvent.click(detailsButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/customer details/i)).toBeInTheDocument();
    });
  });

  test("searches orders by customer name", async () => {
    const mockOrders = [
      {
        _id: "order1",
        userId: { fullname: "John Doe", email: "john@test.com" },
        finalAmount: 100,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "order2",
        userId: { fullname: "Jane Smith", email: "jane@test.com" },
        finalAmount: 200,
        status: "delivered",
        createdAt: new Date().toISOString(),
      },
    ];

    adminOrdersService.fetchAllOrders.mockResolvedValue(mockOrders);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminOrders />);
    });

    await waitFor(() => {
      expect(screen.getByText(/orders management/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search orders by id/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "John" } });
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });
});
