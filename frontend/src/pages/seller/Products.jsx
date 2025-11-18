import ProductsTable from "../../components/seller/ProductsTable";
import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import ActionButton from "../../components/seller/ActionButton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

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
        setFilteredProducts(response.products || []);
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

  // Filtrer les produits en fonction de la recherche et des filtres
  useEffect(() => {
    let filtered = [...products];

    // Filtrer par recherche (titre ou description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Filtrer par catégorie
    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        if (!product.categories || product.categories.length === 0)
          return false;

        // Vérifier si au moins une catégorie correspond (par ID)
        return product.categories.some((cat) => {
          const categoryId = typeof cat === "string" ? cat : cat._id;
          return categoryId === selectedCategory;
        });
      });
    }

    // Filtrer par stock
    if (selectedStock) {
      if (selectedStock === "in-stock") {
        filtered = filtered.filter((product) => product.stock > 0);
      } else if (selectedStock === "out-of-stock") {
        filtered = filtered.filter((product) => product.stock === 0);
      }
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedStock, products]);

  // Options pour les filtres - catégories dynamiques depuis le backend
  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
  }));

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
    setFilteredProducts((prevProducts) =>
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

      {/* Empty State - No products at all */}
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

      {/* No results after filtering */}
      {!loading &&
        !error &&
        products.length > 0 &&
        filteredProducts.length === 0 && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou de filtrage
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedStock("");
              }}
              className="px-6 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      {/* Products Table */}
      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""} trouvé
            {filteredProducts.length > 1 ? "s" : ""}
            {(searchQuery || selectedCategory || selectedStock) && (
              <span className="ml-2">sur {products.length} au total</span>
            )}
          </div>
          <ProductsTable
            products={filteredProducts}
            onProductDeleted={handleProductDeleted}
          />
        </>
      )}
    </div>
  );
}
