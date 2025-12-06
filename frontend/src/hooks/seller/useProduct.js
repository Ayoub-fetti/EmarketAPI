import { useState, useEffect } from "react";
import { productService } from "../../services/productService";

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement du produit:", err);
        setError(err.response?.data?.message || err.message || "Impossible de charger le produit");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
