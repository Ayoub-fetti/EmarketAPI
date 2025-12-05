import * as cartService from "../../services/cartService";
import api from "../../services/axios";

jest.mock("../../services/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
    },
  },
}));

describe("cartService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("getCart", () => {
    test("fetches cart for authenticated user", async () => {
      localStorage.setItem("token", "mock-token");
      api.get.mockResolvedValue({ data: { success: true, data: { items: [] } } });

      const result = await cartService.getCart();

      expect(api.get).toHaveBeenCalledWith("/cart", { headers: {} });
      expect(result.success).toBe(true);
    });

    test("fetches guest cart with session-id header", async () => {
      api.get.mockResolvedValue({ data: { success: true, data: { items: [] } } });

      await cartService.getCart();

      expect(api.get).toHaveBeenCalled();
      const callArgs = api.get.mock.calls[0];
      expect(callArgs[1].headers["session-id"]).toBeDefined();
    });
  });

  describe("addToCart", () => {
    test("adds product to cart", async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      const result = await cartService.addToCart("product-id", 2);

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        { productId: "product-id", quantity: 2 },
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe("updateQuantity", () => {
    test("updates product quantity", async () => {
      api.put.mockResolvedValue({ data: { success: true } });

      const result = await cartService.updateQuantity("product-id", 3);

      expect(api.put).toHaveBeenCalledWith(
        expect.any(String),
        { productId: "product-id", quantity: 3 },
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe("removeFromCart", () => {
    test("removes product from cart", async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await cartService.removeFromCart("product-id");

      expect(api.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          data: { productId: "product-id" },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe("clearCart", () => {
    test("clears cart", async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await cartService.clearCart();

      expect(api.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("validateCoupon", () => {
    test("validates coupon code", async () => {
      api.post.mockResolvedValue({
        data: { valid: true, data: { code: "PROMO10", discountAmount: 10 } },
      });

      const result = await cartService.validateCoupon("PROMO10", 100, "user-id");

      expect(api.post).toHaveBeenCalledWith("/coupons/validate", {
        code: "PROMO10",
        purchaseAmount: 100,
        userId: "user-id",
      });
      expect(result.valid).toBe(true);
    });
  });
});
