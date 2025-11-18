import { MdVisibility } from "react-icons/md";
import { useState } from "react";

export default function OrdersTable({ orders, onStatusChange }) {
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: "En attente",
        className: "bg-yellow-100 text-yellow-800",
      },
      shipped: {
        label: "Expédiée",
        className: "bg-blue-100 text-blue-800",
      },
      delivered: {
        label: "Livrée",
        className: "bg-green-100 text-green-800",
      },
      cancelled: {
        label: "Annulée",
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    return `${price.toFixed(2)} DH`;
  };

  const generateOrderNumber = (orderId, createdAt) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const shortId = orderId.substring(orderId.length - 6).toUpperCase();
    return `CMD-${year}${month}-${shortId}`;
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!onStatusChange) return;

    setUpdatingOrderId(orderId);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Commande
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Changer le statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {generateOrderNumber(order._id, order.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.userId?.fullname || "Client inconnu"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.userId?.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.items?.length || 0} article
                    {order.items?.length > 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items?.[0]?.productId?.title}
                    {order.items?.length > 1 && ` +${order.items.length - 1}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(order.sellerTotal || order.finalAmount)}
                  </div>
                  {order.finalAmount !== order.totalAmount && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(order.totalAmount)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    disabled={updatingOrderId === order._id}
                    className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      updatingOrderId === order._id
                        ? "opacity-50 cursor-not-allowed bg-gray-100"
                        : "bg-white cursor-pointer hover:border-orange-500"
                    }`}
                  >
                    <option value="pending">En attente</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
