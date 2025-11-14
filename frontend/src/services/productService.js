import api from "./axios";

export const productService = {
  getProducts: async () => {
    const response = await api.get("/products");
    return response.data;
  },
  getPublishedProducts: async () => {
    const response = await api.get("/products/published");
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  searchProducts: async (filters) => {
    const params = new URLSearchParams();

    if (filters.categories?.length) {
      params.append("categories", filters.categories.join(","));
    }
    if (filters.minPrice) {
      params.append("minPrice", filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append("maxPrice", filters.maxPrice);
    }
    if (filters.title) {
      params.append("title", filters.title);
    }
    if (filters.description) {
      params.append("description", filters.description);
    }

    const response = await api.get(`/products/search?${params}`);
    return response.data;
  },
  createProduct: async (formData) => {
    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getProductsBySeller: async (sellerId) => {
    const response = await api.get(`/products/seller/${sellerId}`);
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
