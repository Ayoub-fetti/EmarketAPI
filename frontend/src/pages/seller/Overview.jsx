import StatCard from "../../components/seller/StatCard";
import RecentOrders from "../../components/seller/RecentOrders";
import { useSellerStats } from "../../hooks/seller/useSellerStats";
import { MdAttachMoney, MdShoppingCart, MdInventory, MdLocalShipping } from "react-icons/md";

export default function Overview() {
  const { stats, recentOrders, loading, updateOrderStatus } = useSellerStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de Bord</h1>
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
          <RecentOrders orders={recentOrders} onStatusChange={updateOrderStatus} />
        )}
      </div>
    </div>
  );
}
