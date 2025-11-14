import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

export default function ProductsTable({ products }) {
  const getStockColor = (stock) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock < 20) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const formatPrice = (price) => {
    return `${parseFloat(price).toFixed(2)} DH`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    // Si l'image commence par http, c'est une URL complète
    if (imagePath.startsWith("http")) return imagePath;
    // Sinon, construire l'URL avec le backend
    return `http://localhost:5173${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 sm:px-6 py-4 min-w-[200px]">
                Produit
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 hidden md:table-cell min-w-[120px]">
                Catégorie
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 min-w-[100px]">
                Prix
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 min-w-[100px]">
                Stock
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 hidden lg:table-cell min-w-[100]">
                Ventes
              </th>
              <th className="text-right text-xs font-semibold text-gray-600 uppercase px-4 sm:px-6 py-4 min-w-[140]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                {/* Product */}
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(product.primaryImage)}
                      alt={product.title}
                      className="w-12 h-12 rounded-md object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.published ? (
                          <span className="text-green-600">● Publié</span>
                        ) : (
                          <span className="text-gray-400">● Non publié</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Categories  */}
                <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                  {product.categories && product.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.categories.slice(0, 2).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {cat.name || cat}
                        </span>
                      ))}
                      {product.categories.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{product.categories.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </td>

                {/* Stock */}
                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStockColor(product.stock)}`}
                  >
                    {product.stock}
                  </span>
                </td>

                {/* Sales */}
                <td className="px-4 py-4 text-sm text-gray-900 hidden lg:table-cell text-center">
                  {product.sales || 0}
                </td>

                {/* Actions */}
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-blue-50 rounded-md transition-colors bg-gray-100"
                      title="Voir"
                    >
                      <MdVisibility className="text-lg text-gray-600" />
                    </button>
                    <button
                      className="p-2 rounded-md transition-colors bg-orange-700"
                      title="Modifier"
                    >
                      <MdEdit className="text-lg text-white" />
                    </button>
                    <button
                      className="p-2 bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <MdDelete className="text-lg text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
