export default function RecentPayments({ payments }) {
  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Paiement</h2>
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
              <th className="text-left text-xs font-medium text-gray-500 pb-3">
                Date
              </th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3">
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-5 text-sm font-medium text-gray-900">
                  {payment.id}
                </td>
                <td className="py-5 text-sm text-gray-600">{payment.date}</td>
                <td className="py-5 text-right text-sm font-semibold text-green-600">
                  + {payment.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
