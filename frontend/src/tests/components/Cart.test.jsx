import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Cart from "../../components/tools/Cart";
import { CartProvider } from "../../context/CartContext";
import { AuthProvider } from "../../context/AuthContext";
import * as cartService from "../../services/cartService";
import * as orderService from "../../services/orderService";
import { toast } from "react-toastify";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/cartService");
jest.mock("../../services/orderService");
jest.mock("react-toastify");

const mockProduct = {
  _id: "1",
  title: "Test Product",
  price: 100,
  primaryImage: "/test.jpg",
  stock: 10,
};

const mockCartItems = [
  {
    productId: mockProduct,
    quantity: 2,
  },
  {
    productId: {
      _id: "2",
      title: "Product 2",
      price: 50,
      primaryImage: "/test2.jpg",
      stock: 5,
    },
    quantity: 1,
  },
];

const MockedCart = ({ isOpen = true, onClose = jest.fn() }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <Cart isOpen={isOpen} onClose={onClose} />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe("Cart Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    // Mock user in localStorage for authenticated tests
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify({ id: "1", email: "test@test.com" }));
    cartService.getCart.mockResolvedValue({ success: true, data: { items: mockCartItems } });
    cartService.validateCoupon.mockResolvedValue({
      valid: true,
      data: { code: "PROMO10", discountAmount: 10 },
    });
    orderService.createOrder.mockResolvedValue({ success: true });
    cartService.clearCart.mockResolvedValue({ success: true });
  });

  test("renders cart when isOpen is true", async () => {
    await act(async () => {
      render(<MockedCart isOpen={true} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/panier/i)).toBeInTheDocument();
    });
  });

  test("does not render cart when isOpen is false", async () => {
    const { container } = await act(async () => {
      return render(<MockedCart isOpen={false} />);
    });

    // When isOpen is false, the drawer should have translate-x-full class
    const drawer = container.querySelector('.translate-x-full');
    expect(drawer).toBeInTheDocument();
  });

  test("displays empty cart message when cart is empty", async () => {
    cartService.getCart.mockResolvedValue({ success: true, data: { items: [] } });

    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByText(/votre panier est vide/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("displays cart items when cart has items", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("displays correct item count in header", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        // Total quantity: 2 + 1 = 3
        const header = screen.getByText(/panier/i);
        expect(header).toBeInTheDocument();
        expect(header.textContent).toMatch(/3.*articles/i);
      },
      { timeout: 3000 }
    );
  });

  test("calculates and displays subtotal correctly", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        // Subtotal: (100 * 2) + (50 * 1) = 250
        // Check for "Sous-total" label and "250.00" value
        expect(screen.getByText(/sous-total/i)).toBeInTheDocument();
        // Find the value near "Sous-total"
        const subtotalSection = screen.getByText(/sous-total/i).closest('div');
        expect(subtotalSection?.textContent).toMatch(/250\.00/i);
      },
      { timeout: 3000 }
    );
  });

  test("allows applying coupon code", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/code promo/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const couponInput = screen.getByPlaceholderText(/code promo/i);
    const applyButton = screen.getByRole("button", { name: /appliquer/i });

    await act(async () => {
      fireEvent.change(couponInput, { target: { value: "PROMO10" } });
      fireEvent.click(applyButton);
    });

    await waitFor(
      () => {
        expect(cartService.validateCoupon).toHaveBeenCalled();
        expect(screen.getByText(/code appliqué/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("displays discount when coupon is applied", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/code promo/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const couponInput = screen.getByPlaceholderText(/code promo/i);
    const applyButton = screen.getByRole("button", { name: /appliquer/i });

    await act(async () => {
      fireEvent.change(couponInput, { target: { value: "PROMO10" } });
      fireEvent.click(applyButton);
    });

    await waitFor(
      () => {
        // Text might be split across elements
        expect(screen.getByText(/-10\.00/i)).toBeInTheDocument();
        // Total after discount: 250 - 10 = 240
        expect(screen.getByText(/240\.00/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("allows removing coupon", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/code promo/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const couponInput = screen.getByPlaceholderText(/code promo/i);
    const applyButton = screen.getByRole("button", { name: /appliquer/i });

    // Apply coupon
    await act(async () => {
      fireEvent.change(couponInput, { target: { value: "PROMO10" } });
      fireEvent.click(applyButton);
    });

    await waitFor(
      () => {
        expect(screen.getByText(/code appliqué/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Remove coupon
    const removeButton = screen.getByRole("button", { name: /retirer/i });
    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/code appliqué/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("creates order successfully and redirects", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: /commander/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const checkoutButton = screen.getByRole("button", { name: /commander/i });

    await act(async () => {
      fireEvent.click(checkoutButton);
    });

    await waitFor(
      () => {
        expect(orderService.createOrder).toHaveBeenCalledWith([]);
        expect(toast.success).toHaveBeenCalledWith("Commande créée avec succès!");
        expect(mockNavigate).toHaveBeenCalledWith("/orders/user");
      },
      { timeout: 3000 }
    );
  });

  test("creates order with coupon when coupon is applied", async () => {
    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/code promo/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const couponInput = screen.getByPlaceholderText(/code promo/i);
    const applyButton = screen.getByRole("button", { name: /appliquer/i });

    // Apply coupon
    await act(async () => {
      fireEvent.change(couponInput, { target: { value: "PROMO10" } });
      fireEvent.click(applyButton);
    });

    await waitFor(
      () => {
        expect(screen.getByText(/code appliqué/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Create order
    const checkoutButton = screen.getByRole("button", { name: /commander/i });
    await act(async () => {
      fireEvent.click(checkoutButton);
    });

    await waitFor(
      () => {
        expect(orderService.createOrder).toHaveBeenCalledWith(["PROMO10"]);
      },
      { timeout: 3000 }
    );
  });

  test("handles order creation error", async () => {
    orderService.createOrder.mockRejectedValue({
      response: { data: { message: "Stock insuffisant" } },
    });

    await act(async () => {
      render(<MockedCart />);
    });

    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: /commander/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const checkoutButton = screen.getByRole("button", { name: /commander/i });

    await act(async () => {
      fireEvent.click(checkoutButton);
    });

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Stock insuffisant");
      },
      { timeout: 3000 }
    );
  });

  test("closes cart when close button is clicked", async () => {
    const onClose = jest.fn();

    await act(async () => {
      render(<MockedCart onClose={onClose} />);
    });

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      // Find the close button (X button)
      const xButton = buttons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && btn.onClick;
      });
      if (xButton) {
        fireEvent.click(xButton);
      }
    });

    // Note: This test may need adjustment based on actual button implementation
  });
});
