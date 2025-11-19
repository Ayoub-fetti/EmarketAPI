import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminOrdersService } from "../../services/admin/adminOrdersService";
import {
  FaBan,
  FaUndo,
  FaShoppingCart,
  FaEdit,
  FaEye,
  FaTimesCircle,
} from "react-icons/fa";

const statusLabels = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  shipped: "bg-blue-100 text-blue-800 border border-blue-200",
  delivered: "bg-green-100 text-green-800 border border-green-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US") : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function AdminOrders() {
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
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error loading orders.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const source = showDeleted ? deletedOrders : orders;
    if (statusFilter === "all") return source;
    return source.filter((order) => order.status === statusFilter);
  }, [orders, deletedOrders, statusFilter, showDeleted]);

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
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to deactivate order.";
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
      setDeletedOrders((prev) =>
        prev.filter((o) => o._id !== actionTarget._id),
      );
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
      }
      await fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to restore order.";
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
      const updatedOrder = await adminOrdersService.updateOrderStatus(
        actionTarget._id,
        newStatus,
      );
      toast.success("Order status updated successfully.");
      setOrders((prev) =>
        prev.map((o) => (o._id === actionTarget._id ? updatedOrder : o)),
      );
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
        setTimeout(() => setSelectedOrderId(actionTarget._id), 100);
      }
      await fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to update order status.";
      toast.error(message);
    } finally {
      closeModals();
      setIsStatusModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">Error</div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchOrders}
          className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
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
          Orders Management
        </h2>
        <p className="text-sm text-gray-600">
          View all orders, filter by status, and manage deleted orders.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
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
            Active ({orders.length})
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
            Deleted ({deletedOrders.length})
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {showDeleted ? "Deleted Orders" : "Active Orders"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {[
                    "ID",
                    "Customer",
                    "Date",
                    "Amount",
                    "Status",
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      selectedOrderId === order._id ? "bg-orange-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {order.userId?.fullname || order.userId?.email || "—"}
                        </div>
                        {order.userId?.email && (
                          <div className="text-xs text-gray-500">
                            {order.userId.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {currencyFormatter.format(order.finalAmount ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                          statusColors[order.status] || statusColors.pending
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order._id)}
                          className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          <FaEye className="w-3 h-3" />
                          Details
                        </button>
                        {!showDeleted ? (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(order)}
                            className="flex items-center gap-1 rounded-lg border border-yellow-200 px-3 py-1.5 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          >
                            <FaBan className="w-3 h-3" />
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRestoreModal(order)}
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
                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      <FaShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No orders found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
          <div className="w-[80%] max-w-4xl max-h-[90vh] rounded-xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-900">
                Order Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6">
              <article className="space-y-6">
                <header className="space-y-2 border-b border-gray-200 pb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Order #{selectedOrder._id.slice(-8)}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${
                        statusColors[selectedOrder.status] ||
                        statusColors.pending
                      }`}
                    >
                      {statusLabels[selectedOrder.status] ||
                        selectedOrder.status}
                    </span>
                    {!showDeleted && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(selectedOrder)}
                        className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                      >
                        <FaEdit className="w-4 h-4" />
                        Update Status
                      </button>
                    )}
                  </div>
                </header>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">
                      Customer
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.userId?.fullname || "—"}
                    </p>
                    {selectedOrder.userId?.email && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedOrder.userId.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">
                      Products
                    </h5>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {typeof item.productId === "object" &&
                              item.productId !== null
                                ? item.productId.title || "Deleted Product"
                                : "Deleted Product"}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity} ×{" "}
                              {currencyFormatter.format(item.price ?? 0)}
                            </div>
                            {typeof item.productId === "object" &&
                              item.productId?.seller_id && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Seller:{" "}
                                  {item.productId.seller_id?.fullname ||
                                    item.productId.seller_id?.email ||
                                    "—"}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">
                        {currencyFormatter.format(selectedOrder.totalAmount ?? 0)}
                      </span>
                    </div>
                    {selectedOrder.appliedCoupons?.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Applied coupons:{" "}
                        <span className="font-medium">
                          {selectedOrder.appliedCoupons
                            .map((c) =>
                              typeof c === "object" ? c.code : c,
                            )
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-orange-600">
                        {currencyFormatter.format(selectedOrder.finalAmount ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate/Restore Modal */}
      {(isDeleteModalOpen || isRestoreModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              {isDeleteModalOpen
                ? "Deactivate Order"
                : "Restore Order"}
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              {isDeleteModalOpen &&
                "The order will be removed from the active list but can be restored later."}
              {isRestoreModalOpen &&
                "The order will be restored and reappear in the active list."}
            </p>
            <p className="mt-2 text-sm text-gray-800">
              Order:{" "}
              <span className="font-semibold">
                #{actionTarget?._id?.slice(-8) ?? "—"}
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  closeModals();
                }}
                disabled={actionLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={isDeleteModalOpen ? handleSoftDelete : handleRestore}
                disabled={actionLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md",
                  isDeleteModalOpen
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

      {/* Update Status Modal */}
      {isStatusModalOpen && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Update Order Status
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Order:{" "}
              <span className="font-semibold">
                #{actionTarget._id?.slice(-8) ?? "—"}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Current status:{" "}
              <span className="font-medium">
                {statusLabels[actionTarget.status] || actionTarget.status}
              </span>
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  closeModals();
                }}
                disabled={actionLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={actionLoading || !newStatus || newStatus === actionTarget.status}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
