import api from './axios'

export const reviewService = {
    async getProductReviews(productId, page = 1, limit = 10) {
        const response = await api.get(`reviews/product/${productId}?page=${page}?&limit=${limit}`);
        return response.data;
    }
}