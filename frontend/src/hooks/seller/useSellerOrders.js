import { useState, useEffect, useMemo, useCallback } from "react";
import { orderService } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/axios";

export function useSellerOrders() {
  const { user } = useAuth();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await orderService.getSellerOrders(user.id);
        setOrders(response.orders || []);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des commandes:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des commandes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter((order) => {
        const query = searchQuery.toLowerCase();
        const orderId = order._id?.toLowerCase() || "";
        const customerName = order.userId?.fullname?.toLowerCase() || "";
        const customerEmail = order.userId?.email?.toLowerCase() || "";

        const date = new Date(order.createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const shortId = order._id.substring(order._id.length - 6).toUpperCase();
        const orderNumber = `CMD-${year}${month}-${shortId}`.toLowerCase();

        return (
          orderId.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          orderNumber.includes(query)
        );
      });
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    return filtered;
  }, [searchQuery, selectedStatus, orders]);

  // Update status handler
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status/seller`, {
        newStatus: newStatus,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      return true;
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      throw err;
    }
  }, []);

  return {
    orders,
    filteredOrders,
    loading,
    error,
    filters: {
      searchQuery,
      setSearchQuery,
      selectedStatus,
      setSelectedStatus,
    },
    updateOrderStatus,
  };
}
