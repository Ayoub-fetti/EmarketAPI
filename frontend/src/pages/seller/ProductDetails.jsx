import { MdArrowBack } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService } from "../../services/productService";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le produit
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        setProduct(response.data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        setError("Impossible de charger le produit");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleCancel = () => {
    navigate("/seller/products");
  };

  const formatPrice = (price) => {
    return `${parseFloat(price).toFixed(2)} DH`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `http://localhost:3000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
            <p className="mt-4 text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error || "Produit non trouvé"}</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <MdArrowBack className="text-xl" />
          <span className="font-medium">Retour aux produits</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6">{product.title}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-4">Détails du produit</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 border border-gray-200 rounded-md">
        {/* Images Section */}
        <div>
          <div className="space-y-4">
            {/* Primary Image */}
            <div>
              {product.primaryImage ? (
                <div className="w-full aspect-square rounded-sm overflow-hidden border border-orange-700">
                  <img
                    src={getImageUrl(product.primaryImage)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-sm flex items-center justify-center border border-orange-700">
                  <p className="text-gray-500">Aucune image</p>
                </div>
              )}
            </div>

            {/* Secondary Images */}
            {product.secondaryImages && product.secondaryImages.length > 0 && (
              <div>
                <div className="grid grid-cols-4 gap-2">
                  {product.secondaryImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-sm overflow-hidden border border-orange-700"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
            </div>

            {/* Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400 text-lg">
                {"★".repeat(4)}
                {"☆".repeat(1)}
              </div>
              <span className="text-sm text-gray-600">[4.1] 12 avis</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 my-6">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.ex_price && parseFloat(product.ex_price) !== parseFloat(product.price) && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.ex_price)}
                </span>
              )}
            </div>

            {/* Details */}
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-2">Détails:</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Categories */}
            <div>
              {product.categories && (
                <div className="flex flex-wrap gap-2 mt-10 mb-4">
                  {product.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {typeof category === "string" ? category : category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité:</label>
                <p
                  className={`text-lg font-semibold ${
                    product.stock > 0 ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {product.stock} {product.stock > 1 ? "unités" : "unité"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
