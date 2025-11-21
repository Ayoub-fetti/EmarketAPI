import api from "../axios";

export const adminUsersService = {
  async fetchUsers() {
    const response = await api.get("/users");
    const payload = response.data?.data ?? {};
    return payload.users ?? [];
  },

  async fetchDeletedUsers() {
    const response = await api.get("/users/deleted");
    return response.data?.data ?? [];
  },

  async fetchUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data?.data?.user ?? response.data?.user ?? response.data;
  },

  async createUser(userData) {
    const response = await api.post("/users", userData);
    return response.data?.data?.user ?? response.data?.user ?? response.data;
  },

  async deleteUser(id) {
    await api.delete(`/users/${id}`);
  },

  async softDeleteUser(id) {
    await api.delete(`/users/${id}/soft`);
  },

  async restoreUser(id) {
    const response = await api.patch(`/users/${id}/restore`);
    return response.data?.data ?? response.data;
  },

  async filterUsersByRole(role) {
    const response = await api.get(`/users/filter?role=${role}`);
    return response.data?.data?.users ?? [];
  },

  async updateUserStatusAndRole(id, { status, role }) {
    const response = await api.patch(`/users/${id}/admin`, {
      status,
      role,
    });
    return response.data?.data ?? response.data;
  },
};

