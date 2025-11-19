import { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { adminUsersService } from "../../services/admin/adminUsersService";
import {
  FaUserPlus,
  FaEye,
  FaEdit,
  FaBan,
  FaTrash,
  FaUndo,
  FaUsers,
} from "react-icons/fa";

const statusLabels = {
  active: "Active",
  pending: "Pending",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

const roleLabels = {
  user: "User",
  seller: "Seller",
  admin: "Admin",
};

const roleColors = {
  user: "bg-blue-100 text-blue-800 border border-blue-200",
  seller: "bg-purple-100 text-purple-800 border border-purple-200",
  admin: "bg-red-100 text-red-800 border border-red-200",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delete', 'softDelete', 'restore'
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, deleted] = await Promise.all([
        adminUsersService.fetchUsers(),
        adminUsersService.fetchDeletedUsers(),
      ]);
      setUsers(active);
      setDeletedUsers(deleted);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error loading users.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const source = showDeleted ? deletedUsers : users;
    if (roleFilter === "all") return source;
    return source.filter((user) => user.role === roleFilter);
  }, [users, deletedUsers, roleFilter, showDeleted]);

  const openEditModal = (user) => {
    setEditingUser(user);
    setNewStatus(user.status || "active");
    setNewRole(user.role || "user");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setNewStatus("");
    setNewRole("");
    setSaving(false);
  };

  const openViewModal = async (user) => {
    setViewingUser(null);
    try {
      const userDetails = await adminUsersService.fetchUserById(user._id);
      setViewingUser(userDetails);
    } catch (err) {
      toast.error("Unable to load user details.");
    }
  };

  const closeViewModal = () => {
    setViewingUser(null);
  };

  const openActionModal = (user, type) => {
    setActionTarget(user);
    setActionType(type);
  };

  const closeActionModal = () => {
    setActionTarget(null);
    setActionType(null);
    setActionLoading(false);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const updatedUser = await adminUsersService.updateUserStatusAndRole(
        editingUser._id,
        {
          status: newStatus,
          role: newRole,
        },
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? updatedUser : u)),
      );
      toast.success("User updated successfully.");
      closeEditModal();
      await fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to update user.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newUser.fullname || !newUser.email || !newUser.password) {
      toast.error("Please fill all required fields.");
      return;
    }
    setCreating(true);
    try {
      const createdUser = await adminUsersService.createUser(newUser);
      toast.success("User created successfully.");
      setNewUser({
        fullname: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
      });
      setIsCreateModalOpen(false);
      await fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to create user.";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === "delete") {
        await adminUsersService.deleteUser(actionTarget._id);
        toast.success("User permanently deleted.");
        setUsers((prev) => prev.filter((u) => u._id !== actionTarget._id));
        setDeletedUsers((prev) =>
          prev.filter((u) => u._id !== actionTarget._id),
        );
      } else if (actionType === "softDelete") {
        await adminUsersService.softDeleteUser(actionTarget._id);
        toast.success("User deactivated.");
        setUsers((prev) => prev.filter((u) => u._id !== actionTarget._id));
      } else if (actionType === "restore") {
        await adminUsersService.restoreUser(actionTarget._id);
        toast.success("User restored.");
        setDeletedUsers((prev) =>
          prev.filter((u) => u._id !== actionTarget._id),
        );
      }
      closeActionModal();
      await fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterByRole = async (role) => {
    if (role === "all") {
      await fetchUsers();
      return;
    }
    setLoading(true);
    try {
      const filtered = await adminUsersService.filterUsersByRole(role);
      if (showDeleted) {
        setDeletedUsers(filtered);
      } else {
        setUsers(filtered);
      }
    } catch (err) {
      toast.error("Error filtering users.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0 && deletedUsers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">Error</div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchUsers}
          className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Users Management
        </h2>
        <p className="text-sm text-gray-600">
          View and manage users, their statuses, and roles.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filter by role:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              handleFilterByRole(e.target.value);
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Show:</label>
          <button
            type="button"
            onClick={() => setShowDeleted(false)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              !showDeleted
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setShowDeleted(true)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              showDeleted
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Deleted ({deletedUsers.length})
          </button>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 shadow-sm hover:shadow-md"
          >
            <FaUserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {showDeleted ? "Deleted Users" : "Active Users"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Role",
                  "Status",
                  "Registration Date",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((user) => (
                <tr 
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {user.fullname || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                        roleColors[user.role] || roleColors.user
                      }`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                        statusColors[user.status] || statusColors.active
                      }`}
                    >
                      {statusLabels[user.status] || user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US")
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(user)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        <FaEye className="w-3 h-3" />
                        View
                      </button>
                      {!showDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                          >
                            <FaEdit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(user, "softDelete")}
                            className="flex items-center gap-1 rounded-lg border border-yellow-200 px-3 py-1.5 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          >
                            <FaBan className="w-3 h-3" />
                            Deactivate
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(user, "delete")}
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <FaTrash className="w-3 h-3" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openActionModal(user, "restore")}
                          className="flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                        >
                          <FaUndo className="w-3 h-3" />
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Create New User
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.fullname}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullname: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value,
                      status: e.target.value === "seller" ? "pending" : "active",
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({ ...newUser, status: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (creating) return;
                  setIsCreateModalOpen(false);
                  setNewUser({
                    fullname: "",
                    email: "",
                    password: "",
                    role: "user",
                    status: "active",
                  });
                }}
                disabled={creating}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Edit User
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {editingUser.fullname} ({editingUser.email})
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (saving) return;
                  closeEditModal();
                }}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  (newStatus === editingUser.status &&
                    newRole === editingUser.role)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              User Details
            </h3>

            <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Name:</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {viewingUser.fullname || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Email:
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{viewingUser.email}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Role:</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                      roleColors[viewingUser.role] || roleColors.user
                    }`}
                  >
                    {roleLabels[viewingUser.role] || viewingUser.role}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Status:
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                      statusColors[viewingUser.status] || statusColors.active
                    }`}
                  >
                    {statusLabels[viewingUser.status] || viewingUser.status}
                  </span>
                </div>
              </div>
              {viewingUser.avatar && (
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Avatar:
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewingUser.avatar}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Created At:
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {viewingUser.createdAt
                    ? new Date(viewingUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              {actionType === "delete"
                ? "Permanently Delete"
                : actionType === "softDelete"
                  ? "Deactivate User"
                  : "Restore User"}
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              {actionType === "delete" &&
                "This action is irreversible. The user will be permanently deleted from the database."}
              {actionType === "softDelete" &&
                "The user will be deactivated but can be restored later."}
              {actionType === "restore" &&
                "The user will be restored and will reappear in the active list."}
            </p>
            <p className="mt-2 text-sm text-gray-800">
              User:{" "}
              <span className="font-semibold">
                {actionTarget.fullname} ({actionTarget.email})
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  closeActionModal();
                }}
                disabled={actionLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={actionLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md",
                  actionType === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionType === "softDelete"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700",
                ].join(" ")}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
