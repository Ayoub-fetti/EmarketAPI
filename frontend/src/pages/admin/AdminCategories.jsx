import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminCategoriesService } from "../../services/admin/adminCategoriesService";
import {
  FaPlus,
  FaEdit,
  FaBan,
  FaTrash,
  FaUndo,
  FaTags,
  FaTimesCircle,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState(null);
  const [softDeletingId, setSoftDeletingId] = useState(null);
  const [categoryPendingSoftDelete, setCategoryPendingSoftDelete] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, deleted] = await Promise.all([
        adminCategoriesService.fetchCategories(),
        adminCategoriesService.fetchDeletedCategories(),
      ]);
      setCategories(active);
      setDeletedCategories(deleted);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error loading categories.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const sortedCategories = useMemo(() => {
    const source = showDeleted ? deletedCategories : categories;
    return [...source].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [categories, deletedCategories, showDeleted]);

  const filteredCategories = useMemo(() => {
    let source = sortedCategories;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      source = source.filter(
        (category) =>
          category.name?.toLowerCase().includes(query) ||
          new Date(category.createdAt).toLocaleDateString("en-US").toLowerCase().includes(query)
      );
    }
    
    return source;
  }, [sortedCategories, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showDeleted]);

  const resetEditing = () => {
    setEditingCategory(null);
    setEditingName("");
    setSavingEdit(false);
  };

  const normaliseErrorMessage = (err, fallback) => {
    const rawMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      fallback;
    if (typeof rawMessage === "string" && rawMessage.includes("E11000")) {
      return "This category already exists.";
    }
    return rawMessage;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("Please enter a valid category name.");
      return;
    }
    setCreating(true);
    try {
      const created = await adminCategoriesService.createCategory({
        name: trimmedName,
      });
      if (created?._id) {
        setCategories((prev) => [created, ...prev]);
      } else {
        await fetchCategories();
      }
      toast.success("Category created successfully.");
      setNewCategoryName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Unable to create category.",
      );
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const beginEdit = (category) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingCategory) return;
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      toast.error("Please enter a valid category name.");
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await adminCategoriesService.updateCategory(
        editingCategory._id,
        {
        name: trimmedName,
        },
      );
      if (updated?._id) {
        setCategories((prev) =>
          prev.map((category) =>
            category._id === updated._id ? { ...category, ...updated } : category,
          ),
        );
      } else {
        await fetchCategories();
      }
      toast.success("Category updated successfully.");
      resetEditing();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Unable to update category.",
      );
      toast.error(message);
      setSavingEdit(false);
    }
  };

  const confirmDelete = (category) => {
    setCategoryPendingDelete(category);
  };

  const performDelete = async () => {
    if (!categoryPendingDelete) return;
    const category = categoryPendingDelete;
    setDeletingId(category._id);
    try {
      await adminCategoriesService.deleteCategory(category._id);
      setCategories((prev) =>
        prev.filter((item) => item._id !== category._id),
      );
      toast.success("Category deleted successfully.");
      if (editingCategory?._id === category._id) {
        resetEditing();
      }
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Unable to delete category.",
      );
      toast.error(message);
    } finally {
      setDeletingId(null);
      setCategoryPendingDelete(null);
    }
  };

  const confirmSoftDelete = (category) => {
    setCategoryPendingSoftDelete(category);
  };

  const performSoftDelete = async () => {
    if (!categoryPendingSoftDelete) return;
    const category = categoryPendingSoftDelete;
    setSoftDeletingId(category._id);
    try {
      await adminCategoriesService.softDeleteCategory(category._id);
      setCategories((prev) =>
        prev.filter((item) => item._id !== category._id),
      );
      toast.success("Category deactivated successfully.");
      if (editingCategory?._id === category._id) {
        resetEditing();
      }
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Unable to deactivate category.",
      );
      toast.error(message);
    } finally {
      setSoftDeletingId(null);
      setCategoryPendingSoftDelete(null);
    }
  };

  const handleRestore = async (category) => {
    setRestoringId(category._id);
    try {
      const restored = await adminCategoriesService.restoreCategory(category._id);
      setDeletedCategories((prev) =>
        prev.filter((item) => item._id !== category._id),
      );
      toast.success("Category restored successfully.");
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Unable to restore category.",
      );
      toast.error(message);
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading categories...</p>
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
          onClick={fetchCategories}
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
          Categories Management
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Create, modify, or delete categories available in the catalog.
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
            placeholder="Search by category name or date..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
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
              Active ({categories.length})
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
              Deleted ({deletedCategories.length})
            </button>
          </div>
          <div className="ml-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-green-700 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Create Category</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {showDeleted ? "Deleted Categories" : "Active Categories"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"} found.
            {searchQuery && ` (filtered from ${sortedCategories.length} total)`}
          </p>
        </div>

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
                {paginatedCategories.map((category) => (
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
                      ? new Date(category.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {!showDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => beginEdit(category)}
                            className="flex items-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                            title="Edit"
                          >
                            <FaEdit className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmSoftDelete(category)}
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
                              {softDeletingId === category._id ? "Deactivating..." : "Deactivate"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(category)}
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
                              {deletingId === category._id ? "Deleting..." : "Delete"}
                            </span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestore(category)}
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
                            {restoringId === category._id ? "Restoring..." : "Restore"}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                  >
                    <FaTags className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p>{searchQuery ? "No categories match your search." : "No categories found. Start by creating a new one."}</p>
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
              {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of{" "}
              {filteredCategories.length} categories
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

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Create New Category
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Add a new category to classify products.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <div>
                <label
                  htmlFor="new-category-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category Name *
                </label>
                <input
                  id="new-category-name"
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="e.g., Electronics"
                  disabled={creating}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (creating) return;
                    setIsCreateModalOpen(false);
                    setNewCategoryName("");
                  }}
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

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Edit Category
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Update the name of the selected category.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleUpdate}>
              <div>
                <label
                  htmlFor="editing-category-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category Name *
                </label>
                <input
                  id="editing-category-name"
                  type="text"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  disabled={savingEdit}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (savingEdit) return;
                    resetEditing();
                  }}
                  disabled={savingEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Category Modal */}
      {categoryPendingSoftDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Deactivate Category
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              You are about to deactivate the category{" "}
              <span className="font-semibold text-gray-900">
                "{categoryPendingSoftDelete.name}"
              </span>
              . The category will be removed from the active list but can be restored later.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (softDeletingId) return;
                  setCategoryPendingSoftDelete(null);
                }}
                disabled={Boolean(softDeletingId)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performSoftDelete}
                disabled={softDeletingId === categoryPendingSoftDelete._id}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md",
                  softDeletingId === categoryPendingSoftDelete._id
                    ? "bg-yellow-300 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700",
                ].join(" ")}
              >
                {softDeletingId === categoryPendingSoftDelete._id
                  ? "Deactivating..."
                  : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {categoryPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl my-auto">
            <h3 className="text-lg font-bold text-gray-900">
              Confirm Deletion
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              You are about to permanently delete the category{" "}
              <span className="font-semibold text-gray-900">
                "{categoryPendingDelete.name}"
              </span>
              . This action is irreversible.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deletingId) return;
                  setCategoryPendingDelete(null);
                }}
                disabled={Boolean(deletingId)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={deletingId === categoryPendingDelete._id}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md",
                  deletingId === categoryPendingDelete._id
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700",
                ].join(" ")}
              >
                {deletingId === categoryPendingDelete._id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


