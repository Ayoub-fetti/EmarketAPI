import { act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import { CartProvider } from "../../../context/CartContext";
import * as cartService from "../../../services/cartService";
import * as orderService from "../../../services/orderService";

jest.mock("../../../services/cartService");
jest.mock("../../../services/orderService");
jest.mock("react-toastify");

const mockProduct = {
  _id: "1",
  title: "Test Product",
  price: 100,
  primaryImage: "/test.jpg",
  stock: 10,
};

describe("Cart & Checkout Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    cartService.getCart.mockResolvedValue({ success: true, data: { items: [] } });
  });

  describe("Ajouter un produit dans le panier", () => {
    test("adds product to cart successfully", async () => {
      cartService.addToCart.mockResolvedValue({ success: true });

      await act(async () => {
        await cartService.addToCart(mockProduct._id, 1);
      });

      expect(cartService.addToCart).toHaveBeenCalledWith(mockProduct._id, 1);
    });
  });

  describe("Modifier la quantité", () => {
    test("increases product quantity", async () => {
      cartService.updateQuantity.mockResolvedValue({ success: true });

      await act(async () => {
        await cartService.updateQuantity(mockProduct._id, 2);
      });

      expect(cartService.updateQuantity).toHaveBeenCalledWith(mockProduct._id, 2);
    });

    test("decreases product quantity", async () => {
      cartService.updateQuantity.mockResolvedValue({ success: true });

      await act(async () => {
        await cartService.updateQuantity(mockProduct._id, 1);
      });

      expect(cartService.updateQuantity).toHaveBeenCalledWith(mockProduct._id, 1);
    });
  });

  describe("Supprimer un produit", () => {
    test("removes product from cart", async () => {
      cartService.removeFromCart.mockResolvedValue({ success: true });

      await act(async () => {
        await cartService.removeFromCart(mockProduct._id);
      });

      expect(cartService.removeFromCart).toHaveBeenCalledWith(mockProduct._id);
    });
  });

  describe("Checkout → création commande", () => {
    test("creates order successfully", async () => {
      orderService.createOrder.mockResolvedValue({ success: true });
      cartService.clearCart.mockResolvedValue({ success: true });

      await act(async () => {
        await orderService.createOrder([]);
      });

      expect(orderService.createOrder).toHaveBeenCalledWith([]);
    });

    test("creates order with coupon", async () => {
      cartService.validateCoupon.mockResolvedValue({
        valid: true,
        data: { code: "PROMO10", discountAmount: 10 },
      });
      orderService.createOrder.mockResolvedValue({ success: true });

      await act(async () => {
        const couponResult = await cartService.validateCoupon("PROMO10", 100);
        await orderService.createOrder([couponResult.data.code]);
      });

      expect(cartService.validateCoupon).toHaveBeenCalledWith("PROMO10", 100);
      expect(orderService.createOrder).toHaveBeenCalledWith(["PROMO10"]);
    });

    test("handles order creation error", async () => {
      orderService.createOrder.mockRejectedValue({
        response: { data: { message: "Stock insuffisant" } },
      });

      await act(async () => {
        try {
          await orderService.createOrder([]);
        } catch (error) {
          expect(error.response.data.message).toBe("Stock insuffisant");
        }
      });

      expect(orderService.createOrder).toHaveBeenCalledWith([]);
    });
  });
});
