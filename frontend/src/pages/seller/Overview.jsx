import StatCard from "../../components/seller/StatCard";
import RecentOrders from "../../components/seller/RecentOrders";
import { useAuth } from "../../context/AuthContext";
import {
  MdAttachMoney,
  MdShoppingCart,
  MdInventory,
  MdLocalShipping,
} from "react-icons/md";

export default function Overview() {
  const { user } = useAuth();

  // Données pour les commandes récentes
  const recentOrders = [
    {
      id: "ORD2025001",
      date: "14 Nov 2025",
      client: "Mohamed Boukab",
      amount: "2 450 DH",
      status: "en attente",
    },
    {
      id: "ORD2025002",
      date: "14 Nov 2025",
      client: "Zaid Boukab",
      amount: "890 DH",
      status: "validée",
    },
    {
      id: "ORD2025003",
      date: "13 Nov 2025",
      client: "Souhaib Boukab",
      amount: "1 250 DH",
      status: "en route",
    },
    {
      id: "ORD2025004",
      date: "13 Nov 2025",
      client: "Adel Chemlal",
      amount: "3 100 DH",
      status: "livrée",
    },
  ];

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
          value="22 550 DH"
          icon={MdAttachMoney}
          color="green"
          trend="up"
          trendValue="+12.5%"
        />

        <StatCard
          title="Commandes En Cours"
          value="48"
          icon={MdShoppingCart}
          color="blue"
          trend="up"
          trendValue="+8.3%"
        />

        <StatCard
          title="Total Produits"
          value="156"
          icon={MdInventory}
          color="orange"
          trend="up"
          trendValue="+2.1%"
        />

        <StatCard
          title="Commandes Livrées"
          value="324"
          icon={MdLocalShipping}
          color="purple"
          trend="up"
          trendValue="+5.2%"
        />
      </div>

      {/* Recent Activity Tables */}
      <div className="mt-6 sm:mt-8">
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
