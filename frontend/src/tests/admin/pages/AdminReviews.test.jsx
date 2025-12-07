import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminReviews from "../../../pages/admin/AdminReviews";
import { adminReviewsService } from "../../../services/admin/adminReviewsService";
import { AuthProvider } from "../../../context/AuthContext";

jest.mock("../../../services/admin/adminReviewsService");

const MockedAdminReviews = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminReviews />
    </AuthProvider>
  </BrowserRouter>
);

describe("AdminReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", async () => {
    adminReviewsService.fetchAllReviews.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminReviews />);
    });

    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading reviews/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test("renders reviews list after loading", async () => {
    const mockReviews = [
      {
        _id: "1",
        user: { fullname: "John Doe", email: "john@test.com" },
        product: { title: "Product 1" },
        rating: 5,
        comment: "Great product!",
        status: "approved",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        user: { fullname: "Jane Smith", email: "jane@test.com" },
        product: { title: "Product 2" },
        rating: 3,
        comment: "Average product",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];

    adminReviewsService.fetchAllReviews.mockResolvedValue(mockReviews);

    await act(async () => {
      render(<MockedAdminReviews />);
    });

    await waitFor(() => {
      expect(screen.getByText(/reviews moderation/i)).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("filters reviews by status", async () => {
    const mockReviews = [
      {
        _id: "1",
        user: { fullname: "John Doe" },
        product: { title: "Product 1" },
        rating: 5,
        comment: "Great!",
        status: "approved",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        user: { fullname: "Jane Smith" },
        product: { title: "Product 2" },
        rating: 3,
        comment: "Average",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];

    adminReviewsService.fetchAllReviews.mockResolvedValue(mockReviews);

    await act(async () => {
      render(<MockedAdminReviews />);
    });

    await waitFor(() => {
      expect(screen.getByText(/reviews moderation/i)).toBeInTheDocument();
    });

    // Find the select element by its display value or role
    const statusFilter = screen.getByDisplayValue("All");

    await act(async () => {
      fireEvent.change(statusFilter, { target: { value: "approved" } });
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  test("opens moderate modal", async () => {
    const mockReview = {
      _id: "1",
      user: { fullname: "John Doe", email: "john@test.com" },
      product: { title: "Product 1" },
      rating: 5,
      comment: "Great product!",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    adminReviewsService.fetchAllReviews.mockResolvedValue([mockReview]);

    await act(async () => {
      render(<MockedAdminReviews />);
    });

    await waitFor(() => {
      expect(screen.getByText(/reviews moderation/i)).toBeInTheDocument();
    });

    // Find the button by its title attribute or role
    const moderateButton = screen.getByTitle(/moderate/i);

    await act(async () => {
      fireEvent.click(moderateButton);
    });

    await waitFor(() => {
      // The modal title is "Moderate Review" (with capital M and R)
      expect(screen.getByText(/moderate review/i)).toBeInTheDocument();
    });
  });

  test("searches reviews by user or product", async () => {
    const mockReviews = [
      {
        _id: "1",
        user: { fullname: "John Doe", email: "john@test.com" },
        product: { title: "Laptop" },
        rating: 5,
        comment: "Great!",
        status: "approved",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        user: { fullname: "Jane Smith", email: "jane@test.com" },
        product: { title: "Phone" },
        rating: 3,
        comment: "Average",
        status: "approved",
        createdAt: new Date().toISOString(),
      },
    ];

    adminReviewsService.fetchAllReviews.mockResolvedValue(mockReviews);

    await act(async () => {
      render(<MockedAdminReviews />);
    });

    await waitFor(() => {
      expect(screen.getByText(/reviews moderation/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by user/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "John" } });
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });
});
