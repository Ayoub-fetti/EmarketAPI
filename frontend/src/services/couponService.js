import api from "./axios";

export const couponService = {
  getAllCoupons: async (page = 1, limit = 10) => {
    const response = await api.get(`/coupons?page=${page}&limit=${limit}`);
    return response.data;
  },
  getCouponById: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },
  createCoupon: async (couponData) => {
    const response = await api.post("/coupons", couponData);
    return response.data;
  },
  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
  validateCoupon: async (code, purchaseAmount, userId) => {
    const response = await api.post("/coupons/validate", {
      code,
      purchaseAmount,
      userId,
    });
    return response.data;
  },
};
