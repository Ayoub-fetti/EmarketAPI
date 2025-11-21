import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RecentOrders({ orders, onStatusChange }) {
  const navigate = useNavigate();
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
    <div className="bg-white rounded-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Commandes Récentes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Dernières commandes reçues
          </p>
        </div>
        <button
          onClick={() => navigate("/seller/orders")}
          className="text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors"
        >
          Voir tout →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                N° Commande
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Client
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2 hidden md:table-cell">
                Produits
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Montant
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Statut
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2 hidden lg:table-cell">
                Date
              </th>
              <th className="text-center text-xs font-semibold text-gray-600 uppercase pb-3 px-2 hidden xl:table-cell">
                Changer
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                {/* Order Number */}
                <td className="py-4 px-2">
                  <div className="text-sm font-semibold text-gray-900">
                    {generateOrderNumber(order._id, order.createdAt)}
                  </div>
                </td>

                {/* Client */}
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-xs">
                      {(order.userId?.fullname || "UK")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 capitalize block">
                        {order.userId?.fullname || "Client inconnu"}
                      </span>
                      <span className="text-xs text-gray-500 block lg:hidden">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Products - Hidden on mobile */}
                <td className="py-4 px-2 hidden md:table-cell">
                  <div className="text-sm text-gray-900">
                    {order.items?.length || 0} article
                    {order.items?.length > 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items?.[0]?.productId?.title}
                    {order.items?.length > 1 && ` +${order.items.length - 1}`}
                  </div>
                </td>

                {/* Amount */}
                <td className="py-4 px-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.sellerTotal || order.finalAmount)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-2">{getStatusBadge(order.status)}</td>

                {/* Date - Hidden on small screens */}
                <td className="py-4 px-2 text-sm text-gray-600 hidden lg:table-cell">
                  {formatDate(order.createdAt)}
                </td>

                {/* Status Change - Hidden on small screens */}
                <td className="py-4 px-2 text-center hidden xl:table-cell">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    disabled={updatingOrderId === order._id}
                    className={`px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 ${
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

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Aucune commande récente</p>
          <p className="text-sm text-gray-500 mt-1">
            Les nouvelles commandes apparaîtront ici
          </p>
        </div>
      )}
    </div>
  );
}
