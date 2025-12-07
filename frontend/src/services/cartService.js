import api from "./axios.js";

const getSessionId = () => {
  let sessionId = localStorage.getItem("cart-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cart-session-id", sessionId);
  }
  return sessionId;
};

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const getCartEndpoint = () => {
  return isAuthenticated() ? "/cart" : "/guest-cart";
};

const getHeaders = () => {
  const headers = {};
  if (!isAuthenticated()) {
    headers["session-id"] = getSessionId();
  }
  return headers;
};

export const getCart = async () => {
  const response = await api.get(getCartEndpoint(), {
    headers: getHeaders(),
  });
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post(
    getCartEndpoint(),
    { productId, quantity },
    { headers: getHeaders() }
  );
  return response.data;
};

export const updateQuantity = async (productId, quantity) => {
  const response = await api.put(
    getCartEndpoint(),
    { productId, quantity },
    { headers: getHeaders() }
  );
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(getCartEndpoint(), {
    data: { productId },
    headers: getHeaders(),
  });
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete(`${getCartEndpoint()}/clear`, {
    headers: getHeaders(),
  });
  return response.data;
};
export const validateCoupon = async (code, purchaseAmount, userId = null) => {
  const response = await api.post("/coupons/validate", { code, purchaseAmount, userId });
  return response.data;
};
