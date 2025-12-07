import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { adminUsersService } from "../../services/admin/adminUsersService";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [showDeleted, setShowDeleted] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals State
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delete', 'softDelete', 'restore'

  // Loading States for actions
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      const message = err.response?.data?.message || err.message || "Error loading users.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    let source = showDeleted ? deletedUsers : users;

    if (roleFilter !== "all") {
      source = source.filter((user) => user.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      source = source.filter(
        (user) =>
          user.fullname?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          user.status?.toLowerCase().includes(query)
      );
    }

    return source;
  }, [users, deletedUsers, roleFilter, showDeleted, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, showDeleted]);

  // Actions
  const handleFilterByRole = useCallback(
    async (role) => {
      setRoleFilter(role);
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
      } catch {
        toast.error("Error filtering users.");
      } finally {
        setLoading(false);
      }
    },
    [showDeleted, fetchUsers]
  );

  const createUser = useCallback(
    async (userData) => {
      setCreating(true);
      try {
        await adminUsersService.createUser(userData);
        toast.success("User created successfully.");
        setIsCreateModalOpen(false);
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Unable to create user.";
        toast.error(message);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [fetchUsers]
  );

  const updateUser = useCallback(
    async (userId, updateData) => {
      setSaving(true);
      try {
        const updatedUser = await adminUsersService.updateUserStatusAndRole(userId, updateData);
        setUsers((prev) => prev.map((u) => (u._id === userId ? updatedUser : u)));
        toast.success("User updated successfully.");
        setEditingUser(null);
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Unable to update user.";
        toast.error(message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      await adminUsersService.deleteUser(userId);
      toast.success("User permanently deleted.");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setDeletedUsers((prev) => prev.filter((u) => u._id !== userId));
      setActionTarget(null);
      setActionType(null);
    } catch {
      toast.error("Error deleting user.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const softDeleteUser = useCallback(
    async (userId) => {
      setActionLoading(true);
      try {
        await adminUsersService.softDeleteUser(userId);
        toast.success("User deactivated.");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        await fetchUsers(); // Refresh to move to deleted list
        setActionTarget(null);
        setActionType(null);
      } catch {
        toast.error("Error deactivating user.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchUsers]
  );

  const restoreUser = useCallback(
    async (userId) => {
      setActionLoading(true);
      try {
        await adminUsersService.restoreUser(userId);
        toast.success("User restored.");
        setDeletedUsers((prev) => prev.filter((u) => u._id !== userId));
        await fetchUsers(); // Refresh to move to active list
        setActionTarget(null);
        setActionType(null);
      } catch {
        toast.error("Error restoring user.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchUsers]
  );

  const fetchUserDetails = useCallback(async (userId) => {
    try {
      const details = await adminUsersService.fetchUserById(userId);
      setViewingUser(details);
    } catch {
      toast.error("Unable to load user details.");
    }
  }, []);

  return {
    // Data
    users,
    deletedUsers,
    filteredUsers,
    paginatedUsers,
    loading,
    error,

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,

    // Filters
    showDeleted,
    setShowDeleted,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    handleFilterByRole,

    // Modal States
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

    // Loading States
    saving,
    creating,
    actionLoading,

    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    softDeleteUser,
    restoreUser,
    fetchUserDetails,
  };
}
