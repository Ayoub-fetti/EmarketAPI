import { useState, useEffect } from "react";
import { getUserOrders } from "../services/orderService";
import { reviewService } from "../services/reviewService";
import { Package, Truck, CheckCircle, XCircle, Star } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/tools/Loader";
import ReviewModal from "../components/tools/ReviewModal";

export default function OrdersHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
      loadUserReviews();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await getUserOrders(user.id);
      if (response.success && response.data) {
        const ordersData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch {
      toast.error("Erreur lors du chargement des commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async () => {
    try {
      const response = await reviewService.getUserReviews();
      setUserReviews(response.data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const hasReviewed = (productId) => {
    return userReviews.some((review) => {
      const reviewProductId = review.product?._id || review.product;
      return reviewProductId === productId;
    });
  };

  const handleOpenReviewModal = (productId) => {
    setSelectedProductId(productId);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await reviewService.createReview(reviewData);
      toast.success("Avis ajouté avec succès");
      setReviewModalOpen(false);
      loadUserReviews();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erreur lors de l'ajout de l'avis"
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <i className="fa-solid fa-spinner"></i>;
      case "shipped":
        return <Truck className="text-blue-500" size={20} />;
      case "delivered":
        return <CheckCircle className="text-green-500" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "En cours de traitement",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <Loader />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-semibold text-gray-700">
          Aucune commande
        </h2>
        <p className="text-gray-500 mt-2">
          Vous n'avez pas encore passé de commande
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mb-60 mt-10">
      <div className="bg-white border rounded-lg shadow-md p-6 overflow-x-auto">
        <h1 className="text-3xl font-bold mb-6">Historique de mes commandes</h1>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="p-3 border">Commande</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Produit</th>
              <th className="p-3 border">Quantité</th>
              <th className="p-3 border">PU</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Avis</th>
              <th className="p-3 border">Statut</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) =>
              order.items.map((item, index) => {
                const isDelivered = order.status === "delivered";
                const alreadyReviewed = hasReviewed(item.productId);

                return (
                  <tr
                    key={order._id + index}
                    className="hover:bg-gray-50 text-sm"
                  >
                    {/* ORDER ID (only on first item row) */}
                    <td className="p-3 border font-medium">
                      {index === 0 ? `#${order._id.slice(-8)}` : ""}
                    </td>

                    {/* ORDER DATE */}
                    <td className="p-3 border">
                      {index === 0
                        ? new Date(order.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : ""}
                    </td>

                    {/* PRODUCT */}
                    <td className="p-3 border">Produit ID: {item.productId}</td>

                    {/* QUANTITY */}
                    <td className="p-3 border">{item.quantity}</td>

                    {/* PRICE */}
                    <td className="p-3 border">{item.price.toFixed(2)} MAD</td>

                    {/* TOTAL */}
                    <td className="p-3 border font-semibold">
                      {(item.price * item.quantity).toFixed(2)} MAD
                    </td>

                    {/* REVIEW ACTION */}
                    <td className="p-3 border text-center">
                      {isDelivered ? (
                        alreadyReviewed ? (
                          <span className="text-xs text-green-600 flex items-center gap-1 justify-center">
                            <CheckCircle size={14} /> Avis ajouté
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenReviewModal(item.productId)
                            }
                            className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center gap-1 justify-center"
                          >
                            <Star size={14} /> Ajouter
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                                        {/* STATUS */}
                    <td className="p-3 border flex items-center">
                      {index === 0 ? (
                        <>
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          productId={selectedProductId}
        />
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        productId={selectedProductId}
      />
    </div>
  );
}
