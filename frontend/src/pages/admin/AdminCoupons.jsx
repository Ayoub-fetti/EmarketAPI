import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminCouponsService } from "../../services/admin/adminCouponsService";
import { useAuth } from "../../context/AuthContext";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaTicketAlt,
  FaTimesCircle,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

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

export default function AdminCoupons() {
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
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error loading coupons.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

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
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().slice(0, 16)
        : "",
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
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to create coupon.";
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
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to update coupon.";
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
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to delete coupon.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading coupons...</p>
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
          onClick={fetchCoupons}
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
          Coupons Management
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Create, modify, and manage discount coupons.
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
            placeholder="Search by code, type, status, value, or date..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-green-700 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Coupons List
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filteredCoupons.length} coupon{filteredCoupons.length !== 1 ? "s" : ""} found.
            {searchQuery && ` (filtered from ${coupons.length} total)`}
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {[
                    "Code",
                    "Type",
                    "Value",
                    "Start Date",
                    "End Date",
                    "Status",
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
                {paginatedCoupons.map((coupon) => (
                <tr 
                  key={coupon._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 font-mono">
                    <div className="truncate max-w-[120px] sm:max-w-none">
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                    {typeLabels[coupon.type] || coupon.type}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `${coupon.value} MAD`}
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
                        onClick={() => openViewModal(coupon)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="w-3 h-3" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(coupon)}
                        className="flex items-center gap-1 rounded-lg border border-orange-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                        title="Edit"
                      >
                        <FaEdit className="w-3 h-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(coupon)}
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
              {paginatedCoupons.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                  >
                    <FaTicketAlt className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p>{searchQuery ? "No coupons match your search." : "No coupons found. Start by creating a new one."}</p>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} of{" "}
              {filteredCoupons.length} coupons
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
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-xs sm:text-sm text-gray-500">...</span>
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 sm:py-6 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Create New Coupon
            </h3>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="DISCOUNT10"
                    required
                    minLength={6}
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed (MAD)</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder={formData.type === "percentage" ? "10" : "50"}
                    required
                    min={0}
                    max={formData.type === "percentage" ? 100 : undefined}
                    step="0.01"
                  />
                  {formData.type === "percentage" && (
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum 100%
                    </p>
                  )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Minimum Purchase
                  </label>
                  <input
                    type="number"
                    value={formData.minimumPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumPurchase: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="0"
                    min={0}
                    step="0.01"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expirationDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Max Usage
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Max Usage Per User
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsagePerUser}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsagePerUser: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 sm:py-6 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Edit Coupon
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Code: {selectedCoupon.code}
            </p>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                    minLength={6}
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed (MAD)</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                    min={0}
                    max={formData.type === "percentage" ? 100 : undefined}
                    step="0.01"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Minimum Purchase
                  </label>
                  <input
                    type="number"
                    value={formData.minimumPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumPurchase: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    min={0}
                    step="0.01"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expirationDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Max Usage
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    min={1}
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Max Usage Per User
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsagePerUser}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsagePerUser: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Coupon Details
              </h3>
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Code:</span>
                <p className="text-sm text-gray-900 font-mono font-semibold mt-1">
                  {selectedCoupon.code}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <p className="text-sm text-gray-900 mt-1">
                  {typeLabels[selectedCoupon.type] || selectedCoupon.type}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Value:</span>
                <p className="text-sm text-gray-900 font-semibold mt-1">
                  {selectedCoupon.type === "percentage"
                    ? `${selectedCoupon.value}%`
                    : `${selectedCoupon.value} MAD`}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Minimum Purchase:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedCoupon.minimumPurchase || 0} MAD
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Start Date:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDateTime(selectedCoupon.startDate)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  End Date:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDateTime(selectedCoupon.expirationDate)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Max Usage:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedCoupon.maxUsage || "Unlimited"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Max Usage Per User:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedCoupon.maxUsagePerUser || 1}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm mt-1 ${
                    statusColors[selectedCoupon.status] || statusColors.active
                  }`}
                >
                  {statusLabels[selectedCoupon.status] || selectedCoupon.status}
                </span>
              </div>
              {selectedCoupon.usedBy && selectedCoupon.usedBy.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Used {selectedCoupon.usedBy.length} time{selectedCoupon.usedBy.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Delete Coupon
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              You are about to permanently delete the coupon{" "}
              <span className="font-semibold text-gray-900">
                "{selectedCoupon.code}"
              </span>
              . This action is irreversible.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

