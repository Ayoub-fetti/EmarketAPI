import { useState, useEffect } from 'react';
import { getUserOrders } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { Package, Truck, CheckCircle, XCircle, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/tools/Loader';
import ReviewModal from '../components/tools/ReviewModal';

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
        const ordersData = Array.isArray(response.data) ? response.data : [response.data];
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
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
      console.error('Error loading reviews:', error);
    }
  };

  const hasReviewed = (productId) => {
    return userReviews.some(review => {
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
      toast.success('Avis ajouté avec succès');
      setReviewModalOpen(false);
      loadUserReviews();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'avis');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <i className="fa-solid fa-spinner"></i>;
      case 'shipped': return <Truck className="text-blue-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'En cours de traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <Loader/>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-semibold text-gray-700">Aucune commande</h2>
        <p className="text-gray-500 mt-2">Vous n'avez pas encore passé de commande</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Historique de mes commandes</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Commande #{order._id?.slice(-8) || 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold">{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
<div className="overflow-x-auto mt-4">
  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-gray-100 text-left text-sm">
        <th className="p-3 border">Produit</th>
        <th className="p-3 border">Quantité</th>
        <th className="p-3 border">Prix unitaire</th>
        <th className="p-3 border">Total</th>
        <th className="p-3 border text-center">Avis</th>
      </tr>
    </thead>
    <tbody>
      {order.items.map((item, index) => {
        const isDelivered = order.status === 'delivered';
        const alreadyReviewed = hasReviewed(item.productId);
        
        return (
          <tr key={index} className="text-sm border-b hover:bg-gray-50">
            <td className="p-3 border flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                <Package className="text-gray-400" size={28} />
              </div>
              <div>
                <p className="font-medium">Produit ID: {item.productId}</p>
              </div>
            </td>

            <td className="p-3 border">{item.quantity}</td>
            <td className="p-3 border">{item.price.toFixed(2)} MAD</td>
            <td className="p-3 border font-semibold">
              {(item.price * item.quantity).toFixed(2)} MAD
            </td>

            <td className="p-3 border text-center">
              {isDelivered ? (
                alreadyReviewed ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 justify-center">
                    <CheckCircle size={14} /> Avis ajouté
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenReviewModal(item.productId)}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center gap-1 justify-center"
                  >
                    <Star size={14} /> Ajouter
                  </button>
                )
              ) : (
                <span className="text-xs text-gray-400">En attente</span>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Sous-total:</span>
                  <span>{order.totalAmount.toFixed(2)} MAD</span>
                </div>
                {order.totalAmount !== order.finalAmount && (
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Réduction:</span>
                    <span>-{(order.totalAmount - order.finalAmount).toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{order.finalAmount.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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
