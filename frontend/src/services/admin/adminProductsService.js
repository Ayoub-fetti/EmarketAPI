import api from "../axios";

export const adminProductsService = {
  async fetchActiveProducts() {
    const response = await api.get("/products");
    return response.data?.data ?? [];
  },

  async fetchDeletedProducts() {
    const response = await api.get("/products/deleted");
    return response.data?.products ?? [];
  },

  async fetchProductDetails(id) {
    const response = await api.get(`/products/${id}`);
    return response.data?.data ?? response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async softDeleteProduct(id) {
    const response = await api.delete(`/products/${id}/soft`);
    return response.data;
  },

  async restoreProduct(id) {
    const response = await api.patch(`/products/${id}/restore`);
    return response.data;
  },

  async togglePublish(id) {
    const response = await api.patch(`/products/${id}/publish`);
    return response.data;
  },
};
