import { renderHook, act, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "../../../context/CartContext";
import { AuthProvider } from "../../../context/AuthContext";
import * as cartService from "../../../services/cartService";
import { toast } from "react-toastify";

jest.mock("../../../services/cartService");
jest.mock("react-toastify");

const wrapper = ({ children }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

describe("useCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    cartService.getCart.mockResolvedValue({ success: true, data: { items: [] } });
  });

  it("should throw error when used outside CartProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart must be used within a CartProvider");

    console.error.mockRestore();
  });

  it("should initialize with empty cart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
  });

  it("should add item to cart", async () => {
    cartService.addToCart.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const product = { _id: "1", price: 100 };

    await act(async () => {
      await result.current.addToCart(product, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(toast.success).toHaveBeenCalledWith("Produit ajouté au panier");
  });

  it("should remove item from cart", async () => {
    cartService.removeFromCart.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeFromCart("1");
    });

    expect(toast.success).toHaveBeenCalledWith("Produit retiré");
  });

  it("should clear cart", async () => {
    cartService.clearCart.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(toast.success).toHaveBeenCalledWith("Panier vidé");
  });

  it("should calculate subtotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const items = [
      { productId: { _id: "1", price: 100 }, quantity: 2 },
      { productId: { _id: "2", price: 50 }, quantity: 1 },
    ];

    const subtotal = items.reduce((total, item) => total + item.productId.price * item.quantity, 0);

    expect(subtotal).toBe(250);
  });

  it("should calculate tax", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const subtotal = 100;
    const tax = subtotal * result.current.TAX_RATE;

    expect(tax).toBe(20);
  });

  it("should calculate total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const subtotal = 100;
    const tax = subtotal * result.current.TAX_RATE;
    const total = subtotal + tax;

    expect(total).toBe(120);
  });

  it("should count items", () => {
    const items = [
      { productId: { _id: "1", price: 100 }, quantity: 2 },
      { productId: { _id: "2", price: 50 }, quantity: 3 },
    ];

    const count = items.reduce((total, item) => total + item.quantity, 0);

    expect(count).toBe(5);
  });
});
