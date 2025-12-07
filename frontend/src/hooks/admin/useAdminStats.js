import { useEffect, useMemo, useState } from "react";
import { adminStatsService } from "../../services/admin/adminStatsService";

export default function useAdminStats() {
  const [userStats, setUserStats] = useState({ list: [], total: 0 });
  const [orderStats, setOrderStats] = useState({ list: [], total: 0 });
  const [productStats, setProductStats] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, ordersData, productsData] = await Promise.all([
        adminStatsService.fetchUsers(),
        adminStatsService.fetchOrders(),
        adminStatsService.fetchProducts(),
      ]);
      setUserStats(usersData);
      setOrderStats(ordersData);
      setProductStats(productsData);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error loading statistics.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    const totalRevenue = orders.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
    const totalProducts = productStats.total;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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
      const label = new Intl.DateTimeFormat("en-US", {
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
        name: productMap.get(productId) || "Unknown Product",
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

  return {
    loading,
    error,
    stats,
    monthlyRevenue,
    topProducts,
    recentOrders,
    refetch: loadData,
  };
}
