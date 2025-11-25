import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import Loader from "../components/tools/Loader";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import discountImage from "../../public/discount.png";
import "../App.css";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // determine backend base url for images
  const BACKEND_BASE =
    import.meta.env.VITE_BACKEND_BASE_URL ||
    (import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace("/api", "")
      : "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData.categories);

        const urlSearchQuery = searchParams.get("search");
        if (urlSearchQuery) {
          setSearchQuery(urlSearchQuery);
          const searchData = await productService.searchProducts({
            title: urlSearchQuery,
          });
          setProducts(searchData.data);
        } else {
          const productsData = await productService.getPublishedProducts(
            currentPage
          );
          setProducts(productsData.data);
          setTotalPages(productsData.pages);
        }
      } catch {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams, currentPage]);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const filters = {
        categories: selectedCategories,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        title: searchQuery || undefined,
      };

      const data = await productService.searchProducts(filters);
      setProducts(data.data);
    } catch {
      setError("Erreur lors du filtrage");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = async () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    try {
      setLoading(true);
      const data = await productService.getPublishedProducts(1);
      setProducts(data.data);
      setTotalPages(data.pages);
      setCurrentPage(1);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {searchQuery ? `Résultats pour "${searchQuery}"` : "FastShop"}
            </h1>
            <p className="text-xl font-bold text-orange-700">
              {searchQuery
                ? "Produits trouvés"
                : "Bienvenue sur FastShop - Découvrez nos produits"}
            </p>
          </div>
          {!searchQuery && (
            <img
              src={discountImage}
              alt="Discount"
              className="w-35 h-35 object-contain slide-image"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-card border border-orange-600 rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Filtres
                </h3>
                {(selectedCategories.length > 0 ||
                  minPrice ||
                  maxPrice ||
                  searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Produits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Gamme de prix (MAD)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all text-sm w-25"
                    />
                    <span className="self-center text-muted-foreground text-sm">
                      -
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all text-sm w-25"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Catégories
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                        className="w-4 h-4 rounded border-input bg-background text-primary cursor-pointer"
                      />
                      <span className="text-sm text-foreground">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={handleFilter}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  Filtrer
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="group relative bg-card border border-orange-600 rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-2xl text-left h-full flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={
                          product.primaryImage
                            ? product.primaryImage.startsWith("http")
                              ? product.primaryImage
                              : `${BACKEND_BASE}${product.primaryImage}`
                            : "/placeholder.jpg"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">
                        {product.title}
                      </h3>
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-4 flex-1">
                        {product.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-end justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {product.price}
                          </p>
                          <p className="text-xs text-muted-foreground">MAD</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Stock</p>
                          <p
                            className={`text-sm font-semibold ${
                              product.stock > 0
                                ? "text-green-600"
                                : "text-destructive"
                            }`}
                          >
                            {product.stock}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    {searchQuery
                      ? `Aucun produit trouvé pour "${searchQuery}"`
                      : "Aucun produit trouvé"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Essayez de modifier vos filtres
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Pagination */}
          {!searchQuery && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-input bg-background hover:bg-accent disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-gray-300 text-primary-foreground"
                        : "bg-background border border-input hover:bg-accent"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-input bg-background hover:bg-accent disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
