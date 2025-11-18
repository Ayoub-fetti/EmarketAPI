import api from "../axios";

export const adminCouponsService = {
  async fetchAllCoupons() {
    const response = await api.get("/coupons");
    return response.data?.data ?? [];
  },

  async fetchCouponById(id) {
    const response = await api.get(`/coupons/${id}`);
    return response.data?.data ?? response.data;
  },

  async createCoupon(couponData) {
    const response = await api.post("/coupons", couponData);
    return response.data?.data ?? response.data;
  },

  async updateCoupon(id, couponData) {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data?.data ?? response.data;
  },

  async deleteCoupon(id) {
    await api.delete(`/coupons/${id}`);
  },
};

