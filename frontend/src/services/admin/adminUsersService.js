import api from "../axios";

export const adminUsersService = {
  async fetchUsers() {
    const response = await api.get("/users");
    const payload = response.data?.data ?? {};
    return payload.users ?? [];
  },

  async updateUserStatusAndRole(id, { status, role }) {
    const response = await api.patch(`/users/${id}/admin`, {
      status,
      role,
    });
    return response.data?.data ?? response.data;
  },
};

