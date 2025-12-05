import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { adminCouponsService } from "../../services/admin/adminCouponsService";
import { useAuth } from "../../context/AuthContext";

export default function useAdminCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minimumPurchase: "",
    startDate: "",
    expirationDate: "",
    maxUsage: "",
    maxUsagePerUser: "1",
    status: "active",
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminCouponsService.fetchAllCoupons();
      setCoupons(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error loading coupons.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-US") : "—");

  const filteredCoupons = useMemo(() => {
    let source = coupons;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      source = source.filter(
        (coupon) =>
          coupon.code?.toLowerCase().includes(query) ||
          coupon.type?.toLowerCase().includes(query) ||
          coupon.status?.toLowerCase().includes(query) ||
          String(coupon.value || "").includes(query) ||
          formatDate(coupon.startDate).toLowerCase().includes(query) ||
          formatDate(coupon.expirationDate).toLowerCase().includes(query)
      );
    }

    return source;
  }, [coupons, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCoupons.slice(startIndex, endIndex);
  }, [filteredCoupons, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minimumPurchase: "",
      startDate: "",
      expirationDate: "",
      maxUsage: "",
      maxUsagePerUser: "1",
      status: "active",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
    setCreating(false);
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      type: coupon.type || "percentage",
      value: coupon.value?.toString() || "",
      minimumPurchase: coupon.minimumPurchase?.toString() || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
      expirationDate: coupon.expirationDate
        ? new Date(coupon.expirationDate).toISOString().slice(0, 16)
        : "",
      maxUsage: coupon.maxUsage?.toString() || "",
      maxUsagePerUser: coupon.maxUsagePerUser?.toString() || "1",
      status: coupon.status || "active",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCoupon(null);
    resetForm();
    setUpdating(false);
  };

  const openViewModal = async (coupon) => {
    try {
      const details = await adminCouponsService.fetchCouponById(coupon._id);
      setSelectedCoupon(details);
      setIsViewModalOpen(true);
    } catch (err) {
      toast.error("Unable to load coupon details.");
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCoupon(null);
  };

  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCoupon(null);
    setDeleting(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value || !formData.startDate || !formData.expirationDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString(),
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser) || 1,
        status: formData.status,
        createdBy: user?.id,
      };

      const created = await adminCouponsService.createCoupon(payload);
      toast.success("Coupon created successfully.");
      closeCreateModal();
      await fetchCoupons();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to create coupon.";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCoupon) return;

    setUpdating(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString(),
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser) || 1,
        status: formData.status,
      };

      const updated = await adminCouponsService.updateCoupon(selectedCoupon._id, payload);
      toast.success("Coupon updated successfully.");
      closeEditModal();
      await fetchCoupons();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to update coupon.";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setDeleting(true);
    try {
      await adminCouponsService.deleteCoupon(selectedCoupon._id);
      toast.success("Coupon deleted successfully.");
      setCoupons((prev) => prev.filter((c) => c._id !== selectedCoupon._id));
      closeDeleteModal();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to delete coupon.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return {
    coupons,
    loading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isDeleteModalOpen,
    selectedCoupon,
    creating,
    updating,
    deleting,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedCoupons,
    filteredCoupons,
    formData,
    setFormData,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    openDeleteModal,
    closeDeleteModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchCoupons,
  };
}
