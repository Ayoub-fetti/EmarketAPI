import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import ActionButton from "../../components/seller/ActionButton";
import CouponsTable from "../../components/seller/CouponsTable";
import DeleteConfirmModal from "../../components/seller/DeleteConfirmModal";
import { useSellerCoupons } from "../../hooks/seller/useSellerCoupons";

export default function Coupons() {
  const navigate = useNavigate();
  const {
    coupons,
    filteredCoupons,
    loading,
    error,
    filters,
    deleteModal,
    deleteCoupon,
    resetFilters,
  } = useSellerCoupons();

  const {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
  } = filters;

  const {
    isOpen: isDeleteModalOpen,
    itemToDelete: couponToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
  } = deleteModal;

  // Options pour les filtres
  const statusOptions = [
    { value: "active", label: "Actif" },
    { value: "inactive", label: "Inactif" },
  ];

  const typeOptions = [
    { value: "percentage", label: "Pourcentage" },
    { value: "fixed", label: "Montant fixe" },
  ];

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
              onClick={resetFilters}
              className="ml-4 text-orange-700 hover:text-orange-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des coupons...</p>
        </div>
      ) : (
        <>
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
            </div>
          ) : (
            <CouponsTable
              coupons={filteredCoupons}
              onDelete={openDeleteModal}
            />
          )}
        </>
      )}

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteCoupon}
        itemName={couponToDelete?.code}
        itemType="coupon"
        loading={isDeleting}
      />
    </div>
  );
}
