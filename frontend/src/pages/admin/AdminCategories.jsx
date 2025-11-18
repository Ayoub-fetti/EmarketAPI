import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminCategoriesService } from "../../services/admin/adminCategoriesService";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState(null);
  const [softDeletingId, setSoftDeletingId] = useState(null);
  const [categoryPendingSoftDelete, setCategoryPendingSoftDelete] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

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
        "Erreur lors du chargement des catégories.";
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
      return "Cette catégorie existe déjà.";
    }
    return rawMessage;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("Saisis un nom de catégorie valide.");
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
      toast.success("Catégorie créée avec succès.");
      setNewCategoryName("");
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Impossible de créer la catégorie.",
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
      toast.error("Saisis un nom de catégorie valide.");
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
      toast.success("Catégorie mise à jour.");
      resetEditing();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Impossible de modifier la catégorie.",
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
      toast.success("Catégorie supprimée.");
      if (editingCategory?._id === category._id) {
        resetEditing();
      }
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Impossible de supprimer la catégorie.",
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
      toast.success("Catégorie désactivée.");
      if (editingCategory?._id === category._id) {
        resetEditing();
      }
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Impossible de désactiver la catégorie.",
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
      toast.success("Catégorie restaurée.");
      await fetchCategories();
    } catch (err) {
      const message = normaliseErrorMessage(
        err,
        "Impossible de restaurer la catégorie.",
      );
      toast.error(message);
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">Erreur</div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchCategories}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          Gestion des catégories
        </h2>
        <p className="text-sm text-gray-500">
          Crée, modifie ou supprime les catégories disponibles dans le
          catalogue.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Nouvelle catégorie
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Ajoute une nouvelle catégorie pour classifier les produits.
          </p>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label
                htmlFor="new-category-name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom de la catégorie
              </label>
              <input
                id="new-category-name"
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ex: Electronique"
                disabled={creating}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className={[
                "inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition",
                creating
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700",
              ].join(" ")}
            >
              {creating ? "Création..." : "Créer la catégorie"}
            </button>
          </form>
        </div>

        {editingCategory && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Modifier la catégorie
                </h3>
                <p className="text-sm text-gray-500">
                  Mets à jour le nom de la catégorie sélectionnée.
                </p>
              </div>
              <button
                type="button"
                onClick={resetEditing}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Annuler
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleUpdate}>
              <div>
                <label
                  htmlFor="editing-category-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom de la catégorie
                </label>
                <input
                  id="editing-category-name"
                  type="text"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={savingEdit}
                />
              </div>
              <button
                type="submit"
                disabled={savingEdit}
                className={[
                  "inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition",
                  savingEdit
                    ? "bg-emerald-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700",
                ].join(" ")}
              >
                {savingEdit ? "Enregistrement..." : "Mettre à jour"}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Afficher:</label>
          <button
            type="button"
            onClick={() => setShowDeleted(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              !showDeleted
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Actives ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setShowDeleted(true)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              showDeleted
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Supprimées ({deletedCategories.length})
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {showDeleted ? "Catégories supprimées" : "Liste des catégories"}
            </h3>
            <p className="text-sm text-gray-500">
              {sortedCategories.length} catégorie
              {sortedCategories.length > 1 ? "s" : ""} trouvée
              {sortedCategories.length > 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Nom", "Créée le", "Actions"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sortedCategories.map((category) => (
                <tr key={category._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {!showDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => beginEdit(category)}
                            className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmSoftDelete(category)}
                            className={[
                              "rounded-md border border-yellow-200 px-3 py-1 text-xs font-semibold transition",
                              softDeletingId === category._id
                                ? "bg-yellow-100 text-yellow-400 cursor-not-allowed"
                                : "text-yellow-600 hover:bg-yellow-50",
                            ].join(" ")}
                          >
                            {softDeletingId === category._id ? "Désactivation..." : "Désactiver"}
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(category)}
                            className={[
                              "rounded-md border border-red-200 px-3 py-1 text-xs font-semibold transition",
                              deletingId === category._id
                                ? "bg-red-100 text-red-400 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50",
                            ].join(" ")}
                          >
                            {deletingId === category._id ? "Suppression..." : "Supprimer"}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestore(category)}
                          disabled={restoringId === category._id}
                          className={[
                            "rounded-md border border-green-200 px-3 py-1 text-xs font-semibold transition",
                            restoringId === category._id
                              ? "bg-green-100 text-green-400 cursor-not-allowed"
                              : "text-green-600 hover:bg-green-50",
                          ].join(" ")}
                        >
                          {restoringId === category._id ? "Restauration..." : "Restaurer"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Aucune catégorie pour le moment. Commence par en créer une
                    nouvelle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {categoryPendingSoftDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Désactiver la catégorie
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              Tu es sur le point de désactiver la catégorie{" "}
              <span className="font-semibold text-gray-900">
                "{categoryPendingSoftDelete.name}"
              </span>
              . La catégorie sera retirée de la liste active mais pourra être restaurée plus tard.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (softDeletingId) return;
                  setCategoryPendingSoftDelete(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                disabled={Boolean(softDeletingId)}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={performSoftDelete}
                disabled={softDeletingId === categoryPendingSoftDelete._id}
                className={[
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition",
                  softDeletingId === categoryPendingSoftDelete._id
                    ? "bg-yellow-300 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700",
                ].join(" ")}
              >
                {softDeletingId === categoryPendingSoftDelete._id
                  ? "Désactivation..."
                  : "Désactiver"}
              </button>
            </div>
          </div>
        </div>
      )}

      {categoryPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmer la suppression
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              Tu es sur le point de supprimer définitivement la catégorie{" "}
              <span className="font-semibold text-gray-900">
                "{categoryPendingDelete.name}"
              </span>
              . Cette action est irréversible.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deletingId) return;
                  setCategoryPendingDelete(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                disabled={Boolean(deletingId)}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={deletingId === categoryPendingDelete._id}
                className={[
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition",
                  deletingId === categoryPendingDelete._id
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700",
                ].join(" ")}
              >
                {deletingId === categoryPendingDelete._id
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


