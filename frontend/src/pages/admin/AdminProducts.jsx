import React from "react";
import {
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useAdminProducts } from "../../hooks/admin/useAdminProducts";
import AdminProductsGrid from "../../components/admin/AdminProductsGrid";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
});

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-US") : "—");

export default function AdminProducts() {
  const {
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
  } = useAdminProducts();

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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Products Management</h2>
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
          <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
            Show:
          </label>
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
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found.
            {searchQuery &&
              ` (filtered from ${
                (showDeleted ? sortedDeletedProducts : sortedActiveProducts).length
              } total)`}
          </p>
        </div>

        <AdminProductsGrid
          products={paginatedProducts}
          showDeleted={showDeleted}
          onViewDetails={openDetailsModal}
          onTogglePublish={handleTogglePublish}
          onDeactivate={(p) => setPendingAction({ type: "deactivate", product: p })}
          onDelete={(p) => setPendingAction({ type: "delete", product: p })}
          onRestore={(p) => setPendingAction({ type: "restore", product: p })}
        />

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
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
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
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Product Details</h3>
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
                  <p className="text-sm text-red-500">Unable to load product information.</p>
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
                            : `${
                                import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || ""
                              }${selectedProduct.primaryImage}`
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
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Description</h5>
                        <p className="text-sm text-gray-600">
                          {selectedProduct.description || "—"}
                        </p>
                      </div>

                      {/* Product Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">Price</h5>
                          <p className="text-2xl font-bold text-gray-900">
                            {currencyFormatter.format(selectedProduct.price ?? 0)}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">Stock</h5>
                          <p
                            className={`text-lg font-semibold ${
                              selectedProduct.stock > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {selectedProduct.stock ?? 0} available
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">Seller:</h5>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedProduct.seller_id?.fullname ||
                              selectedProduct.seller_id?.email ||
                              "—"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">Created on:</h5>
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
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">{modalTitle}</h3>
            <p className="mt-3 text-sm text-gray-600">{modalMessage}</p>
            <p className="mt-2 text-sm text-gray-800">
              Product:{" "}
              <span className="font-semibold">"{pendingAction?.product?.title ?? "—"}"</span>
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
