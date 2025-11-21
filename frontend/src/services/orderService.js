import api from "./axios";

export const createOrder = async (coupons = []) => {
  const response = await api.post("/orders", { coupons });
  return response.data;
};

export const getUserOrders = async (userId) => {
  const response = await api.get(`/orders/${userId}`);
  return response.data;
};

export const getSellerOrders = async (sellerId) => {
  const response = await api.get(`/orders/seller/${sellerId}`);
  return response.data;
};

export const orderService = {
  createOrder,
  getUserOrders,
  getSellerOrders,
};
