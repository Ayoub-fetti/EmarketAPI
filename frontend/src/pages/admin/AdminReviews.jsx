import { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { adminReviewsService } from "../../services/admin/adminReviewsService";

const statusLabels = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [moderating, setModerating] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminReviewsService.fetchAllReviews();
      setReviews(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des avis.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = useMemo(() => {
    if (statusFilter === "all") return reviews;
    return reviews.filter((review) => review.status === statusFilter);
  }, [reviews, statusFilter]);

  const openModerateModal = (review) => {
    setSelectedReview(review);
    setNewStatus(review.status);
    setIsModerateModalOpen(true);
  };

  const closeModerateModal = () => {
    setIsModerateModalOpen(false);
    setSelectedReview(null);
    setNewStatus("");
    setModerating(false);
  };

  const handleModerate = async () => {
    if (!selectedReview || !newStatus) return;
    setModerating(true);
    try {
      const updated = await adminReviewsService.moderateReview(
        selectedReview._id,
        newStatus,
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === selectedReview._id ? updated : r)),
      );
      toast.success("Avis modéré avec succès.");
      closeModerateModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de modérer l'avis.";
      toast.error(message);
    } finally {
      setModerating(false);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
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
          onClick={fetchReviews}
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
          Modération des avis
        </h2>
        <p className="text-sm text-gray-500">
          Consultez et modérez les avis des utilisateurs sur les produits.
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
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          {filteredReviews.length} avis trouvé
          {filteredReviews.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Utilisateur",
                  "Produit",
                  "Note",
                  "Commentaire",
                  "Statut",
                  "Date",
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
              {filteredReviews.map((review) => (
                <tr key={review._id}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {typeof review.user === "object" && review.user
                          ? review.user.fullname || review.user.email || "—"
                          : "—"}
                      </div>
                      {typeof review.user === "object" &&
                        review.user?.email && (
                          <div className="text-xs text-gray-500">
                            {review.user.email}
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {typeof review.product === "object" && review.product
                        ? review.product.title || "Produit supprimé"
                        : "Produit supprimé"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {renderStars(review.rating)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {review.rating}/5
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate text-gray-600">
                      {review.comment || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[review.status] || statusColors.pending
                      }`}
                    >
                      {statusLabels[review.status] || review.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openModerateModal(review)}
                      className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      Modérer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Aucun avis trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderate Modal */}
      {isModerateModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Modérer l'avis
            </h3>

            <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Utilisateur:
                </span>
                <p className="text-sm text-gray-900">
                  {typeof selectedReview.user === "object" && selectedReview.user
                    ? selectedReview.user.fullname || selectedReview.user.email
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Produit:
                </span>
                <p className="text-sm text-gray-900">
                  {typeof selectedReview.product === "object" &&
                  selectedReview.product
                    ? selectedReview.product.title
                    : "Produit supprimé"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Note:</span>
                <p className="text-sm text-gray-900">
                  <span className="text-yellow-500">
                    {renderStars(selectedReview.rating)}
                  </span>{" "}
                  ({selectedReview.rating}/5)
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Commentaire:
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedReview.comment || "Aucun commentaire"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Statut actuel:
                </span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    statusColors[selectedReview.status] ||
                    statusColors.pending
                  }`}
                >
                  {statusLabels[selectedReview.status] || selectedReview.status}
                </span>
              </div>
            </div>

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
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (moderating) return;
                  closeModerateModal();
                }}
                disabled={moderating}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleModerate}
                disabled={
                  moderating ||
                  !newStatus ||
                  newStatus === selectedReview.status
                }
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {moderating ? "Modération..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

