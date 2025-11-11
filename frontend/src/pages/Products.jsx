import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import Loader from "../components/Loader";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData.categories);
        
        const urlSearchQuery = searchParams.get('search');
        if (urlSearchQuery) {
          setSearchQuery(urlSearchQuery);
          const searchData = await productService.searchProducts({ title: urlSearchQuery });
          setProducts(searchData.data);
        } else {
          const productsData = await productService.getPublishedProducts();
          setProducts(productsData.data);
        }
      } catch {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const filters = {
        categories: selectedCategories,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        title: searchQuery || undefined
      };
      
      const data = await productService.searchProducts(filters);
      setProducts(data.data);
    } catch {
      setError('Erreur lors du filtrage');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = async () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    try {
      setLoading(true);
      const data = await productService.getPublishedProducts();
      setProducts(data.data);
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (<Loader/>);
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery ? `Search results for "${searchQuery}"` : 'Bienvenue sur FETTY'}
      </h1>
      
      <section>
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold mb-4">Filtres</h3>
          
          {/* Search Input */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Recherche</h4>
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-md"
            />
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Prix</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Prix min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border rounded px-3 py-1 w-24"
              />
              <span className="self-center">-</span>
              <input
                type="number"
                placeholder="Prix max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border rounded px-3 py-1 w-24"
              />
              <span className="self-center">MAD</span>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Catégories</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <label key={category._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => handleCategoryChange(category._id)}
                    className="mr-2"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Filtrer
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Effacer
            </button>
          </div>
        </div>
      </section>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleProductClick(product._id)}
          >
            <img 
              src={product.primaryImage ? `http://localhost:3000${product.primaryImage}` : '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 uppercase">{product.title}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">{product.price} MAD</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchQuery ? `Aucun produit trouvé pour "${searchQuery}"` : 'Aucun produit trouvé'}
          </p>
        </div>
      )}
    </div>
  );
}
