import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminProductsService } from "../../services/admin/adminProductsService";
import {
  FaEye,
  FaEdit,
  FaBan,
  FaTrash,
  FaUndo,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
});

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

const buildErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || err.message || fallback;

export default function AdminProducts() {
  const [activeProducts, setActiveProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [productDetailsCache, setProductDetailsCache] = useState({});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const [pendingAction, setPendingAction] = useState(null); // { type: 'delete' | 'deactivate' | 'restore', product }
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const updateCache = (product) => {
    if (!product?._id) return;
    setProductDetailsCache((prev) => ({ ...prev, [product._id]: product }));
  };

  const removeFromCache = (productId) => {
    setProductDetailsCache((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, deleted] = await Promise.all([
        adminProductsService.fetchActiveProducts(),
        adminProductsService.fetchDeletedProducts(),
      ]);
      setActiveProducts(active);
      setDeletedProducts(deleted);
    } catch (err) {
      setError(
        buildErrorMessage(err, "Error loading products."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const openDetailsModal = async (productId) => {
    setSelectedProductId(productId);
    setIsDetailsModalOpen(true);
    
    const cached = productDetailsCache[productId];
    if (cached) {
      setSelectedProduct(cached);
      return;
    }

    const fallback =
      activeProducts.find((p) => p._id === productId) ||
      deletedProducts.find((p) => p._id === productId);
    if (fallback) {
      setSelectedProduct(fallback);
    }

    setLoadingDetails(true);
    try {
      const product = await adminProductsService.fetchProductDetails(productId);
      if (product) {
        setSelectedProduct(product);
        updateCache(product);
      }
    } catch (err) {
      toast.error(
        buildErrorMessage(
          err,
          "Unable to fetch product details.",
        ),
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProductId(null);
    setSelectedProduct(null);
  };

  const sortedActiveProducts = useMemo(() => {
    return [...activeProducts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [activeProducts]);

  const sortedDeletedProducts = useMemo(() => {
    return [...deletedProducts].sort((a, b) => {
      const dateA = new Date(a.deletedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.deletedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [deletedProducts]);

  const filteredProducts = useMemo(() => {
    const source = showDeleted ? sortedDeletedProducts : sortedActiveProducts;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return source.filter(
        (product) =>
          product.title?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.seller_id?.fullname?.toLowerCase().includes(query) ||
          product.seller_id?.email?.toLowerCase().includes(query) ||
          product.category_id?.name?.toLowerCase().includes(query) ||
          String(product.price || "").includes(query) ||
          String(product.stock || "").includes(query)
      );
    }
    
    return source;
  }, [sortedActiveProducts, sortedDeletedProducts, showDeleted, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showDeleted]);

  const handleTogglePublish = async (product) => {
    const originalState = product.published;
    setActiveProducts((prev) =>
      prev.map((item) =>
        item._id === product._id ? { ...item, published: !originalState } : item,
      ),
    );
    if (selectedProductId === product._id) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, published: !originalState } : prev,
      );
    }
    updateCache({
      ...(productDetailsCache[product._id] || product),
      published: !originalState,
    });

    try {
      const response = await adminProductsService.togglePublish(product._id);
      const updated = response?.data ?? {
        ...product,
        published: !originalState,
      };
      setActiveProducts((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, ...updated } : item,
        ),
      );
      if (selectedProductId === product._id) {
        setSelectedProduct(updated);
      }
      updateCache(updated);
      toast.success(
        response?.message ||
          (updated.published ? "Product published." : "Product unpublished."),
      );
    } catch (err) {
      setActiveProducts((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, published: originalState } : item,
        ),
      );
      if (selectedProductId === product._id) {
        setSelectedProduct((prev) =>
          prev ? { ...prev, published: originalState } : prev,
        );
      }
      updateCache({
        ...(productDetailsCache[product._id] || product),
        published: originalState,
      });
      toast.error(
        buildErrorMessage(
          err,
          "Unable to change publication status.",
        ),
      );
    }
  };

  const performDelete = async (product) => {
    try {
      const response = await adminProductsService.deleteProduct(product._id);
      setActiveProducts((prev) =>
        prev.filter((item) => item._id !== product._id),
      );
      setDeletedProducts((prev) =>
        prev.filter((item) => item._id !== product._id),
      );
      removeFromCache(product._id);
      if (selectedProductId === product._id) {
        setSelectedProductId(null);
        setSelectedProduct(null);
      }
      toast.success(response?.message || "Product permanently deleted.");
    } catch (err) {
      toast.error(
        buildErrorMessage(err, "Unable to delete product."),
      );
      throw err;
    }
  };

  const performSoftDelete = async (product) => {
    try {
      const response = await adminProductsService.softDeleteProduct(
        product._id,
      );
      const updated =
        response?.data ??
        {
          ...product,
          published: false,
          deletedAt: new Date().toISOString(),
        };
      setActiveProducts((prev) =>
        prev.filter((item) => item._id !== product._id),
      );
      setDeletedProducts((prev) => [updated, ...prev]);
      updateCache(updated);
      if (selectedProductId === product._id) {
        setSelectedProduct(updated);
      }
      toast.success(response?.message || "Product deactivated.");
    } catch (err) {
      toast.error(
        buildErrorMessage(err, "Unable to deactivate product."),
      );
      throw err;
    }
  };

  const performRestore = async (product) => {
    try {
      const response = await adminProductsService.restoreProduct(product._id);
      const updated =
        response?.data ?? { ...product, deletedAt: null, published: false };
      setDeletedProducts((prev) =>
        prev.filter((item) => item._id !== product._id),
      );
      setActiveProducts((prev) => [updated, ...prev]);
      updateCache(updated);
      if (selectedProductId === product._id) {
        setSelectedProduct(updated);
      }
      toast.success(response?.message || "Product restored.");
    } catch (err) {
      toast.error(
        buildErrorMessage(err, "Unable to restore product."),
      );
      throw err;
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      if (pendingAction.type === "delete") {
        await performDelete(pendingAction.product);
      } else if (pendingAction.type === "deactivate") {
        await performSoftDelete(pendingAction.product);
      } else if (pendingAction.type === "restore") {
        await performRestore(pendingAction.product);
      }
      setPendingAction(null);
    } catch {
      // Modal remains open so the admin can retry.
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading products...</p>
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
          onClick={loadInventory}
          className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isModalOpen = Boolean(pendingAction);
  const modalTitle =
    pendingAction?.type === "delete"
      ? "Permanently Delete"
      : pendingAction?.type === "deactivate"
      ? "Deactivate Product"
      : "Restore Product";
  const modalMessage =
    pendingAction?.type === "delete"
      ? "This action will permanently delete the product from the database."
      : pendingAction?.type === "deactivate"
      ? "The product will be removed from the catalog but can be restored later."
      : "The product will be put back online for users.";

  return (
    <section className="space-y-4 sm:space-y-6">
      <header className="space-y-2 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Products Management
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Publish, deactivate, restore, or delete products according to store rules.
        </p>
      </header>

      {/* Search, Filters and Actions */}
      <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, seller, category, price, or stock..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Toggle Active/Deleted */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Show:</label>
          <button
            type="button"
            onClick={() => setShowDeleted(false)}
            className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
              !showDeleted
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active ({sortedActiveProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setShowDeleted(true)}
            className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
              showDeleted
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Deleted ({sortedDeletedProducts.length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {showDeleted ? "Deleted Products" : "Active Products"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found.
            {searchQuery && ` (filtered from ${(showDeleted ? sortedDeletedProducts : sortedActiveProducts).length} total)`}
          </p>
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <FaBox className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xs sm:text-sm text-gray-500">
              {searchQuery ? "No products match your search." : (showDeleted ? "No deleted products." : "No active products.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-500 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative w-full h-40 sm:h-48 bg-gray-100 overflow-hidden">
                  {product.primaryImage ? (
                    <img
                      src={
                        product.primaryImage.startsWith("http")
                          ? product.primaryImage
                          : `${import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || ""}${product.primaryImage}`
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaBox className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {product.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-green-200 px-2 py-1 text-xs font-bold shadow-sm">
                        <FaCheckCircle className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-1 text-xs font-bold shadow-sm">
                        <FaTimesCircle className="w-3 h-3" />
                        Unpublished
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1">
                    {product.description || "No description"}
                  </p>

                  {/* Seller Info */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Seller:</p>
                    <p className="text-xs font-medium text-gray-700">
                      {product.seller_id?.fullname ||
                        product.seller_id?.email ||
                        "—"}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xl font-bold text-orange-600">
                        {currencyFormatter.format(product.price ?? 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p
                        className={`text-sm font-semibold ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stock ?? "—"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => openDetailsModal(product._id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      title="View Details"
                    >
                      <FaEye className="w-3 h-3" />
                      <span className="hidden sm:inline">Details</span>
                    </button>
                    {!showDeleted ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(product)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-emerald-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                          title={product.published ? "Unpublish" : "Publish"}
                        >
                          {product.published ? (
                            <>
                              <FaTimesCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Unpublish</span>
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Publish</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({
                              type: "deactivate",
                              product,
                            })
                          }
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-yellow-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          title="Deactivate"
                        >
                          <FaBan className="w-3 h-3" />
                          <span className="hidden sm:inline">Deactivate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({ type: "delete", product })
                          }
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <FaTrash className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({ type: "restore", product })
                          }
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-green-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                          title="Restore"
                        >
                          <FaUndo className="w-3 h-3" />
                          <span className="hidden sm:inline">Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({ type: "delete", product })
                          }
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <FaTrash className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
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

      {/* Product Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 sm:py-6 overflow-y-auto">
          <div className="w-full sm:w-[90%] lg:w-[80%] max-w-6xl max-h-[90vh] rounded-xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Product Details
              </h3>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-4 sm:p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="text-sm text-gray-500">Loading details...</p>
                  </div>
                </div>
              ) : !selectedProduct ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-red-500">
                    Unable to load product information.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image */}
                  <div>
                    {selectedProduct.primaryImage ? (
                      <img
                        src={
                          selectedProduct.primaryImage.startsWith("http")
                            ? selectedProduct.primaryImage
                            : `${import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || ""}${selectedProduct.primaryImage}`
                        }
                        alt={selectedProduct.title}
                        className="w-full max-w-2xl mx-auto rounded-lg border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="w-full max-w-2xl mx-auto h-64 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                        <FaBox className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-6">
                    {/* Product Header */}
                    <div className="border-b border-orange-200 pb-4 sm:pb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words">
                            {selectedProduct.title}
                          </h4>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                                selectedProduct.published
                                  ? "bg-green-500 text-white"
                                  : "bg-yellow-500 text-white"
                              }`}
                            >
                              {selectedProduct.published ? (
                                <>
                                  <FaCheckCircle className="w-4 h-4" />
                                  Published
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="w-4 h-4" />
                                  Unpublished
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">
                          Description
                        </h5>
                        <p className="text-sm text-gray-600">
                          {selectedProduct.description || "—"}
                        </p>
                      </div>

                      {/* Product Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">
                            Price
                          </h5>
                          <p className="text-2xl font-bold text-gray-900">
                            {currencyFormatter.format(selectedProduct.price ?? 0)}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">
                            Stock
                          </h5>
                          <p
                            className={`text-lg font-semibold ${
                              selectedProduct.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedProduct.stock ?? 0} available
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">
                            Seller:
                          </h5>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedProduct.seller_id?.fullname ||
                              selectedProduct.seller_id?.email ||
                              "—"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">
                            Created on:
                          </h5>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(selectedProduct.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {modalTitle}
            </h3>
            <p className="mt-3 text-sm text-gray-600">{modalMessage}</p>
            <p className="mt-2 text-sm text-gray-800">
              Product:{" "}
              <span className="font-semibold">
                "{pendingAction?.product?.title ?? "—"}"
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  setPendingAction(null);
                }}
                disabled={actionLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md",
                  pendingAction?.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : pendingAction?.type === "deactivate"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700",
                ].join(" ")}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

