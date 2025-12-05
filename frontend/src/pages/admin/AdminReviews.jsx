import React from "react";
import {
  FaStar,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import useAdminReviews from "../../hooks/admin/useAdminReviews";
import AdminReviewsTable from "../../components/admin/AdminReviewsTable";

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

export default function AdminReviews() {
  const {
    reviews,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    selectedReview,
    isModerateModalOpen,
    newStatus,
    setNewStatus,
    moderating,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedReviews,
    filteredReviews,
    openModerateModal,
    closeModerateModal,
    handleModerate,
    fetchReviews,
  } = useAdminReviews();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading reviews...</p>
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
          onClick={fetchReviews}
          className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
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
          Reviews Moderation
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          View and moderate user reviews on products.
        </p>
      </header>

      {/* Search, Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        {/* Search Bar */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, product, comment, status, rating, or date..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
          {filteredReviews.length} review
          {filteredReviews.length !== 1 ? "s" : ""} found
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Reviews List
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filteredReviews.length} review
            {filteredReviews.length !== 1 ? "s" : ""} found.
            {searchQuery && ` (filtered from ${reviews.length} total)`}
          </p>
        </div>

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
                {paginatedReviews.map((review) => (
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
                        review.user?.email && review.user?.fullname && (
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
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      type="button"
                      onClick={() => openModerateModal(review)}
                      className="flex items-center gap-1 rounded-lg border border-orange-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                      title="Moderate"
                    >
                      <FaEdit className="w-3 h-3" />
                      <span className="hidden sm:inline">Moderate</span>
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                  >
                    <FaComments className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p>{searchQuery ? "No reviews match your search." : "No reviews found."}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, filteredReviews.length)} of{" "}
              {filteredReviews.length} reviews
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
                    // Show first page, last page, current page, and pages around current
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
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

      {/* Moderate Modal */}
      {isModerateModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">Moderate Review</h3>

            <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <span className="text-xs font-medium text-gray-500">User:</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {typeof selectedReview.user === "object" &&
                  selectedReview.user
                    ? selectedReview.user.fullname || selectedReview.user.email
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Product:
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {typeof selectedReview.product === "object" &&
                  selectedReview.product
                    ? selectedReview.product.title
                    : "Deleted Product"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Rating:
                </span>
                <div className="mt-1 flex items-center gap-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Comment:
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedReview.comment || "No comment"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Current Status:
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                      statusColors[selectedReview.status] ||
                      statusColors.pending
                    }`}
                  >
                    {statusLabels[selectedReview.status] ||
                      selectedReview.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeModerateModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
