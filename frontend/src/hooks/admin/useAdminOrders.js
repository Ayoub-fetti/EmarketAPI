import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { adminOrdersService } from "../../services/admin/adminOrdersService";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-US") : "—");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
});

const statusLabels = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const useAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, deleted] = await Promise.all([
        adminOrdersService.fetchAllOrders(),
        adminOrdersService.fetchDeletedOrders(),
      ]);
      setOrders(active);
      setDeletedOrders(deleted);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error loading orders.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    let source = showDeleted ? deletedOrders : orders;

    // Filter by status
    if (statusFilter !== "all") {
      source = source.filter((order) => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      source = source.filter(
        (order) =>
          order._id?.toLowerCase().includes(query) ||
          order.userId?.fullname?.toLowerCase().includes(query) ||
          order.userId?.email?.toLowerCase().includes(query) ||
          order.status?.toLowerCase().includes(query) ||
          String(order.finalAmount || "").includes(query) ||
          formatDate(order.createdAt).toLowerCase().includes(query)
      );
    }

    return source;
  }, [orders, deletedOrders, statusFilter, showDeleted, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, showDeleted]);

  const selectedOrder = useMemo(() => {
    return filteredOrders.find((o) => o._id === selectedOrderId);
  }, [filteredOrders, selectedOrderId]);

  const openDeleteModal = (order) => {
    setActionTarget(order);
    setIsDeleteModalOpen(true);
    setIsRestoreModalOpen(false);
  };

  const openRestoreModal = (order) => {
    setActionTarget(order);
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(true);
  };

  const closeModals = () => {
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(false);
    setIsStatusModalOpen(false);
    setActionTarget(null);
    setNewStatus("");
    setActionLoading(false);
  };

  const handleSoftDelete = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await adminOrdersService.softDeleteOrder(actionTarget._id);
      toast.success("Order deactivated successfully.");
      setOrders((prev) => prev.filter((o) => o._id !== actionTarget._id));
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
      }
      await fetchOrders();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to deactivate order.";
      toast.error(message);
    } finally {
      closeModals();
    }
  };

  const handleRestore = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await adminOrdersService.restoreOrder(actionTarget._id);
      toast.success("Order restored successfully.");
      setDeletedOrders((prev) => prev.filter((o) => o._id !== actionTarget._id));
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
      }
      await fetchOrders();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to restore order.";
      toast.error(message);
    } finally {
      closeModals();
    }
  };

  const openStatusModal = (order) => {
    setActionTarget(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(false);
  };

  const handleUpdateStatus = async () => {
    if (!actionTarget || !newStatus) return;
    setActionLoading(true);
    try {
      const updatedOrder = await adminOrdersService.updateOrderStatus(actionTarget._id, newStatus);
      toast.success("Order status updated successfully.");
      setOrders((prev) => prev.map((o) => (o._id === actionTarget._id ? updatedOrder : o)));
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
        setTimeout(() => setSelectedOrderId(actionTarget._id), 100);
      }
      await fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Unable to update order status.";
      toast.error(message);
    } finally {
      closeModals();
      setIsStatusModalOpen(false);
    }
  };

  return {
    orders,
    deletedOrders,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    selectedOrderId,
    setSelectedOrderId,
    actionTarget,
    setActionTarget,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isRestoreModalOpen,
    setIsRestoreModalOpen,
    isStatusModalOpen,
    setIsStatusModalOpen,
    newStatus,
    setNewStatus,
    actionLoading,
    showDeleted,
    setShowDeleted,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredOrders,
    paginatedOrders,
    totalPages,
    selectedOrder,
    fetchOrders,
    openDeleteModal,
    openRestoreModal,
    closeModals,
    handleSoftDelete,
    handleRestore,
    openStatusModal,
    handleUpdateStatus,
    formatDate,
    currencyFormatter,
    statusLabels,
  };
};
