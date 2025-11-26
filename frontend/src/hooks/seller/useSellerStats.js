import { useState, useEffect, useMemo } from "react";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import { useAuth } from "../../context/AuthContext";

export function useSellerStats() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [ordersResponse, productsResponse] = await Promise.all([
          orderService.getSellerOrders(user.id),
          productService.getProductsBySeller(user.id),
        ]);

        setOrders(ordersResponse.orders || []);
        setProducts(productsResponse.products || []);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status !== "cancelled") {
        return sum + (order.sellerTotal || order.finalAmount || 0);
      }
      return sum;
    }, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === "pending" || order.status === "shipped"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    return {
      totalRevenue,
      pendingOrders,
      totalProducts: products.length,
      deliveredOrders,
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  return {
    stats,
    recentOrders,
    loading,
    error,
    orders,
    products,
  };
}
