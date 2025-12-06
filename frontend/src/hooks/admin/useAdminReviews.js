import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { adminReviewsService } from "../../services/admin/adminReviewsService";

export default function useAdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [moderating, setModerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminReviewsService.fetchAllReviews();
      setReviews(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error loading reviews.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-US") : "—");

  const filteredReviews = useMemo(() => {
    let source = reviews;

    // Filter by status
    if (statusFilter !== "all") {
      source = source.filter((review) => review.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      source = source.filter(
        (review) =>
          (typeof review.user === "object" && review.user
            ? (review.user.fullname || "").toLowerCase().includes(query) ||
              (review.user.email || "").toLowerCase().includes(query)
            : false) ||
          (typeof review.product === "object" && review.product
            ? (review.product.title || "").toLowerCase().includes(query)
            : false) ||
          (review.comment || "").toLowerCase().includes(query) ||
          review.status?.toLowerCase().includes(query) ||
          String(review.rating || "").includes(query) ||
          formatDate(review.createdAt).toLowerCase().includes(query)
      );
    }

    return source;
  }, [reviews, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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
      const updated = await adminReviewsService.moderateReview(selectedReview._id, newStatus);
      setReviews((prev) => prev.map((r) => (r._id === selectedReview._id ? updated : r)));
      toast.success("Review moderated successfully.");
      closeModerateModal();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to moderate review.";
      toast.error(message);
    } finally {
      setModerating(false);
    }
  };

  return {
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
  };
}
