import api from "../axios";

export const adminCategoriesService = {
  async fetchCategories() {
    const response = await api.get("/categories");
    return response.data?.categories ?? [];
  },

  async createCategory(payload) {
    const response = await api.post("/categories", payload);
    return response.data?.category ?? response.data;
  },

  async updateCategory(id, payload) {
    const response = await api.patch(`/categories/${id}`, payload);
    return response.data?.updatedCategory ?? response.data;
  },

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
  },

  async softDeleteCategory(id) {
    await api.delete(`/categories/${id}/soft`);
  },

  async fetchDeletedCategories() {
    const response = await api.get("/categories/deleted");
    return response.data?.data ?? response.data?.categories ?? [];
  },

  async restoreCategory(id) {
    const response = await api.patch(`/categories/${id}/restore`);
    return response.data?.data ?? response.data?.category ?? response.data;
  },
};
