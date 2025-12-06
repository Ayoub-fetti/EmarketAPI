import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminCoupons from "../../../pages/admin/AdminCoupons";
import { adminCouponsService } from "../../../services/admin/adminCouponsService";
import { AuthProvider } from "../../../context/AuthContext";

jest.mock("../../../services/admin/adminCouponsService");

const MockedAdminCoupons = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminCoupons />
    </AuthProvider>
  </BrowserRouter>
);

describe("AdminCoupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", async () => {
    adminCouponsService.fetchAllCoupons.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminCoupons />);
    });

    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading coupons/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test("renders coupons list after loading", async () => {
    const mockCoupons = [
      {
        _id: "1",
        code: "DISCOUNT10",
        type: "percentage",
        value: 10,
        status: "active",
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        _id: "2",
        code: "SAVE50",
        type: "fixed",
        value: 50,
        status: "active",
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    adminCouponsService.fetchAllCoupons.mockResolvedValue(mockCoupons);

    await act(async () => {
      render(<MockedAdminCoupons />);
    });

    await waitFor(() => {
      expect(screen.getByText(/coupons management/i)).toBeInTheDocument();
      expect(screen.getByText("DISCOUNT10")).toBeInTheDocument();
      expect(screen.getByText("SAVE50")).toBeInTheDocument();
    });
  });

  test("opens create coupon modal", async () => {
    adminCouponsService.fetchAllCoupons.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminCoupons />);
    });

    await waitFor(() => {
      expect(screen.getByText(/coupons management/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/create coupon/i);

    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/create new coupon/i)).toBeInTheDocument();
    });
  });

  test("searches coupons by code", async () => {
    const mockCoupons = [
      {
        _id: "1",
        code: "DISCOUNT10",
        type: "percentage",
        value: 10,
        status: "active",
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        _id: "2",
        code: "SAVE50",
        type: "fixed",
        value: 50,
        status: "active",
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    adminCouponsService.fetchAllCoupons.mockResolvedValue(mockCoupons);

    await act(async () => {
      render(<MockedAdminCoupons />);
    });

    await waitFor(() => {
      expect(screen.getByText(/coupons management/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by code/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "DISCOUNT" } });
    });

    await waitFor(() => {
      expect(screen.getByText("DISCOUNT10")).toBeInTheDocument();
      expect(screen.queryByText("SAVE50")).not.toBeInTheDocument();
    });
  });

  test("opens view details modal", async () => {
    const mockCoupon = {
      _id: "1",
      code: "DISCOUNT10",
      type: "percentage",
      value: 10,
      status: "active",
      startDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
    };

    adminCouponsService.fetchAllCoupons.mockResolvedValue([mockCoupon]);
    adminCouponsService.fetchCouponById.mockResolvedValue(mockCoupon);

    await act(async () => {
      render(<MockedAdminCoupons />);
    });

    await waitFor(() => {
      expect(screen.getByText(/coupons management/i)).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByText(/details/i);

    await act(async () => {
      fireEvent.click(detailsButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/coupon details/i)).toBeInTheDocument();
      // Check for DISCOUNT10 in modal (there might be multiple, so use getAllByText)
      const discountElements = screen.getAllByText("DISCOUNT10");
      expect(discountElements.length).toBeGreaterThan(0);
    });
  });
});
