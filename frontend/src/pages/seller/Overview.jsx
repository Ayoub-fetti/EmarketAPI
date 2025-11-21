import StatCard from "../../components/seller/StatCard";
import RecentOrders from "../../components/seller/RecentOrders";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import api from "../../services/axios";
import {
  MdAttachMoney,
  MdShoppingCart,
  MdInventory,
  MdLocalShipping,
} from "react-icons/md";

export default function Overview() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Charger les commandes et les produits en parallèle
        const [ordersResponse, productsResponse] = await Promise.all([
          orderService.getSellerOrders(user.id),
          productService.getProductsBySeller(user.id),
        ]);

        const orders = ordersResponse.orders || [];
        const products = productsResponse.products || [];

        // Calculer les statistiques
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

        setStats({
          totalRevenue,
          pendingOrders,
          totalProducts: products.length,
          deliveredOrders,
        });

        // Prendre seulement les 5 dernières commandes
        const recent = orders.slice(0, 5);
        setRecentOrders(recent);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log(
        `Changement de statut pour la commande ${orderId} vers ${newStatus}`
      );

      // Appel API pour mettre à jour le statut (route seller)
      const response = await api.patch(`/orders/${orderId}/status/seller`, {
        newStatus: newStatus,
      });

      console.log("Statut mis à jour:", response.data);

      // Mettre à jour localement la commande dans la liste
      setRecentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tableau de Bord
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Statistiques et performances de votre boutique
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenus"
          value={`${stats.totalRevenue.toFixed(2)} DH`}
          icon={MdAttachMoney}
          color="green"
          loading={loading}
        />

        <StatCard
          title="Commandes En Cours"
          value={stats.pendingOrders}
          icon={MdShoppingCart}
          color="blue"
          loading={loading}
        />

        <StatCard
          title="Total Produits"
          value={stats.totalProducts}
          icon={MdInventory}
          color="orange"
          loading={loading}
        />

        <StatCard
          title="Commandes Livrées"
          value={stats.deliveredOrders}
          icon={MdLocalShipping}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Recent Activity Tables */}
      <div className="mt-6 sm:mt-8">
        {loading ? (
          <div className="bg-white rounded-md border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mb-4"></div>
              <p className="text-gray-600">Chargement des commandes...</p>
            </div>
          </div>
        ) : (
          <RecentOrders
            orders={recentOrders}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
