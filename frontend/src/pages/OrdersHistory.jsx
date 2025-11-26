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
        return <i className="fa-solid fa-spinner animate-spin text-yellow-500"></i>;
      case "shipped":
        return <Truck className="text-blue-500" size={18} />;
      case "delivered":
        return <CheckCircle className="text-green-500" size={18} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <Package className="text-gray-500" size={18} />;
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

  const getStatusClasses = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "shipped":
            return "bg-blue-100 text-blue-800";
        case "delivered":
            return "bg-green-100 text-green-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
  };


  if (loading) {
    return <Loader />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
        <Package className="text-indigo-500 mb-6" size={80} />
        <h2 className="text-3xl font-bold text-gray-800">
          Aucune commande trouvée
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          On dirait que vous n'avez pas encore passé de commande.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-2xl p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          <Truck className="inline-block mr-3 text-indigo-600" size={32} />
          Historique des Commandes
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  Commande #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix Unitaire
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Ligne
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avis
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) =>
                order.items.map((item, index) => {
                  const isDelivered = order.status === "delivered";
                  const alreadyReviewed = hasReviewed(item.productId);
                  const isFirstItem = index === 0;

                  return (
                    <tr
                      key={order._id + index}
                      className="hover:bg-indigo-50 transition duration-150 ease-in-out"
                    >
                      {/* ORDER ID */}
                      <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${isFirstItem ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {isFirstItem ? `#${order._id.slice(-8)}` : ""}
                      </td>

                      {/* ORDER DATE */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isFirstItem
                          ? new Date(order.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : ""}
                      </td>

                      {/* PRODUCT */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="truncate max-w-xs block">Produit ID: {item.productId}</span>
                      </td>

                      {/* QUANTITY */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.quantity}
                      </td>

                      {/* PRICE */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.price.toFixed(2)} <span className="font-semibold text-xs">MAD</span>
                      </td>

                      {/* TOTAL LIGNE */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} <span className="font-semibold text-xs">MAD</span>
                      </td>

                      {/* REVIEW ACTION */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {isDelivered ? (
                          alreadyReviewed ? (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 gap-1">
                              <CheckCircle size={14} /> Avis Ajouté
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleOpenReviewModal(item.productId)
                              }
                              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-600 text-white hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md gap-1"
                            >
                              <Star size={14} fill="white" /> Évaluer
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isFirstItem ? (
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusClasses(order.status)} gap-1`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusText(order.status)}</span>
                          </span>
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
        </div>

        {/* Le ReviewModal est inclus ici, à la fin du conteneur principal */}
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          productId={selectedProductId}
        />
      </div>
      {/* J'ai retiré le deuxième ReviewModal, car il était en double dans votre code original */}
    </div>
  );
}