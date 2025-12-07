import * as orderService from "../../services/orderService";
import api from "../../services/axios";

jest.mock("../../services/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
    },
  },
}));

describe("orderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    test("creates order without coupons", async () => {
      api.post.mockResolvedValue({ data: { success: true, data: { _id: "order-1" } } });

      const result = await orderService.createOrder([]);

      expect(api.post).toHaveBeenCalledWith("/orders", { coupons: [] });
      expect(result.success).toBe(true);
    });

    test("creates order with coupons", async () => {
      api.post.mockResolvedValue({ data: { success: true, data: { _id: "order-1" } } });

      const result = await orderService.createOrder(["PROMO10", "DISCOUNT20"]);

      expect(api.post).toHaveBeenCalledWith("/orders", {
        coupons: ["PROMO10", "DISCOUNT20"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("getUserOrders", () => {
    test("fetches user orders", async () => {
      api.get.mockResolvedValue({ data: { success: true, data: [] } });

      const result = await orderService.getUserOrders("user-id");

      expect(api.get).toHaveBeenCalledWith("/orders/user-id");
      expect(result.success).toBe(true);
    });
  });

  describe("getSellerOrders", () => {
    test("fetches seller orders", async () => {
      api.get.mockResolvedValue({ data: { success: true, data: [] } });

      const result = await orderService.getSellerOrders("seller-id");

      expect(api.get).toHaveBeenCalledWith("/orders/seller/seller-id");
      expect(result.success).toBe(true);
    });
  });
});
