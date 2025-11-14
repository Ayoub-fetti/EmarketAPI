import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminProductsService } from "../../services/admin/adminProductsService";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "MAD",
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("fr-FR", {
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

  const [pendingAction, setPendingAction] = useState(null); // { type: 'delete' | 'deactivate' | 'restore', product }
  const [actionLoading, setActionLoading] = useState(false);

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
        buildErrorMessage(err, "Erreur lors du chargement des produits."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null);
      return;
    }

    const cached = productDetailsCache[selectedProductId];
    if (cached) {
      setSelectedProduct(cached);
      return;
    }

    const fallback =
      activeProducts.find((p) => p._id === selectedProductId) ||
      deletedProducts.find((p) => p._id === selectedProductId);
    if (fallback) {
      setSelectedProduct(fallback);
    }

    setLoadingDetails(true);
    adminProductsService
      .fetchProductDetails(selectedProductId)
      .then((product) => {
        if (!product) return;
        setSelectedProduct(product);
        updateCache(product);
      })
      .catch((err) => {
        toast.error(
          buildErrorMessage(
            err,
            "Impossible de récupérer les détails du produit.",
          ),
        );
      })
      .finally(() => setLoadingDetails(false));
  }, [
    selectedProductId,
    productDetailsCache,
    activeProducts,
    deletedProducts,
  ]);

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
          (updated.published ? "Produit publié." : "Produit dépublié."),
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
          "Impossible de changer le statut de publication.",
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
      toast.success(response?.message || "Produit supprimé définitivement.");
    } catch (err) {
      toast.error(
        buildErrorMessage(err, "Impossible de supprimer le produit."),
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
      toast.success(response?.message || "Produit désactivé.");
    } catch (err) {
      toast.error(
        buildErrorMessage(err, "Impossible de désactiver le produit."),
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
      toast.success(response?.message || "Produit restauré.");
    } catch (err) {
      toast.error(
        buildErrorMessage(err, "Impossible de restaurer le produit."),
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
          onClick={loadInventory}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const isModalOpen = Boolean(pendingAction);
  const modalTitle =
    pendingAction?.type === "delete"
      ? "Supprimer définitivement"
      : pendingAction?.type === "deactivate"
      ? "Désactiver le produit"
      : "Restaurer le produit";
  const modalMessage =
    pendingAction?.type === "delete"
      ? "Cette action supprimera définitivement le produit de la base de données."
      : pendingAction?.type === "deactivate"
      ? "Le produit sera retiré du catalogue mais pourra être restauré plus tard."
      : "Le produit sera remis en ligne pour les utilisateurs.";

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          Gestion des produits
        </h2>
        <p className="text-sm text-gray-500">
          Publie, désactive, restaure ou supprime les produits selon les règles
          de la boutique.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Produits actifs
                </h3>
                <p className="text-sm text-gray-500">
                  {sortedActiveProducts.length} produit
                  {sortedActiveProducts.length > 1 ? "s" : ""} visibles par les
                  clients.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Produit",
                      "Vendeur",
                      "Prix",
                      "Stock",
                      "Statut",
                      "Actions",
                    ].map((header) => (
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
                  {sortedActiveProducts.map((product) => (
                    <tr
                      key={product._id}
                      className={
                        selectedProductId === product._id
                          ? "bg-blue-50"
                          : undefined
                      }
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <button
                          type="button"
                          onClick={() => setSelectedProductId(product._id)}
                          className="text-left text-blue-600 hover:underline"
                        >
                          {product.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.seller_id?.fullname ||
                          product.seller_id?.email ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {currencyFormatter.format(product.price ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.stock ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            product.published
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-yellow-100 text-yellow-700",
                          ].join(" ")}
                        >
                          {product.published ? "Publié" : "Non publié"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProductId(product._id)}
                            className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            Détails
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(product)}
                            className="rounded-md border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                          >
                            {product.published ? "Dépublier" : "Publier"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({
                                type: "deactivate",
                                product,
                              })
                            }
                            className="rounded-md border border-yellow-200 px-3 py-1 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          >
                            Désactiver
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ type: "delete", product })
                            }
                            className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedActiveProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        Aucun produit actif pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Produits désactivés
                </h3>
                <p className="text-sm text-gray-500">
                  {sortedDeletedProducts.length} produit
                  {sortedDeletedProducts.length > 1 ? "s" : ""} en attente
                  d’éventuelle restauration.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Produit", "Vendeur", "Désactivé le", "Actions"].map(
                      (header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          {header}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedDeletedProducts.map((product) => (
                    <tr
                      key={product._id}
                      className={
                        selectedProductId === product._id
                          ? "bg-red-50"
                          : undefined
                      }
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <button
                          type="button"
                          onClick={() => setSelectedProductId(product._id)}
                          className="text-left text-blue-600 hover:underline"
                        >
                          {product.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.seller_id?.fullname ||
                          product.seller_id?.email ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDateTime(product.deletedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProductId(product._id)}
                            className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            Détails
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ type: "restore", product })
                            }
                            className="rounded-md border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                          >
                            Restaurer
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ type: "delete", product })
                            }
                            className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedDeletedProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        Aucun produit désactivé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Détails du produit
          </h3>
          <p className="text-sm text-gray-500">
            Sélectionne un produit pour consulter toutes les informations.
          </p>

          <div className="mt-4 space-y-4">
            {!selectedProductId && (
              <p className="text-sm text-gray-500">
                Aucun produit sélectionné pour le moment.
              </p>
            )}

            {selectedProductId && loadingDetails && (
              <div className="flex h-32 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            )}

            {selectedProductId && !loadingDetails && !selectedProduct && (
              <p className="text-sm text-red-500">
                Impossible de charger les informations de ce produit.
              </p>
            )}

            {selectedProduct && (
              <article className="space-y-4">
                <header>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedProduct.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Ajouté le {formatDate(selectedProduct.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        selectedProduct.published
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700",
                      ].join(" ")}
                    >
                      {selectedProduct.published ? "Publié" : "Non publié"}
                    </span>
                    {selectedProduct.deletedAt && (
                      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Désactivé
                      </span>
                    )}
                  </div>
                </header>

                {selectedProduct.primaryImage && (
                  <img
                    src={
                      selectedProduct.primaryImage.startsWith("http")
                        ? selectedProduct.primaryImage
                        : `${import.meta.env.VITE_BACKEND_URL.replace("/api", "")}${selectedProduct.primaryImage}`
                    }
                    alt={selectedProduct.title}
                    className="w-full rounded-lg border border-gray-200 object-cover"
                  />
                )}

                <div>
                  <h5 className="text-sm font-semibold text-gray-900">
                    Description
                  </h5>
                  <p className="text-sm text-gray-600">
                    {selectedProduct.description || "—"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Prix actuel
                    </h5>
                    <p className="text-sm text-gray-600">
                      {currencyFormatter.format(selectedProduct.price ?? 0)}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Stock disponible
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.stock ?? "—"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Catégories
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.categories?.length
                        ? selectedProduct.categories
                            .map((cat) => cat.name)
                            .join(", ")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Vendeur
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.seller_id?.fullname ||
                        selectedProduct.seller_id?.email ||
                        "—"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Publication
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.published
                        ? "Produit visible actuellement"
                        : "Produit non publié"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Désactivé le
                    </h5>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(selectedProduct.deletedAt)}
                    </p>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {modalTitle}
            </h3>
            <p className="mt-3 text-sm text-gray-600">{modalMessage}</p>
            <p className="mt-2 text-sm text-gray-800">
              Produit ciblé :{" "}
              <span className="font-semibold">
                “{pendingAction?.product?.title ?? "—"}”
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
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70",
                  pendingAction?.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : pendingAction?.type === "deactivate"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-emerald-600 hover:bg-emerald-700",
                ].join(" ")}
              >
                {actionLoading ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

