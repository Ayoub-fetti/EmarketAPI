import ProductsTable from "../../components/seller/ProductsTable";
import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import ActionButton from "../../components/seller/ActionButton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { useAuth } from "../../context/AuthContext";

export default function Products() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock] = useState("");

  // États pour les produits
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les produits du seller
  useEffect(() => {
    const fetchProducts = async () => {
      console.log("=== Début du chargement des produits ===");
      console.log("User:", user);

      if (!user || !user.id) {
        console.log("Utilisateur non connecté ou pas d'ID");
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Appel API avec seller ID:", user.id);
        const response = await productService.getProductsBySeller(user.id);
        console.log("Response brute:", response);
        console.log("Produits:", response.products);
        console.log("Nombre de produits:", response.products?.length || 0);

        setProducts(response.products || []);
        setError(null);
      } catch (err) {
        console.error("=== ERREUR DÉTAILLÉE ===");
        console.error("Erreur complète:", err);
        console.error("Response:", err.response);
        console.error("Data:", err.response?.data);
        console.error("Status:", err.response?.status);
        console.error("Message:", err.message);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des produits"
        );
      } finally {
        setLoading(false);
        console.log("=== Fin du chargement ===");
      }
    };

    fetchProducts();
  }, [user]);

  // Options pour les filtres
  const categoryOptions = [
    { value: "audio", label: "Audio" },
    { value: "electronique", label: "Électronique" },
    { value: "accessoires", label: "Accessoires" },
    { value: "vetements", label: "Vêtements" },
  ];

  const stockOptions = [
    { value: "in-stock", label: "En stock" },
    { value: "out-of-stock", label: "Rupture de stock" },
  ];

  // Gérer la suppression d'un produit
  const handleProductDeleted = (deletedProductId) => {
    // Retirer le produit de la liste
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== deletedProductId)
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gestion des Produits
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Gérez l'inventaire de vos produits
        </p>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Search Bar */}
          <SearchBar
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category Filter */}
          <FilterSelect
            options={categoryOptions}
            placeholder="Toutes les catégories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />

          {/* Stock Filter */}
          <FilterSelect
            options={stockOptions}
            placeholder="Tous les stocks"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          />
        </div>

        {/* Add Product Button */}
        <ActionButton
          label="Ajouter un Produit"
          icon="+"
          onClick={() => navigate("/seller/products/add")}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Vérifiez la console pour plus de détails
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter votre premier produit
          </p>
          <ActionButton
            label="Ajouter un Produit"
            icon="+"
            onClick={() => navigate("/seller/products/add")}
          />
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && products.length > 0 && (
        <ProductsTable
          products={products}
          onProductDeleted={handleProductDeleted}
        />
      )}
    </div>
  );
}
