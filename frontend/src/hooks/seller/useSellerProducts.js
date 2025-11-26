import { useState, useEffect, useMemo, useCallback } from "react";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";

export function useSellerProducts() {
  const { user } = useAuth();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock] = useState("");

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getProductsBySeller(user.id);
        setProducts(response.products || []);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des produits"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        if (!product.categories || product.categories.length === 0)
          return false;
        return product.categories.some((cat) => {
          const categoryId = typeof cat === "string" ? cat : cat._id;
          return categoryId === selectedCategory;
        });
      });
    }

    if (selectedStock) {
      if (selectedStock === "in-stock") {
        filtered = filtered.filter((product) => product.stock > 0);
      } else if (selectedStock === "out-of-stock") {
        filtered = filtered.filter((product) => product.stock === 0);
      }
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedStock, products]);

  // Category options for select
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category._id,
      label: category.name,
    }));
  }, [categories]);

  // Delete product handler
  const deleteProduct = useCallback(async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStock("");
  }, []);

  return {
    products,
    filteredProducts,
    categories,
    categoryOptions,
    loading,
    error,
    filters: {
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedStock,
      setSelectedStock,
    },
    deleteProduct,
    resetFilters,
  };
}
