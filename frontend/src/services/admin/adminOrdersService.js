import api from "../axios";

export const adminOrdersService = {
  async fetchAllOrders() {
    const response = await api.get("/orders");
    return response.data?.data ?? [];
  },

  async fetchDeletedOrders() {
    const response = await api.get("/orders/deleted");
    return response.data?.data ?? [];
  },

  async softDeleteOrder(id) {
    await api.delete(`/orders/${id}/soft`);
  },

  async restoreOrder(id) {
    const response = await api.patch(`/orders/${id}/restore`);
    return response.data?.data ?? response.data;
  },

  async updateOrderStatus(id, newStatus) {
    const response = await api.patch(`/orders/${id}/status/admin`, {
      newStatus,
    });
    return response.data?.data ?? response.data;
  },
};
