import api from "../axios";

export const adminStatsService = {
  async fetchUsers() {
    const response = await api.get("/users");
    const payload = response.data?.data ?? {};
    return {
      list: payload.users ?? [],
      total: payload.totalUsers ?? payload.users?.length ?? 0,
    };
  },
  async fetchOrders() {
    const response = await api.get("/orders");
    const orders = response.data?.data ?? [];
    return {
      list: orders,
      total: orders.length,
    };
  },
  async fetchProducts() {
    const response = await api.get("/products");
    const products = response.data?.data ?? [];
    return {
      list: products,
      total: products.length,
    };
  },
};
