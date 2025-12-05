export default function StatCard({ title, value, icon: Icon, color = "orange", loading = false }) {
  const colorStyles = {
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white rounded-md p-6 border border-gray-200">
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div
            className={`w-12 h-12 rounded flex items-center justify-center ${colorStyles[color]}`}
          >
            <Icon className="text-2xl" />
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-3">
        {loading ? (
          <div className="h-9 w-32 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
