export default function StatCard({
  title,
  value,
  subValue,
  percentage,
  isPositive,
  badge,
}) {
  return (
    <div className="bg-white rounded-md shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {badge && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {badge}
          </span>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-2">{subValue}</p>
        </div>

        {/* Percentage Badge */}
        {percentage && (
          <div
            className={`flex items-center gap-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span className="text-lg">{isPositive ? "↑" : "↓"}</span>
            <span className="text-sm font-medium">{percentage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
