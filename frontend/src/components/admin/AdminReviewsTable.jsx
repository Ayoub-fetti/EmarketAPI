import React, { memo } from "react";
import { FaStar, FaEdit, FaComments } from "react-icons/fa";

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US") : "—";

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <FaStar
      key={i}
      className={`w-4 h-4 ${
        i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
      }`}
    />
  ));
};

const AdminReviewsTable = memo(({ reviews, onModerate, searchQuery }) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {[
                "User",
                "Product",
                "Rating",
                "Comment",
                "Status",
                "Date",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {reviews.map((review) => (
              <tr
                key={review._id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                      {typeof review.user === "object" && review.user
                        ? review.user.fullname || review.user.email || "—"
                        : "—"}
                    </div>
                    {typeof review.user === "object" &&
                      review.user?.email &&
                      review.user?.fullname && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px] sm:max-w-none">
                          {review.user.email}
                        </div>
                      )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                    {typeof review.product === "object" && review.product
                      ? review.product.title || "Deleted Product"
                      : "Deleted Product"}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="max-w-[200px] sm:max-w-xs truncate text-gray-600">
                    {review.comment || "—"}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span
                    className={`inline-flex rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-semibold shadow-sm whitespace-nowrap ${
                      statusColors[review.status] || statusColors.pending
                    }`}
                  >
                    {statusLabels[review.status] || review.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                  {formatDate(review.createdAt)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <button
                    type="button"
                    onClick={() => onModerate(review)}
                    className="flex items-center gap-1 rounded-lg border border-orange-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                    title="Moderate"
                  >
                    <FaEdit className="w-3 h-3" />
                    <span className="hidden sm:inline">Moderate</span>
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                >
                  <FaComments className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p>
                    {searchQuery
                      ? "No reviews match your search."
                      : "No reviews found."}
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

export default AdminReviewsTable;
