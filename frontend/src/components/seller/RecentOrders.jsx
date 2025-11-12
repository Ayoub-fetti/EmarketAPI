export default function RecentOrders({ orders }) {
  const getStatusDot = (status) => {
    switch (status) {
      case "validée":
        return "bg-green-500";
      case "en attente":
        return "bg-blue-500";
      case "en route":
        return "bg-yellow-500";
      case "annulée":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Commandes
        </h2>
        <button className="text-sm text-gray-600 hover:text-gray-900">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 pb-3">
                Command ID
              </th>
              <th className="text-left text-xs font-medium text-gray-500 pb-3 hidden md:table-cell">
                Date
              </th>
              <th className="text-left text-xs font-medium text-gray-500 pb-3 hidden md:table-cell">
                Client
              </th>
              <th className="text-left text-xs font-medium text-gray-500 pb-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-4 text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="py-4 text-sm text-gray-600 hidden sm:table-cell">
                  {order.date}
                </td>
                <td className="py-4 text-sm text-gray-900 hidden sm:table-cell">
                  {order.client}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusDot(
                        order.status
                      )}`}
                    ></span>
                    <span className={`text-xs px-2 py-1 rounded`}>
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <button
                    className="text-sm px-4 py-1 rounded font-small text-white transition-colors"
                    style={{ backgroundColor: "rgb(212, 54, 1)" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "rgb(180, 45, 1)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "rgb(212, 54, 1)")
                    }
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
