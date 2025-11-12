import StatCard from "../../components/seller/StatCard";
import RecentPayments from "../../components/seller/RecentPayments";
import RecentOrders from "../../components/seller/RecentOrders";

export default function Overview() {
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
