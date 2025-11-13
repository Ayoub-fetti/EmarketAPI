import { useState, useEffect } from 'react';
import { getUserOrders } from '../services/orderService';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import PaymentModal from '../components/tools/PaymentModal';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await getUserOrders(user.id);
      
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Erreur lors du chargement des commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'shipped': return <Truck className="text-blue-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'En attente',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusMap[status] || status;
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (orderId) => {
    toast.success('Paiement effectué avec succès!');
    setOrders(orders.map(order => 
      order._id === orderId ? { ...order, status: 'shipped' } : order
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
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
      <h1 className="text-3xl font-bold mb-6">Mes Commandes</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Commande #{order._id.slice(-8)}</p>
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
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="text-gray-400" size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Produit ID: {item.productId}</p>
                      <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Prix unitaire: {item.price.toFixed(2)}€</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Sous-total:</span>
                  <span>{order.totalAmount.toFixed(2)}€</span>
                </div>
                {order.totalAmount !== order.finalAmount && (
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Réduction:</span>
                    <span>-{(order.totalAmount - order.finalAmount).toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{order.finalAmount.toFixed(2)}€</span>
                </div>
              </div>

              {order.status === 'pending' && (
                <button
                  onClick={() => handlePayment(order)}
                  className="w-full mt-4 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Payer maintenant
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={selectedOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
