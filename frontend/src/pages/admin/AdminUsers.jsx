import React, { useCallback, useState } from "react";
import {
  FaUserPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useAdminUsers } from "../../hooks/admin/useAdminUsers";
import AdminUsersTable from "../../components/admin/AdminUsersTable";

const roleLabels = {
  user: "User",
  seller: "Seller",
  admin: "Admin",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

const roleColors = {
  user: "bg-blue-100 text-blue-800 border border-blue-200",
  seller: "bg-purple-100 text-purple-800 border border-purple-200",
  admin: "bg-red-100 text-red-800 border border-red-200",
};

const statusLabels = {
  active: "Active",
  pending: "Pending",
};

export default function AdminUsers() {
  const {
    users,
    deletedUsers,
    filteredUsers,
    paginatedUsers,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    showDeleted,
    setShowDeleted,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    handleFilterByRole,
    editingUser,
    setEditingUser,
    viewingUser,
    setViewingUser,
    isCreateModalOpen,
    setIsCreateModalOpen,
    actionTarget,
    setActionTarget,
    actionType,
    setActionType,
    saving,
    creating,
    actionLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    softDeleteUser,
    restoreUser,
    fetchUserDetails,
  } = useAdminUsers();

  // Local state for form inputs (to avoid re-rendering the hook too often or just for convenience)
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  });

  const [editForm, setEditForm] = useState({
    status: "",
    role: "",
  });

  // Handlers for UI interactions
  const openEditModal = useCallback(
    (user) => {
      setEditingUser(user);
      setEditForm({
        status: user.status || "active",
        role: user.role || "user",
      });
    },
    [setEditingUser]
  );

  const closeEditModal = useCallback(() => {
    setEditingUser(null);
    setEditForm({ status: "", role: "" });
  }, [setEditingUser]);

  const openViewModal = useCallback(
    (user) => {
      fetchUserDetails(user._id);
    },
    [fetchUserDetails]
  );

  const closeViewModal = useCallback(() => {
    setViewingUser(null);
  }, [setViewingUser]);

  const openActionModal = useCallback(
    (user, type) => {
      setActionTarget(user);
      setActionType(type);
    },
    [setActionTarget, setActionType]
  );

  const closeActionModal = useCallback(() => {
    setActionTarget(null);
    setActionType(null);
  }, [setActionTarget, setActionType]);

  const onSaveEdit = async () => {
    if (!editingUser) return;
    const success = await updateUser(editingUser._id, editForm);
    if (success) {
      closeEditModal();
    }
  };

  const onCreateUser = async () => {
    if (!newUser.fullname || !newUser.email || !newUser.password) {
      return; // Validation handled in hook or here? Hook didn't have validation. Added basic check here.
    }
    const success = await createUser(newUser);
    if (success) {
      setNewUser({
        fullname: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
      });
    }
  };

  const onConfirmAction = async () => {
    if (!actionTarget || !actionType) return;

    if (actionType === "delete") {
      await deleteUser(actionTarget._id);
    } else if (actionType === "softDelete") {
      await softDeleteUser(actionTarget._id);
    } else if (actionType === "restore") {
      await restoreUser(actionTarget._id);
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
    <section className="space-y-4 sm:space-y-6">
      <header className="space-y-2 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Users Management
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          View and manage users, their statuses, and roles.
        </p>
      </header>

      {/* Search, Filters and Actions */}
      <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, role, or status..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by role:
            </label>
            <select
              value={roleFilter}
              onChange={(e) => handleFilterByRole(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">All</option>
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              Show:
            </label>
            <button
              type="button"
              onClick={() => setShowDeleted(false)}
              className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
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
              className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                showDeleted
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Deleted ({deletedUsers.length})
            </button>
          </div>
          <div className="ml-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-green-700 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <FaUserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Create User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {showDeleted ? "Deleted Users" : "Active Users"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
            found.
            {searchQuery &&
              ` (filtered from ${
                (showDeleted ? deletedUsers : users).length
              } total)`}
          </p>
        </div>

        <AdminUsersTable
          users={paginatedUsers}
          showDeleted={showDeleted}
          onView={openViewModal}
          onEdit={openEditModal}
          onSoftDelete={(u) => openActionModal(u, "softDelete")}
          onDelete={(u) => openActionModal(u, "delete")}
          onRestore={(u) => openActionModal(u, "restore")}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <FaChevronLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    const showEllipsisBefore =
                      index > 0 && array[index - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-xs sm:text-sm text-gray-500">
                            ...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                            currentPage === page
                              ? "bg-orange-600 text-white shadow-sm"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <span className="hidden sm:inline">Next</span>
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">Create New User</h3>

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
                      status:
                        e.target.value === "seller" ? "pending" : "active",
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
                onClick={onCreateUser}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
            <p className="mt-2 text-sm text-gray-600">
              {editingUser.fullname} ({editingUser.email})
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
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
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
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
                onClick={onSaveEdit}
                disabled={
                  saving ||
                  (editForm.status === editingUser.status &&
                    editForm.role === editingUser.role)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">User Details</h3>

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
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {viewingUser.email}
                </p>
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
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {viewingUser.avatar}
                  </p>
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
                        }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
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
                onClick={onConfirmAction}
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
