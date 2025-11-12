import StatCard from "../../components/seller/StatCard";
import RecentPayments from "../../components/seller/RecentPayments";
import RecentOrders from "../../components/seller/RecentOrders";
import { MdNotifications } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

export default function Overview() {
  const { user } = useAuth();
  
  // Nombre de notifications non lues
  const unreadNotifications = 2;
  // Données pour les paiements récents
  const recentPayments = [
    { id: "BD54B22D", date: "Mar 14, 2025 at 08:10", amount: "249.50 dh" },
    { id: "BD54B22D", date: "Mar 14, 2025 at 08:10", amount: "249.50 dh" },
    { id: "BD54B22D", date: "Mar 14, 2025 at 08:10", amount: "249.50 dh" },
    { id: "BD54B22D", date: "Mar 14, 2025 at 08:10", amount: "249.50 dh" },
  ];

  // Données pour les commandes récentes
  const recentOrders = [
    {
      id: "BD54B22D",
      date: "Mar 20 2025",
      client: "adnane el falaki",
      status: "en attente",
    },
    {
      id: "BD54B22D",
      date: "Mar 21 2025",
      client: "zaid boukab",
      status: "validée",
    },
    {
      id: "BD54B22D",
      date: "Mar 21 2025",
      client: "zaid boukab",
      status: "validée",
    },
    {
      id: "BD54B22D",
      date: "Mar 22 2025",
      client: "adel chemlal",
      status: "en route",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header with User & Notifications */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tableau de Bord
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Statistiques et performances de votre boutique
          </p>
        </div>

        {/* User & Notifications Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Icon */}
          <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
            <MdNotifications className="text-2xl text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-orange-700 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadNotifications}
              </span>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer px-2 sm:px-3 py-2 rounded-lg transition-colors">
            {/* Avatar */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: "rgb(212, 54, 1)" }}
            >
              {user?.fullname ? user.fullname.substring(0, 2).toUpperCase() : "MB"}
            </div>
            
            {/* User Info - Hidden on small screens */}
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.fullname || "Seller"}
              </p>
              <p className="text-xs text-gray-500">Seller dashboard</p>
            </div>

          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenus"
          value="22 550 DH"
          subValue="3 500 DH aujourd'hui"
          percentage="1.5%"
          isPositive={false}
          badge="ce-mois-ci"
        />

        <StatCard
          title="Commandes En Cours"
          value="48"
          subValue="12 nouvelles aujourd'hui"
          percentage="8.3%"
          isPositive={true}
          badge="ce-mois-ci"
        />

        <StatCard
          title="Produits Actifs"
          value="156"
          subValue="8 en rupture de stock"
          percentage="2.1%"
          isPositive={true}
          badge="Total"
        />

        <StatCard
          title="Commandes Livrées"
          value="324"
          subValue="28 cette semaine"
          percentage="5.2%"
          isPositive={true}
          badge="ce-mois-ci"
        />
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <RecentPayments payments={recentPayments} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
