import api from "./axios";

export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  updateProfile: async (userId, FormData) => {
    const response = await api.patch(`/users/${userId}`, FormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
