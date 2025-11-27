import React, { memo } from "react";
import {
  FaEdit,
  FaBan,
  FaTrash,
  FaUndo,
  FaTags,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminCategoriesTable = memo(
  ({
    categories,
    showDeleted,
    onEdit,
    onSoftDelete,
    onDelete,
    onRestore,
    softDeletingId,
    deletingId,
    restoringId,
    searchQuery,
  }) => {
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {["Name", "Created On", "Actions"].map((header) => (
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
              {categories.map((category) => (
                <tr
                  key={category._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900">
                    <div className="truncate max-w-[200px] sm:max-w-none">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {!showDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(category)}
                            className="flex items-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                            title="Edit"
                          >
                            <FaEdit className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSoftDelete(category)}
                            disabled={softDeletingId === category._id}
                            className={[
                              "flex items-center gap-1 rounded-lg border border-yellow-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition",
                              softDeletingId === category._id
                                ? "bg-yellow-100 text-yellow-400 cursor-not-allowed"
                                : "text-yellow-600 hover:bg-yellow-50",
                            ].join(" ")}
                            title="Deactivate"
                          >
                            <FaBan className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {softDeletingId === category._id
                                ? "Deactivating..."
                                : "Deactivate"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(category)}
                            disabled={deletingId === category._id}
                            className={[
                              "flex items-center gap-1 rounded-lg border border-red-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition",
                              deletingId === category._id
                                ? "bg-red-100 text-red-400 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50",
                            ].join(" ")}
                            title="Delete"
                          >
                            <FaTrash className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {deletingId === category._id
                                ? "Deleting..."
                                : "Delete"}
                            </span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRestore(category)}
                          disabled={restoringId === category._id}
                          className={[
                            "flex items-center gap-1 rounded-lg border border-green-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition",
                            restoringId === category._id
                              ? "bg-green-100 text-green-400 cursor-not-allowed"
                              : "text-green-600 hover:bg-green-50",
                          ].join(" ")}
                          title="Restore"
                        >
                          <FaUndo className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {restoringId === category._id
                              ? "Restoring..."
                              : "Restore"}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                  >
                    <FaTags className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p>
                      {searchQuery
                        ? "No categories match your search."
                        : "No categories found. Start by creating a new one."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default AdminCategoriesTable;
