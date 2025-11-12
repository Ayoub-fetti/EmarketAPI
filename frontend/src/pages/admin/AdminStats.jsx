import { useEffect, useMemo, useState } from "react";
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
import { adminStatsService } from "../../services/admin/adminStatsService";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "MAD",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function AdminStats() {
  const [userStats, setUserStats] = useState({ list: [], total: 0 });
  const [orderStats, setOrderStats] = useState({ list: [], total: 0 });
  const [productStats, setProductStats] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [usersData, ordersData, productsData] = await Promise.all([
          adminStatsService.fetchUsers(),
          adminStatsService.fetchOrders(),
          adminStatsService.fetchProducts(),
        ]);
        if (!mounted) return;
        setUserStats(usersData);
        setOrderStats(ordersData);
        setProductStats(productsData);
      } catch (err) {
        if (!mounted) return;
        const message =
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des statistiques.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const orders = orderStats.list;
  const products = productStats.list;

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      map.set(product._id, product.title);
    });
    return map;
  }, [products]);

  const stats = useMemo(() => {
    const totalUsers = userStats.total;
    const totalOrders = orderStats.total;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.finalAmount || 0),
      0,
    );
    const totalProducts = productStats.total;
    const averageOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      averageOrderValue,
    };
  }, [userStats.total, orderStats.total, orders, productStats.total]);

  const monthlyRevenue = useMemo(() => {
    const accumulator = new Map();
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const monthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthKey = monthDate.getTime();
      const label = new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        year: "numeric",
      }).format(date);
      if (!accumulator.has(monthKey)) {
        accumulator.set(monthKey, {
          monthKey,
          timestamp: monthKey,
          label,
          revenue: 0,
          orders: 0,
        });
      }
      const entry = accumulator.get(monthKey);
      entry.revenue += order.finalAmount || 0;
      entry.orders += 1;
    });
    return Array.from(accumulator.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-6);
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts = new Map();
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const { productId, quantity } = item;
        if (!productId) return;
        const key =
          typeof productId === "object" && productId !== null
            ? productId._id || productId
            : productId;
        counts.set(key, (counts.get(key) || 0) + (quantity || 0));
      });
    });
    return Array.from(counts.entries())
      .map(([productId, quantity]) => ({
        productId,
        name: productMap.get(productId) || "Produit inconnu",
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders, productMap]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [orders]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          Tableau de bord analytique
        </h2>
        <p className="text-sm text-gray-500">
          Vue d’ensemble des ventes, utilisateurs et performances.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenus totaux",
            value: currencyFormatter.format(stats.totalRevenue),
            sub: `Ticket moyen: ${currencyFormatter.format(
              stats.averageOrderValue,
            )}`,
          },
          {
            label: "Commandes",
            value: stats.totalOrders.toLocaleString("fr-FR"),
            sub: `${monthlyRevenue.at(-1)?.orders ?? 0} commandes ce mois`,
          },
          {
            label: "Utilisateurs inscrits",
            value: stats.totalUsers.toLocaleString("fr-FR"),
            sub: `${stats.totalUsers.toLocaleString("fr-FR")} comptes actifs`,
          },
          {
            label: "Produits en catalogue",
            value: stats.totalProducts.toLocaleString("fr-FR"),
            sub: `${topProducts.length} produits dans le top ventes`,
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Revenus mensuels
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Somme des commandes finalisées sur les 6 derniers mois.
          </p>
          {monthlyRevenue.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-10">
              Aucune donnée de commande pour le moment.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) =>
                      currencyFormatter.format(Number(value))
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Top produits vendus
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Classement par quantité vendue.
          </p>
          {topProducts.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-10">
              Pas encore de ventes enregistrées.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#22c55e" name="Quantité" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dernières commandes
            </h3>
            <p className="text-sm text-gray-500">
              Les 6 commandes les plus récentes.
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Commande",
                  "Client",
                  "Montant",
                  "Status",
                  "Date",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs"
                  >
                    {header}
                  </th>
                ))}
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
                    : undefined) || order.userId || "Client";
                return (
                  <tr key={order._id ?? index}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {orderCode}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {currencyFormatter.format(order.finalAmount || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>
                    <td className="px-4 py-3 text-gray-500">
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
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    Aucune commande récente disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}