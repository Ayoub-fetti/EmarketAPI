import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { reviewService } from "../services/reviewService";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Loader from "../components/tools/Loader";
import LazyImage from "../components/tools/LazyImage";
import Button from "../components/tools/Button";

export function Details() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // determine backend base url for images (fallback to VITE_BACKEND_URL without /api)
  const BACKEND_BASE =
    import.meta.env.VITE_BACKEND_BASE_URL ||
    (import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace("/api", "") : "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, reviewData] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id),
        ]);
        setProduct(productData.data);
        setReviews(reviewData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product);
  };

  // helper to build a valid image src. If the image is already a full URL or data URL, return it as-is.
  const getImageSrc = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    // fallback to computed BACKEND_BASE or env var
    const base = BACKEND_BASE || import.meta.env.VITE_BACKEND_BASE_URL || "";
    return `${base}${path}`;
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          {error}
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-gray-500">Produit non trouvé</div>
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE IMAGES */}
        <div className="space-y-3">
          {product.primaryImage && (
            <div className="aspect-square bg-gray-100 rounded-xl border border-orange-700 overflow-hidden shadow-sm">
              <LazyImage
                src={getImageSrc(product.primaryImage)}
                alt={product.title}
                className="w-full h-full object-cover"
                placeholderClassName="rounded-xl"
              />
            </div>
          )}

          {product.secondaryImages?.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.secondaryImages.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-md overflow-hidden shadow-sm border border-orange-700"
                >
                  <LazyImage
                    src={getImageSrc(image)}
                    alt=""
                    className="w-full h-full object-cover"
                    placeholderClassName="rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="space-y-5 bg-white rounded-2xl p-4 shadow-md border border-orange-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  product.published ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {product.published ? "Publié" : "Non publié"}
              </span>

              {reviews && (
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fa-solid fa-star ${
                          i < Math.floor(reviews.averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {reviews.averageRating ? reviews.averageRating.toFixed(1) : "0.0"} (
                    {reviews.total || 0})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-sm font-semibold">Description</h3>
            <p className="text-gray-700 text-sm">{product.description}</p>
          </div>

          {/* PRICE + STOCK */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold">Prix</h3>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">{product.price} MAD</span>
                {product.ex_price && (
                  <span className="text-sm text-gray-500 line-through">{product.ex_price} MAD</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Stock</h3>
              <span
                className={`text-sm font-semibold ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} disponible` : "Rupture de stock"}
              </span>
            </div>
          </div>

          {/* CATEGORIES */}
          {product.categories?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Catégories</h3>
              <div className="flex flex-wrap gap-1.5">
                {product.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700"
                  >
                    {typeof category === "object" ? category.name : category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SELLER + CREATED */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
            <div>
              <p className="font-medium">Vendeur:</p>
              <p className="capitalize">{product.seller_id?.fullname || "Non disponible"}</p>
            </div>
            <div>
              <p className="font-medium">Créé le:</p>
              <p>{new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          {product.stock > 0 && (
            <Button
              variants="primary"
              className="w-full py-2 rounded-lg text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: "#D43601", color: "white" }}
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </Button>
          )}

          {/* REVIEWS */}
          {reviews && reviews.data.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-lg font-bold mb-3">Derniers avis</h2>

              <div className="space-y-3">
                {reviews.data
                  .slice(-5)
                  .reverse()
                  .map((review) => (
                    <div key={review._id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{review.user.fullname}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <div className="flex text-yellow-400 text-sm mb-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fa-solid fa-star ${
                              i < review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          ></i>
                        ))}
                      </div>

                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
