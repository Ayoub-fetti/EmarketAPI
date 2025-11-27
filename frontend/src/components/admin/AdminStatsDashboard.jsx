import React, { memo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaChartLine,
  FaChartBar,
} from "react-icons/fa";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const AdminStatsDashboard = memo(
  ({ stats, monthlyRevenue, topProducts, recentOrders }) => {
    const statCards = [
      {
        label: "Total Revenue",
        value: currencyFormatter.format(stats.totalRevenue),
        sub: `Average order: ${currencyFormatter.format(
          stats.averageOrderValue
        )}`,
        icon: FaDollarSign,
        iconColor: "text-gray-900",
        hoverColor: "group-hover:text-orange-600",
      },
      {
        label: "Orders",
        value: stats.totalOrders.toLocaleString("en-US"),
        sub: `${monthlyRevenue.at(-1)?.orders ?? 0} orders this month`,
        icon: FaShoppingCart,
        iconColor: "text-gray-900",
        hoverColor: "group-hover:text-blue-600",
      },
      {
        label: "Registered Users",
        value: stats.totalUsers.toLocaleString("en-US"),
        sub: `${stats.totalUsers.toLocaleString("en-US")} active accounts`,
        icon: FaUsers,
        iconColor: "text-gray-900",
        hoverColor: "group-hover:text-green-600",
      },
      {
        label: "Products in Catalog",
        value: stats.totalProducts.toLocaleString("en-US"),
        sub: `${topProducts.length} products in top sales`,
        icon: FaBox,
        iconColor: "text-gray-900",
        hoverColor: "group-hover:text-purple-600",
      },
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(
            ({ label, value, sub, icon: Icon, iconColor, hoverColor }) => (
              <div
                key={label}
                className="group relative rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <div className="relative z-10">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">
                    {label}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate pr-2">
                      {value}
                    </p>
                    <Icon
                      className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${iconColor} ${hoverColor} transition-colors duration-300`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{sub}</p>
                </div>
              </div>
            )
          )}
        </section>

        <section className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Monthly Revenue
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Sum of completed orders over the last 6 months.
                </p>
              </div>
            </div>
            {monthlyRevenue.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-12 sm:py-16">
                <FaChartLine className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                <p>No order data available yet.</p>
              </div>
            ) : (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      stroke="#6b7280"
                      style={{ fontSize: "11px" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value / 1000}k`}
                      stroke="#6b7280"
                      style={{ fontSize: "11px" }}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(value) =>
                        currencyFormatter.format(Number(value))
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ea580c"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ea580c" }}
                      activeDot={{ r: 6, fill: "#ea580c" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Top Selling Products
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Ranking by quantity sold.
                </p>
              </div>
            </div>
            {topProducts.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-12 sm:py-16">
                <FaChartBar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                <p>No sales recorded yet.</p>
              </div>
            ) : (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      stroke="#6b7280"
                      style={{ fontSize: "11px" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: "10px" }}
                      stroke="#6b7280"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="quantity"
                      fill="#ea580c"
                      name="Quantity"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Recent Orders
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              The 6 most recent orders.
            </p>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {["Order", "Customer", "Amount", "Status", "Date"].map(
                      (header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentOrders.map((order, index) => {
                    const orderCode = order._id
                      ? `#${String(order._id).slice(-6)}`
                      : "—";
                    const customer =
                      (typeof order.userId === "object" && order.userId !== null
                        ? order.userId.fullname || order.userId.email
                        : undefined) ||
                      order.userId ||
                      "Customer";
                    return (
                      <tr
                        key={order._id ?? index}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900">
                          {orderCode}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 truncate max-w-[120px] sm:max-w-none">
                          {customer}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap">
                          {currencyFormatter.format(order.finalAmount || 0)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold capitalize shadow-sm",
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-red-100 text-red-800 border border-red-200",
                            ].join(" ")}
                          >
                            {order.status || "pending"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                          {order.createdAt
                            ? dateFormatter.format(new Date(order.createdAt))
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 sm:px-6 py-12 text-center text-sm text-gray-500"
                      >
                        <FaShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                        <p>No recent orders available.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    );
  }
);

export default AdminStatsDashboard;
