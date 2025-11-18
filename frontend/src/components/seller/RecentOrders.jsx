export default function RecentOrders({ orders }) {
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
        <button className="text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors">
          Voir tout →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Commande
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2 hidden md:table-cell">
                Date
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Client
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Montant
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Statut
              </th>
              <th className="text-right text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                {/* Order ID */}
                <td className="py-4 px-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      #{order.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 md:hidden">
                      {order.date}
                    </p>
                  </div>
                </td>

                {/* Date - Hidden on mobile */}
                <td className="py-4 px-2 text-sm text-gray-600 hidden md:table-cell">
                  {order.date}
                </td>

                {/* Client */}
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-xs">
                      {order.client.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {order.client}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-4 px-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {order.amount}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-orange-700 bg-orange-100">
                    <span className="capitalize">{order.status}</span>
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-2 text-right">
                  <button className="text-sm px-4 py-1 rounded font-small text-white transition-all hover:shadow-md bg-orange-700">
                    Détails
                  </button>
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
