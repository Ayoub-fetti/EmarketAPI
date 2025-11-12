import StatCard from "../../components/seller/StatCard";

export default function Overview() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">
          Statistiques et performances de votre boutique
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
}
