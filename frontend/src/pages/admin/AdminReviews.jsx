import { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { adminReviewsService } from "../../services/admin/adminReviewsService";
import {
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaComments,
} from "react-icons/fa";

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

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [moderating, setModerating] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminReviewsService.fetchAllReviews();
      setReviews(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error loading reviews.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = useMemo(() => {
    if (statusFilter === "all") return reviews;
    return reviews.filter((review) => review.status === statusFilter);
  }, [reviews, statusFilter]);

  const openModerateModal = (review) => {
    setSelectedReview(review);
    setNewStatus(review.status);
    setIsModerateModalOpen(true);
  };

  const closeModerateModal = () => {
    setIsModerateModalOpen(false);
    setSelectedReview(null);
    setNewStatus("");
    setModerating(false);
  };

  const handleModerate = async () => {
    if (!selectedReview || !newStatus) return;
    setModerating(true);
    try {
      const updated = await adminReviewsService.moderateReview(
        selectedReview._id,
        newStatus,
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === selectedReview._id ? updated : r)),
      );
      toast.success("Review moderated successfully.");
      closeModerateModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to moderate review.";
      toast.error(message);
    } finally {
      setModerating(false);
    }
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
    <section className="space-y-6">
      <header className="space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Reviews Moderation
        </h2>
        <p className="text-sm text-gray-600">
          View and moderate user reviews on products.
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-600 font-medium">
          {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""} found
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Reviews List
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""} found.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
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
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredReviews.map((review) => (
                <tr 
                  key={review._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {typeof review.user === "object" && review.user
                          ? review.user.fullname || review.user.email || "—"
                          : "—"}
                      </div>
                      {typeof review.user === "object" &&
                        review.user?.email && (
                          <div className="text-xs text-gray-500 mt-1">
                            {review.user.email}
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {typeof review.product === "object" && review.product
                        ? review.product.title || "Deleted Product"
                        : "Deleted Product"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-gray-600">
                      {review.comment || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                        statusColors[review.status] || statusColors.pending
                      }`}
                    >
                      {statusLabels[review.status] || review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => openModerateModal(review)}
                      className="flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                    >
                      <FaEdit className="w-3 h-3" />
                      Moderate
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <FaComments className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No reviews found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderate Modal */}
      {isModerateModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Moderate Review
            </h3>

            <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <span className="text-xs font-medium text-gray-500">
                  User:
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {typeof selectedReview.user === "object" && selectedReview.user
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
                <span className="text-xs font-medium text-gray-500">Rating:</span>
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
                    {statusLabels[selectedReview.status] || selectedReview.status}
                  </span>
                </div>
              </div>
            </div>

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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (moderating) return;
                  closeModerateModal();
                }}
                disabled={moderating}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModerate}
                disabled={
                  moderating ||
                  !newStatus ||
                  newStatus === selectedReview.status
                }
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
              >
                {moderating ? "Moderating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


