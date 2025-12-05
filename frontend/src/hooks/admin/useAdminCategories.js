import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminCategoriesService } from "../../services/admin/adminCategoriesService";

const useAdminCategories = () => {
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
  const [categoryPendingSoftDelete, setCategoryPendingSoftDelete] =
    useState(null);
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
          new Date(category.createdAt)
            .toLocaleDateString("en-US")
            .toLowerCase()
            .includes(query)
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
      const message = normaliseErrorMessage(err, "Unable to create category.");
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
        }
      );
      if (updated?._id) {
        setCategories((prev) =>
          prev.map((category) =>
            category._id === updated._id
              ? { ...category, ...updated }
              : category
          )
        );
      } else {
        await fetchCategories();
      }
      toast.success("Category updated successfully.");
      resetEditing();
    } catch (err) {
      const message = normaliseErrorMessage(err, "Unable to update category.");
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
      setCategories((prev) => prev.filter((item) => item._id !== category._id));
      toast.success("Category deleted successfully.");
      if (editingCategory?._id === category._id) {
        resetEditing();
      }
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(err, "Unable to delete category.");
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
      setCategories((prev) => prev.filter((item) => item._id !== category._id));
      toast.success("Category deactivated successfully.");
      if (editingCategory?._id === category._id) {
        resetEditing();
      }
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Unable to deactivate category."
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
      const restored = await adminCategoriesService.restoreCategory(
        category._id
      );
      setDeletedCategories((prev) =>
        prev.filter((item) => item._id !== category._id)
      );
      toast.success("Category restored successfully.");
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(err, "Unable to restore category.");
      toast.error(message);
    } finally {
      setRestoringId(null);
    }
  };

  return {
    categories,
    deletedCategories,
    loading,
    error,
    showDeleted,
    setShowDeleted,
    newCategoryName,
    setNewCategoryName,
    creating,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingCategory,
    setEditingCategory,
    editingName,
    setEditingName,
    savingEdit,
    deletingId,
    categoryPendingDelete,
    setCategoryPendingDelete,
    softDeletingId,
    categoryPendingSoftDelete,
    setCategoryPendingSoftDelete,
    restoringId,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    filteredCategories,
    paginatedCategories,
    totalPages,
    handleCreate,
    beginEdit,
    handleUpdate,
    confirmDelete,
    performDelete,
    confirmSoftDelete,
    performSoftDelete,
    handleRestore,
    resetEditing,
  };
};

export default useAdminCategories;
