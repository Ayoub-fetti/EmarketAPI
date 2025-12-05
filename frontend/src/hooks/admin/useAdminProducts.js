import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { adminProductsService } from "../../services/admin/adminProductsService";

const buildErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  err.message ||
  fallback;

export const useAdminProducts = () => {
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
      setError(buildErrorMessage(err, "Error loading products."));
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
      toast.error(buildErrorMessage(err, "Unable to fetch product details."));
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedProductId(null);
    setSelectedProduct(null);
  }, []);

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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showDeleted]);

  const handleTogglePublish = async (product) => {
    const originalState = product.published;
    setActiveProducts((prev) =>
      prev.map((item) =>
        item._id === product._id ? { ...item, published: !originalState } : item
      )
    );
    if (selectedProductId === product._id) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, published: !originalState } : prev
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
          item._id === product._id ? { ...item, ...updated } : item
        )
      );
      if (selectedProductId === product._id) {
        setSelectedProduct(updated);
      }
      updateCache(updated);
      toast.success(
        response?.message ||
          (updated.published ? "Product published." : "Product unpublished.")
      );
    } catch (err) {
      setActiveProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? { ...item, published: originalState }
            : item
        )
      );
      if (selectedProductId === product._id) {
        setSelectedProduct((prev) =>
          prev ? { ...prev, published: originalState } : prev
        );
      }
      updateCache({
        ...(productDetailsCache[product._id] || product),
        published: originalState,
      });
      toast.error(
        buildErrorMessage(err, "Unable to change publication status.")
      );
    }
  };

  const performDelete = async (product) => {
    try {
      const response = await adminProductsService.deleteProduct(product._id);
      setActiveProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
      setDeletedProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
      removeFromCache(product._id);
      if (selectedProductId === product._id) {
        setSelectedProductId(null);
        setSelectedProduct(null);
      }
      toast.success(response?.message || "Product permanently deleted.");
    } catch (err) {
      toast.error(buildErrorMessage(err, "Unable to delete product."));
      throw err;
    }
  };

  const performSoftDelete = async (product) => {
    try {
      const response = await adminProductsService.softDeleteProduct(
        product._id
      );
      const updated = response?.data ?? {
        ...product,
        published: false,
        deletedAt: new Date().toISOString(),
      };
      setActiveProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
      setDeletedProducts((prev) => [updated, ...prev]);
      updateCache(updated);
      if (selectedProductId === product._id) {
        setSelectedProduct(updated);
      }
      toast.success(response?.message || "Product deactivated.");
    } catch (err) {
      toast.error(buildErrorMessage(err, "Unable to deactivate product."));
      throw err;
    }
  };

  const performRestore = async (product) => {
    try {
      const response = await adminProductsService.restoreProduct(product._id);
      const updated = response?.data ?? {
        ...product,
        deletedAt: null,
        published: false,
      };
      setDeletedProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
      setActiveProducts((prev) => [updated, ...prev]);
      updateCache(updated);
      if (selectedProductId === product._id) {
        setSelectedProduct(updated);
      }
      toast.success(response?.message || "Product restored.");
    } catch (err) {
      toast.error(buildErrorMessage(err, "Unable to restore product."));
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

  return {
    activeProducts,
    deletedProducts,
    loading,
    error,
    selectedProduct,
    loadingDetails,
    isDetailsModalOpen,
    showDeleted,
    setShowDeleted,
    pendingAction,
    setPendingAction,
    actionLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredProducts,
    paginatedProducts,
    totalPages,
    sortedActiveProducts,
    sortedDeletedProducts,
    loadInventory,
    openDetailsModal,
    closeDetailsModal,
    handleTogglePublish,
    handleConfirmAction,
  };
};
