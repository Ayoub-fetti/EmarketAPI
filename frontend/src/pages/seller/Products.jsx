import ProductsTable from "../../components/seller/ProductsTable";
import SearchBar from "../../components/seller/SearchBar";
import FilterSelect from "../../components/seller/FilterSelect";
import ActionButton from "../../components/seller/ActionButton";
import { useState } from "react";

export default function Products() {
  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock] = useState("");

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
  // Données de démonstration pour les produits
  const products = [
    {
      image: "https://via.placeholder.com/150",
      name: "Casque Bluetooth à Conduction Osseuse",
      category: "Audio",
      price: "2 990 DH",
      stock: 45,
      sales: 128,
    },
    {
      image: "https://via.placeholder.com/150",
      name: "Écouteurs Sans Fil Pro",
      category: "Audio",
      price: "1 990 DH",
      stock: 32,
      sales: 89,
    },
    {
      image: "https://via.placeholder.com/150",
      name: 'HP Stream 14" Laptop',
      category: "Électronique",
      price: "3 700 DH",
      stock: 12,
      sales: 34,
    },
    {
      image: "https://via.placeholder.com/150",
      name: "Montre Connectée Series 5",
      category: "Accessoires",
      price: "4 500 DH",
      stock: 0,
      sales: 67,
    },
    {
      image: "https://via.placeholder.com/150",
      name: "Souris Gaming RGB",
      category: "Accessoires",
      price: "890 DH",
      stock: 156,
      sales: 234,
    },
  ];

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
          onClick={() => console.log("Ajouter un produit")}
        />
      </div>

      {/* Products Table */}
      <ProductsTable products={products} />
    </div>
  );
}
