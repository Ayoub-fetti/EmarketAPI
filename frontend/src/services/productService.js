import api from "./axios";

export const productService = {
    getProducts: async () => {
        const response = await api.get('/products');
        return response.data;
    },
    getPublishedProducts: async () => {
        const response = await api.get('/products/published');
        return response.data
    },
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    }
}