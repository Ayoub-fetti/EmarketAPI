import React from "react";
import {
  FaSearch,
  FaTrash,
  FaBoxOpen,
  FaTimes,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaBan,
} from "react-icons/fa";
import { useAdminOrders } from "../../hooks/admin/useAdminOrders";
import AdminOrdersTable from "../../components/admin/AdminOrdersTable";

const AdminOrders = () => {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    showDeleted,
    setShowDeleted,
    selectedOrder,
    setSelectedOrderId,
    handleDeactivate,
    handleRestore,
    handleStatusUpdate,
    statusLabels,
    currencyFormatter,
    formatDate,
    filteredOrders,
    statusFilter,
    setStatusFilter,
  } = useAdminOrders();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm ${
              showDeleted
                ? "bg-gray-800 text-white hover:bg-gray-900 ring-1 ring-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200"
            }`}
          >
            {showDeleted ? (
              <>
                <FaBoxOpen className="w-4 h-4" />
                Show Active
              </>
            ) : (
              <>
                <FaTrash className="w-4 h-4" />
                Show Deleted
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-gray-200 pl-10 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500 shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-orange-500 focus:ring-orange-500 shadow-sm bg-white"
        >
          <option value="all">All</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <AdminOrdersTable
          orders={filteredOrders}
          showDeleted={showDeleted}
          selectedOrderId={selectedOrder?._id}
          onSelectOrder={setSelectedOrderId}
          onDeactivate={handleDeactivate}
          onRestore={handleRestore}
          searchQuery={searchQuery}
        />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrderId(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Order{" "}
                  <span className="font-mono text-orange-600">#{selectedOrder._id.slice(-8)}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedOrder.status === "delivered"
                        ? "bg-green-100 text-green-600"
                        : selectedOrder.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {selectedOrder.status === "delivered" ? (
                      <FaCheckCircle className="w-5 h-5" />
                    ) : selectedOrder.status === "cancelled" ? (
                      <FaBan className="w-5 h-5" />
                    ) : selectedOrder.status === "shipped" ? (
                      <FaTruck className="w-5 h-5" />
                    ) : (
                      <FaClock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <p className="font-bold text-gray-900">{statusLabels[selectedOrder.status]}</p>
                  </div>
                </div>

                {!showDeleted && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Update Status:</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                      className="rounded-lg border-gray-300 py-1.5 pl-3 pr-8 text-sm font-medium focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                    <FaUser className="text-orange-500" /> Customer Details
                  </h3>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-white p-1.5 shadow-sm text-gray-400">
                        <FaUser className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Full Name
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedOrder.userId?.fullname || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-white p-1.5 shadow-sm text-gray-400">
                        <FaEnvelope className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Email Address
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedOrder.userId?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-white p-1.5 shadow-sm text-gray-400">
                        <FaPhone className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Phone Number
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedOrder.shippingAddress?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                    <FaMapMarkerAlt className="text-orange-500" /> Shipping Address
                  </h3>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-white p-1.5 shadow-sm text-gray-400">
                        <FaMapMarkerAlt className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Address
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedOrder.shippingAddress?.address},{" "}
                          {selectedOrder.shippingAddress?.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.shippingAddress?.postalCode},{" "}
                          {selectedOrder.shippingAddress?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                  <FaBoxOpen className="text-orange-500" /> Order Items
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                {item.product?.image ? (
                                  <img
                                    src={`http://localhost:3000/uploads/products/${item.product.image}`}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                                    <FaBoxOpen />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.product?.name || "Unknown Product"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  SKU: {item.product?._id?.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">
                            {currencyFormatter.format(item.price)}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            {currencyFormatter.format(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-right text-sm font-medium text-gray-500"
                        >
                          Subtotal
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          {currencyFormatter.format(selectedOrder.totalAmount)}
                        </td>
                      </tr>
                      {selectedOrder.discountAmount > 0 && (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 py-3 text-right text-sm font-medium text-green-600"
                          >
                            Discount
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                            -{currencyFormatter.format(selectedOrder.discountAmount)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-right text-base font-bold text-gray-900"
                        >
                          Total Amount
                        </td>
                        <td className="px-4 py-3 text-right text-base font-bold text-orange-600">
                          {currencyFormatter.format(selectedOrder.finalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
