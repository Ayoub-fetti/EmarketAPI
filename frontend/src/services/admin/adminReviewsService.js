import api from "../axios";

export const adminReviewsService = {
  async fetchAllReviews() {
    const response = await api.get("/reviews/all");
    return response.data?.data ?? [];
  },

  async moderateReview(id, status) {
    const response = await api.patch(`/reviews/${id}/moderate`, { status });
    return response.data?.data ?? response.data;
  },
};

