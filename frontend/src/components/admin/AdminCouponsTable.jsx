import React, { memo } from "react";
import { FaEye, FaEdit, FaTrash, FaTicketAlt } from "react-icons/fa";

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border border-green-200",
  inactive: "bg-gray-100 text-gray-800 border border-gray-200",
};

const typeLabels = {
  percentage: "Percentage",
  fixed: "Fixed",
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-US") : "—");

const AdminCouponsTable = memo(({ coupons, onView, onEdit, onDelete, searchQuery }) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {["Code", "Type", "Value", "Start Date", "End Date", "Status", "Actions"].map(
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
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 font-mono">
                  <div className="truncate max-w-[120px] sm:max-w-none">{coupon.code}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                  {typeLabels[coupon.type] || coupon.type}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                  {coupon.type === "percentage" ? `${coupon.value}%` : `${coupon.value} MAD`}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                  {formatDate(coupon.startDate)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                  {formatDate(coupon.expirationDate)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span
                    className={`inline-flex rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-semibold shadow-sm whitespace-nowrap ${
                      statusColors[coupon.status] || statusColors.active
                    }`}
                  >
                    {statusLabels[coupon.status] || coupon.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onView(coupon)}
                      className="flex items-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      title="View Details"
                    >
                      <FaEye className="w-3 h-3" />
                      <span className="hidden sm:inline">Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(coupon)}
                      className="flex items-center gap-1 rounded-lg border border-orange-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                      title="Edit"
                    >
                      <FaEdit className="w-3 h-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(coupon)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      title="Delete"
                    >
                      <FaTrash className="w-3 h-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                >
                  <FaTicketAlt className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p>
                    {searchQuery
                      ? "No coupons match your search."
                      : "No coupons found. Start by creating a new one."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default AdminCouponsTable;
