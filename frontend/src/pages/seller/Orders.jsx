import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import OrdersTable from "../../components/seller/OrdersTable";
import { useSellerOrders } from "../../hooks/seller/useSellerOrders";

export default function Orders() {
  const { filteredOrders, loading, error, filters, updateOrderStatus, resetFilters } =
    useSellerOrders();

  const { searchQuery, setSearchQuery, selectedStatus, setSelectedStatus } = filters;

  // Options de statut fixes
  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "shipped", label: "Expédiée" },
    { value: "delivered", label: "Livrée" },
    { value: "cancelled", label: "Annulée" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Gérez toutes les commandes de vos produits
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <SearchBar
            placeholder="Rechercher par N° commande, client ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <FilterSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              placeholder="Tous les statuts"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Results Counter */}
        {(searchQuery || selectedStatus) && (
          <div className="mt-6 text-sm text-gray-600">
            {filteredOrders.length} commande(s) trouvée(s)
            {(searchQuery || selectedStatus) && (
              <button
                onClick={resetFilters}
                className="ml-4 text-orange-700 hover:text-orange-800 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-md shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mb-4"></div>
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchQuery || selectedStatus ? "Aucune commande trouvée" : "Aucune commande"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || selectedStatus
                ? "Essayez de modifier vos critères de recherche"
                : "Les commandes de vos produits apparaîtront ici"}
            </p>
          </div>
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} onStatusChange={updateOrderStatus} />
      )}
    </div>
  );
}
