import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

export default function ProductsTable({ products }) {
  const getStockColor = (stock) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock < 20) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
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
            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                {/* Product */}
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-md object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category - Hidden on mobile */}
                <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                  {product.category}
                </td>

                {/* Price */}
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {product.price}
                </td>

                {/* Stock */}
                <td className="px-4 py-4">
                  <span
                    className={"px-3 py-1 rounded-full text-sm font-medium text-orange-700"}
                  >
                    {product.stock}
                  </span>
                </td>

                {/* Sales - Hidden on mobile/tablet */}
                <td className="px-4 py-4 text-sm text-gray-900 hidden lg:table-cell text-center">
                  {product.sales}
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
