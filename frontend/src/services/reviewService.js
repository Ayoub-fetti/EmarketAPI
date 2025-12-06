import api from "./axios";

export const reviewService = {
  async getProductReviews(productId, page = 1, limit = 10) {
    const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createReview(reviewData) {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },

  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  async getUserReviews() {
    const response = await api.get("/reviews/me");
    return response.data;
  },
};
