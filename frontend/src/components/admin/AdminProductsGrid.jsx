import React, { memo } from "react";
import {
  FaEye,
  FaBan,
  FaTrash,
  FaUndo,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
});

const AdminProductsGrid = memo(
  ({
    products,
    showDeleted,
    onViewDetails,
    onTogglePublish,
    onDeactivate,
    onDelete,
    onRestore,
  }) => {
    if (products.length === 0) {
      return (
        <div className="text-center py-12 sm:py-16">
          <FaBox className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xs sm:text-sm text-gray-500">
            {showDeleted ? "No deleted products." : "No active products."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
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
                      : `${
                          import.meta.env.VITE_BACKEND_URL?.replace(
                            "/api",
                            ""
                          ) || ""
                        }${product.primaryImage}`
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
                  onClick={() => onViewDetails(product._id)}
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
                      onClick={() => onTogglePublish(product)}
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
                      onClick={() => onDeactivate(product)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-yellow-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                      title="Deactivate"
                    >
                      <FaBan className="w-3 h-3" />
                      <span className="hidden sm:inline">Deactivate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
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
                      onClick={() => onRestore(product)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-green-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                      title="Restore"
                    >
                      <FaUndo className="w-3 h-3" />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
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
    );
  }
);

export default AdminProductsGrid;
