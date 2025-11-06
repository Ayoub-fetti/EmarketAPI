import api from "./axios";

export const productService = {
    getProducts: async () => {
        const response = await api.get('/products');
        return response.data;
    }
}