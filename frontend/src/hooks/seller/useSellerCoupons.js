import { useState, useEffect, useMemo, useCallback } from "react";
import { couponService } from "../../services/couponService";

export function useSellerCoupons() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Data states
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await couponService.getAllCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des coupons:", error);
      setError(error.response?.data?.message || "Erreur lors du chargement des coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus ? coupon.status === selectedStatus : true;
      const matchesType = selectedType ? coupon.type === selectedType : true;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, searchQuery, selectedStatus, selectedType]);

  // Delete coupon handler
  const deleteCoupon = useCallback(async (couponId) => {
    try {
      await couponService.deleteCoupon(couponId);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du coupon:", error);
      throw error;
    }
  }, []);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback((coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCouponToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!couponToDelete) return;
    try {
      setIsDeleting(true);
      await deleteCoupon(couponToDelete._id);
      closeDeleteModal();
    } catch {
      // Error is already logged in deleteCoupon, but we might want to set it in UI
      // For now, we rely on the error state if we want to show it, but deleteCoupon throws.
    } finally {
      setIsDeleting(false);
    }
  }, [couponToDelete, deleteCoupon, closeDeleteModal]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedType("");
  }, []);

  return {
    coupons,
    filteredCoupons,
    loading,
    error,
    filters: {
      searchQuery,
      setSearchQuery,
      selectedStatus,
      setSelectedStatus,
      selectedType,
      setSelectedType,
    },
    deleteModal: {
      isOpen: isDeleteModalOpen,
      itemToDelete: couponToDelete,
      isDeleting,
      openDeleteModal,
      closeDeleteModal,
    },
    deleteCoupon: handleDeleteConfirm, // This matches what the component expects for "onConfirm"
    resetFilters,
    refreshCoupons: fetchCoupons,
  };
}
