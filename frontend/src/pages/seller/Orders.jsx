import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import OrdersTable from "../../components/seller/OrdersTable";
import { orderService } from "../../services/orderService";
import api from "../../services/axios";

export default function Orders() {
  const { user } = useAuth();

  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // États pour les commandes
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les commandes du seller (via les produits)
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("=== Chargement des commandes du seller ===");
        console.log("Seller ID:", user.id);

        const response = await orderService.getSellerOrders(user.id);
        console.log("Response:", response);
        console.log("Orders:", response.orders);

        setOrders(response.orders || []);
        setFilteredOrders(response.orders || []);
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

  // Filtrer les commandes
  useEffect(() => {
    let filtered = [...orders];

    // Filtre par recherche (ID de commande ou nom client ou email)
    if (searchQuery) {
      filtered = filtered.filter((order) => {
        const query = searchQuery.toLowerCase();
        const orderId = order._id?.toLowerCase() || "";
        const customerName = order.userId?.fullname?.toLowerCase() || "";
        const customerEmail = order.userId?.email?.toLowerCase() || "";

        // Générer le numéro de commande pour la recherche
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

    // Filtre par statut
    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, selectedStatus, orders]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
  };

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
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
    }
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Mes Commandes
        </h1>
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

            {(searchQuery || selectedStatus) && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-md text-white border bg-orange-700 rounded-md hover:bg-orange-800"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        {!loading && (
          <div className="mt-6 text-sm text-gray-600">
            {filteredOrders.length === orders.length ? (
              <span>
                {orders.length} commande{orders.length > 1 ? "s" : ""} au total
              </span>
            ) : (
              <span>
                {filteredOrders.length} commande
                {filteredOrders.length > 1 ? "s" : ""} trouvée
                {filteredOrders.length > 1 ? "s" : ""} sur {orders.length} au
                total
              </span>
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
              {searchQuery || selectedStatus
                ? "Aucune commande trouvée"
                : "Aucune commande"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || selectedStatus
                ? "Essayez de modifier vos critères de recherche"
                : "Les commandes de vos produits apparaîtront ici"}
            </p>
            {(searchQuery || selectedStatus) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
