import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import ActionButton from "../../components/seller/ActionButton";
import CouponsTable from "../../components/seller/CouponsTable";

export default function Coupons() {
  const navigate = useNavigate();

  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Données hardcodées (mock data)
  const mockCoupons = [
    {
      _id: "1",
      code: "SAVE22",
      type: "percentage",
      value: 20,
      minimumPurchase: 10,
      startDate: "2025-01-15T00:00:00.000Z",
      expirationDate: "2025-12-31T23:59:59.000Z",
      maxUsage: 100,
      maxUsagePerUser: 1,
      status: "active",
      usedBy: [],
      createdAt: "2025-11-18T18:51:21.362Z",
    },
    {
      _id: "2",
      code: "WINTER50",
      type: "fixed",
      value: 50,
      minimumPurchase: 200,
      startDate: "2024-12-01T00:00:00.000Z",
      expirationDate: "2025-02-28T23:59:59.000Z",
      maxUsage: 50,
      maxUsagePerUser: 1,
      status: "active",
      usedBy: [{ user: "user1", usedAt: "2025-01-10", usageCount: 1 }],
      createdAt: "2024-11-20T10:30:00.000Z",
    },
    {
      _id: "3",
      code: "EXPIRED10",
      type: "percentage",
      value: 10,
      minimumPurchase: 0,
      startDate: "2024-01-01T00:00:00.000Z",
      expirationDate: "2024-12-31T23:59:59.000Z",
      maxUsage: 200,
      maxUsagePerUser: 2,
      status: "inactive",
      usedBy: [
        { user: "user1", usedAt: "2024-05-10", usageCount: 1 },
        { user: "user2", usedAt: "2024-06-15", usageCount: 1 },
        { user: "user3", usedAt: "2024-07-20", usageCount: 2 },
      ],
      createdAt: "2024-01-01T08:00:00.000Z",
    },
    {
      _id: "4",
      code: "FLASH30",
      type: "percentage",
      value: 30,
      minimumPurchase: 100,
      startDate: "2025-11-01T00:00:00.000Z",
      expirationDate: "2025-11-30T23:59:59.000Z",
      maxUsage: 30,
      maxUsagePerUser: 1,
      status: "active",
      usedBy: Array(25).fill({ user: "userX", usageCount: 1 }),
      createdAt: "2025-10-25T14:20:00.000Z",
    },
    {
      _id: "5",
      code: "BIENVENUE",
      type: "fixed",
      value: 25,
      minimumPurchase: 50,
      startDate: "2025-01-01T00:00:00.000Z",
      expirationDate: "2026-12-31T23:59:59.000Z",
      maxUsage: null,
      maxUsagePerUser: 1,
      status: "active",
      usedBy: Array(150).fill({ user: "userX", usageCount: 1 }),
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  ];

  // Options pour les filtres
  const statusOptions = [
    { value: "active", label: "Actif" },
    { value: "inactive", label: "Inactif" },
  ];

  const typeOptions = [
    { value: "percentage", label: "Pourcentage" },
    { value: "fixed", label: "Montant fixe" },
  ];

  // Filtrer les coupons
  const filteredCoupons = mockCoupons.filter((coupon) => {
    const matchesSearch = coupon.code
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus
      ? coupon.status === selectedStatus
      : true;
    const matchesType = selectedType ? coupon.type === selectedType : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Fonctions de gestion (hardcodées pour l'instant)
  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce coupon ?")) {
      console.log("Supprimer coupon:", id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gestion des Coupons
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Créez et gérez vos codes promotionnels
        </p>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Search Bar */}
          <SearchBar
            placeholder="Rechercher un code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Status Filter */}
          <FilterSelect
            options={statusOptions}
            placeholder="Tous les statuts"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />

          {/* Type Filter */}
          <FilterSelect
            options={typeOptions}
            placeholder="Tous les types"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
        </div>

        {/* Add Coupon Button */}
        <ActionButton
          label="Ajouter un Coupon"
          icon="+"
          onClick={() => navigate("/seller/coupons/add")}
        />
      </div>

      {/* Results count */}
      {(searchQuery || selectedStatus || selectedType) && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredCoupons.length} coupon(s) trouvé(s)
          {(searchQuery || selectedStatus || selectedType) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("");
                setSelectedType("");
              }}
              className="ml-4 text-orange-700 hover:text-orange-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Coupons Table */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun coupon trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre premier coupon
          </p>
          <ActionButton
            label="Ajouter un Coupon"
            icon="+"
            onClick={() => navigate("/seller/coupons/add")}
          />
        </div>
      ) : (
        <CouponsTable coupons={filteredCoupons} onDelete={handleDelete} />
      )}
    </div>
  );
}
