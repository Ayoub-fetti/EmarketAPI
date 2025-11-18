import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { adminOrdersService } from "../../services/admin/adminOrdersService";

const statusLabels = {
  pending: "En attente",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, deleted] = await Promise.all([
        adminOrdersService.fetchAllOrders(),
        adminOrdersService.fetchDeletedOrders(),
      ]);
      setOrders(active);
      setDeletedOrders(deleted);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des commandes.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const source = showDeleted ? deletedOrders : orders;
    if (statusFilter === "all") return source;
    return source.filter((order) => order.status === statusFilter);
  }, [orders, deletedOrders, statusFilter, showDeleted]);

  const selectedOrder = useMemo(() => {
    return filteredOrders.find((o) => o._id === selectedOrderId);
  }, [filteredOrders, selectedOrderId]);

  const openDeleteModal = (order) => {
    setActionTarget(order);
    setIsDeleteModalOpen(true);
    setIsRestoreModalOpen(false);
  };

  const openRestoreModal = (order) => {
    setActionTarget(order);
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(true);
  };

  const closeModals = () => {
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(false);
    setIsStatusModalOpen(false);
    setActionTarget(null);
    setNewStatus("");
    setActionLoading(false);
  };

  const handleSoftDelete = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await adminOrdersService.softDeleteOrder(actionTarget._id);
      toast.success("Commande désactivée.");
      setOrders((prev) => prev.filter((o) => o._id !== actionTarget._id));
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
      }
      await fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de désactiver la commande.";
      toast.error(message);
    } finally {
      closeModals();
    }
  };

  const handleRestore = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await adminOrdersService.restoreOrder(actionTarget._id);
      toast.success("Commande restaurée.");
      setDeletedOrders((prev) =>
        prev.filter((o) => o._id !== actionTarget._id),
      );
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
      }
      await fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de restaurer la commande.";
      toast.error(message);
    } finally {
      closeModals();
    }
  };

  const openStatusModal = (order) => {
    setActionTarget(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(false);
  };

  const handleUpdateStatus = async () => {
    if (!actionTarget || !newStatus) return;
    setActionLoading(true);
    try {
      const updatedOrder = await adminOrdersService.updateOrderStatus(
        actionTarget._id,
        newStatus,
      );
      toast.success("Statut de la commande mis à jour.");
      setOrders((prev) =>
        prev.map((o) => (o._id === actionTarget._id ? updatedOrder : o)),
      );
      if (selectedOrderId === actionTarget._id) {
        setSelectedOrderId(null);
        setTimeout(() => setSelectedOrderId(actionTarget._id), 100);
      }
      await fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de mettre à jour le statut.";
      toast.error(message);
    } finally {
      closeModals();
      setIsStatusModalOpen(false);
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
          onClick={fetchOrders}
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
          Gestion des commandes
        </h2>
        <p className="text-sm text-gray-500">
          Consulte toutes les commandes, filtre par statut, et gère les
          commandes supprimées.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filtrer par statut:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="shipped">Expédié</option>
            <option value="delivered">Livré</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Afficher:
          </label>
          <button
            type="button"
            onClick={() => setShowDeleted(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              !showDeleted
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Actives ({orders.length})
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
            Supprimées ({deletedOrders.length})
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {showDeleted ? "Commandes supprimées" : "Commandes actives"}
            </h3>
            <p className="text-sm text-gray-500">
              {filteredOrders.length} commande
              {filteredOrders.length > 1 ? "s" : ""} trouvée
              {filteredOrders.length > 1 ? "s" : ""}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "ID",
                    "Client",
                    "Date",
                    "Montant",
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={
                      selectedOrderId === order._id ? "bg-blue-50" : undefined
                    }
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.userId?.fullname || order.userId?.email || "—"}
                        </div>
                        {order.userId?.email && (
                          <div className="text-xs text-gray-500">
                            {order.userId.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "MAD",
                      }).format(order.finalAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusColors[order.status] || statusColors.pending
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order._id)}
                          className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Détails
                        </button>
                        {!showDeleted ? (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(order)}
                            className="rounded-md border border-yellow-200 px-3 py-1 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          >
                            Désactiver
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRestoreModal(order)}
                            className="rounded-md border border-green-200 px-3 py-1 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                          >
                            Restaurer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      Aucune commande trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Détails de la commande
          </h3>
          <p className="text-sm text-gray-500">
            Sélectionne une commande pour voir ses informations complètes.
          </p>

          <div className="mt-4">
            {!selectedOrder ? (
              <p className="text-sm text-gray-500">
                Aucune commande sélectionnée.
              </p>
            ) : (
              <article className="space-y-4">
                <header className="space-y-2 border-b border-gray-200 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Commande #{selectedOrder._id.slice(-8)}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedOrder.createdAt
                        ? new Date(
                            selectedOrder.createdAt,
                          ).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[selectedOrder.status] ||
                        statusColors.pending
                      }`}
                    >
                      {statusLabels[selectedOrder.status] ||
                        selectedOrder.status}
                    </span>
                    {!showDeleted && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(selectedOrder)}
                        className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        Modifier le statut
                      </button>
                    )}
                  </div>
                </header>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Client
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.userId?.fullname || "—"}
                    </p>
                    {selectedOrder.userId?.email && (
                      <p className="text-xs text-gray-500">
                        {selectedOrder.userId.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      Produits
                    </h5>
                    <div className="mt-2 space-y-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between rounded-md border border-gray-200 p-2 text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {typeof item.productId === "object" &&
                              item.productId !== null
                                ? item.productId.title || "Produit supprimé"
                                : "Produit supprimé"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Quantité: {item.quantity} ×{" "}
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "MAD",
                              }).format(item.price ?? 0)}
                            </div>
                            {typeof item.productId === "object" &&
                              item.productId?.seller_id && (
                                <div className="mt-1 text-xs text-gray-500">
                                  Vendeur:{" "}
                                  {item.productId.seller_id?.fullname ||
                                    item.productId.seller_id?.email ||
                                    "—"}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-medium text-gray-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "MAD",
                        }).format(selectedOrder.totalAmount ?? 0)}
                      </span>
                    </div>
                    {selectedOrder.appliedCoupons?.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Coupons appliqués:{" "}
                        {selectedOrder.appliedCoupons
                          .map((c) =>
                            typeof c === "object" ? c.code : c,
                          )
                          .join(", ")}
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-semibold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "MAD",
                        }).format(selectedOrder.finalAmount ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>

      {(isDeleteModalOpen || isRestoreModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {isDeleteModalOpen
                ? "Désactiver la commande"
                : "Restaurer la commande"}
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              {isDeleteModalOpen &&
                "La commande sera retirée de la liste active mais pourra être restaurée plus tard."}
              {isRestoreModalOpen &&
                "La commande sera restaurée et réapparaîtra dans la liste active."}
            </p>
            <p className="mt-2 text-sm text-gray-800">
              Commande:{" "}
              <span className="font-semibold">
                #{actionTarget?._id?.slice(-8) ?? "—"}
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  closeModals();
                }}
                disabled={actionLoading}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={isDeleteModalOpen ? handleSoftDelete : handleRestore}
                disabled={actionLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70",
                  isDeleteModalOpen
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700",
                ].join(" ")}
              >
                {actionLoading ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Modifier le statut de la commande
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Commande:{" "}
              <span className="font-semibold">
                #{actionTarget._id?.slice(-8) ?? "—"}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Statut actuel:{" "}
              <span className="font-medium">
                {statusLabels[actionTarget.status] || actionTarget.status}
              </span>
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Nouveau statut
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="pending">En attente</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  closeModals();
                }}
                disabled={actionLoading}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={actionLoading || !newStatus || newStatus === actionTarget.status}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {actionLoading ? "Mise à jour..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
