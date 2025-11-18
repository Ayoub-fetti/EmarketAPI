import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminCouponsService } from "../../services/admin/adminCouponsService";
import { useAuth } from "../../context/AuthContext";

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
};

const typeLabels = {
  percentage: "Pourcentage",
  fixed: "Fixe",
};

export default function AdminCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minimumPurchase: "",
    startDate: "",
    expirationDate: "",
    maxUsage: "",
    maxUsagePerUser: "1",
    status: "active",
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminCouponsService.fetchAllCoupons();
      setCoupons(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des coupons.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minimumPurchase: "",
      startDate: "",
      expirationDate: "",
      maxUsage: "",
      maxUsagePerUser: "1",
      status: "active",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
    setCreating(false);
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      type: coupon.type || "percentage",
      value: coupon.value?.toString() || "",
      minimumPurchase: coupon.minimumPurchase?.toString() || "",
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().slice(0, 16)
        : "",
      expirationDate: coupon.expirationDate
        ? new Date(coupon.expirationDate).toISOString().slice(0, 16)
        : "",
      maxUsage: coupon.maxUsage?.toString() || "",
      maxUsagePerUser: coupon.maxUsagePerUser?.toString() || "1",
      status: coupon.status || "active",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCoupon(null);
    resetForm();
    setUpdating(false);
  };

  const openViewModal = async (coupon) => {
    try {
      const details = await adminCouponsService.fetchCouponById(coupon._id);
      setSelectedCoupon(details);
      setIsViewModalOpen(true);
    } catch (err) {
      toast.error("Impossible de charger les détails du coupon.");
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCoupon(null);
  };

  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCoupon(null);
    setDeleting(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value || !formData.startDate || !formData.expirationDate) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString(),
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser) || 1,
        status: formData.status,
        createdBy: user?.id,
      };

      const created = await adminCouponsService.createCoupon(payload);
      toast.success("Coupon créé avec succès.");
      closeCreateModal();
      await fetchCoupons();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de créer le coupon.";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCoupon) return;

    setUpdating(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString(),
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser) || 1,
        status: formData.status,
      };

      const updated = await adminCouponsService.updateCoupon(selectedCoupon._id, payload);
      toast.success("Coupon mis à jour avec succès.");
      closeEditModal();
      await fetchCoupons();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de mettre à jour le coupon.";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setDeleting(true);
    try {
      await adminCouponsService.deleteCoupon(selectedCoupon._id);
      toast.success("Coupon supprimé avec succès.");
      setCoupons((prev) => prev.filter((c) => c._id !== selectedCoupon._id));
      closeDeleteModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de supprimer le coupon.";
      toast.error(message);
    } finally {
      setDeleting(false);
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
          onClick={fetchCoupons}
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
          Gestion des coupons
        </h2>
        <p className="text-sm text-gray-500">
          Créez, modifiez et gérez les coupons de réduction.
        </p>
      </header>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          + Créer un coupon
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des coupons
          </h3>
          <p className="text-sm text-gray-500">
            {coupons.length} coupon{coupons.length > 1 ? "s" : ""} trouvé
            {coupons.length > 1 ? "s" : ""}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Code",
                  "Type",
                  "Valeur",
                  "Date début",
                  "Date fin",
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
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {typeLabels[coupon.type] || coupon.type}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `${coupon.value} MAD`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.startDate
                      ? new Date(coupon.startDate).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.expirationDate
                      ? new Date(coupon.expirationDate).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[coupon.status] || statusColors.active
                      }`}
                    >
                      {statusLabels[coupon.status] || coupon.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(coupon)}
                        className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Détails
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(coupon)}
                        className="rounded-md border border-green-200 px-3 py-1 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(coupon)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Aucun coupon trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">
              Créer un nouveau coupon
            </h3>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="DISCOUNT10"
                    required
                    minLength={6}
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed">Fixe (MAD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valeur *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder={formData.type === "percentage" ? "10" : "50"}
                    required
                    min={0}
                    max={formData.type === "percentage" ? 100 : undefined}
                    step="0.01"
                  />
                  {formData.type === "percentage" && (
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum 100%
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Achat minimum
                  </label>
                  <input
                    type="number"
                    value={formData.minimumPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumPurchase: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0"
                    min={0}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date début *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expirationDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usage maximum
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Illimité"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usage par utilisateur
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsagePerUser}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsagePerUser: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">
              Modifier le coupon
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Code: {selectedCoupon.code}
            </p>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                    minLength={6}
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed">Fixe (MAD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valeur *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                    min={0}
                    max={formData.type === "percentage" ? 100 : undefined}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Achat minimum
                  </label>
                  <input
                    type="number"
                    value={formData.minimumPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumPurchase: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    min={0}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date début *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expirationDate: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usage maximum
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usage par utilisateur
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsagePerUser}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsagePerUser: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {updating ? "Mise à jour..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Détails du coupon
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Code:</span>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedCoupon.code}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <p className="text-sm text-gray-900">
                  {typeLabels[selectedCoupon.type] || selectedCoupon.type}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Valeur:</span>
                <p className="text-sm text-gray-900">
                  {selectedCoupon.type === "percentage"
                    ? `${selectedCoupon.value}%`
                    : `${selectedCoupon.value} MAD`}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Achat minimum:
                </span>
                <p className="text-sm text-gray-900">
                  {selectedCoupon.minimumPurchase || 0} MAD
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Date début:
                </span>
                <p className="text-sm text-gray-900">
                  {selectedCoupon.startDate
                    ? new Date(selectedCoupon.startDate).toLocaleString("fr-FR")
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Date fin:
                </span>
                <p className="text-sm text-gray-900">
                  {selectedCoupon.expirationDate
                    ? new Date(selectedCoupon.expirationDate).toLocaleString("fr-FR")
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Usage maximum:
                </span>
                <p className="text-sm text-gray-900">
                  {selectedCoupon.maxUsage || "Illimité"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Usage par utilisateur:
                </span>
                <p className="text-sm text-gray-900">
                  {selectedCoupon.maxUsagePerUser || 1}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Statut:</span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    statusColors[selectedCoupon.status] || statusColors.active
                  }`}
                >
                  {statusLabels[selectedCoupon.status] || selectedCoupon.status}
                </span>
              </div>
              {selectedCoupon.usedBy && selectedCoupon.usedBy.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Utilisé {selectedCoupon.usedBy.length} fois
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Supprimer le coupon
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              Tu es sur le point de supprimer définitivement le coupon{" "}
              <span className="font-semibold text-gray-900">
                "{selectedCoupon.code}"
              </span>
              . Cette action est irréversible.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

