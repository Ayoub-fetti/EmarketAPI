import React, { memo } from "react";
import { FaBan, FaUndo, FaShoppingCart, FaEye } from "react-icons/fa";

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

const AdminOrdersTable = memo(
  ({
    orders,
    showDeleted,
    selectedOrderId,
    onSelectOrder,
    onDeactivate,
    onRestore,
    searchQuery,
  }) => {
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {["ID", "Customer", "Date", "Amount", "Status", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    selectedOrderId === order._id ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs text-gray-600">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                        {order.userId?.fullname || order.userId?.email || "—"}
                      </div>
                      {order.userId?.email && order.userId?.fullname && (
                        <div className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">
                          {order.userId.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap">
                    {currencyFormatter.format(order.finalAmount ?? 0)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-semibold shadow-sm whitespace-nowrap ${
                        statusColors[order.status] || statusColors.pending
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order._id)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="w-3 h-3" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                      {!showDeleted ? (
                        <button
                          type="button"
                          onClick={() => onDeactivate(order)}
                          className="flex items-center gap-1 rounded-lg border border-yellow-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          title="Deactivate"
                        >
                          <FaBan className="w-3 h-3" />
                          <span className="hidden sm:inline">Deactivate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRestore(order)}
                          className="flex items-center gap-1 rounded-lg border border-green-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                          title="Restore"
                        >
                          <FaUndo className="w-3 h-3" />
                          <span className="hidden sm:inline">Restore</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                  >
                    <FaShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p>
                      {searchQuery
                        ? "No orders match your search."
                        : "No orders found."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default AdminOrdersTable;
