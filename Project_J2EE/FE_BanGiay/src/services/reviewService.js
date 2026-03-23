import api from './api';

const reviewService = {
  getProductReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  canReview: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/can-review`);
    return response.data;
  },

  createReview: async (productId, payload) => {
    const response = await api.post(`/products/${productId}/reviews`, payload);
    return response.data;
  },

  getAdminReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },

  replyAsAdmin: async (reviewId, content) => {
    const response = await api.post(`/admin/reviews/${reviewId}/reply`, { content });
    return response.data;
  },

  toggleReviewActive: async (reviewId, isActive) => {
    const response = await api.put(`/admin/reviews/${reviewId}/active`, { isActive });
    return response.data;
  },
};

export default reviewService;
