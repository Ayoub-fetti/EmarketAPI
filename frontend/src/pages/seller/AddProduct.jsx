import { MdCloudUpload, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {

  const navigate = useNavigate();

  // Catégories statiques
  const categories = [
    { _id: "1", name: "Audio" },
    { _id: "2", name: "Électronique" },
    { _id: "3", name: "Accessoires" },
    { _id: "4", name: "Vêtements" },
    { _id: "5", name: "Maison" },
    { _id: "6", name: "Sport" },
  ];

  const handleCancel = () => {
    navigate("/seller/products");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis");
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Nouveau Produit
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Ajoutez un nouveau produit à votre inventaire
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Product Information */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations du Produit
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ex: Casque Bluetooth Premium"
                  className="w-full px-4 py-2 border rounded-sm focus:outline-none border-gray-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Décrivez votre produit en détail..."
                  rows="6"
                  className="w-full px-4 py-2.5 border rounded-sm focus:outline-none border-gray-300"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  defaultValue=""
                  className="w-full px-4 py-2 border rounded-sm border-gray-300"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Prix et Stock */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prix et Stock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de Vente (DH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-sm focus:outline-none border-gray-300"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité en Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-sm focus:outline-none border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-sm shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Images du Produit
            </h3>

            <div className="space-y-4">
              {/* Primary Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Principale
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="primaryImage"
                  />
                  <label htmlFor="primaryImage" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <MdCloudUpload className="text-5xl text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Importer une image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, SVG jusqu'à 10MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Secondary Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images Secondaires
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="secondaryImages"
                  />
                  <label
                    htmlFor="secondaryImages"
                    className="cursor-pointer block text-center"
                  >
                    <MdCloudUpload className="text-4xl text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Ajouter d'autres images
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Vous pouvez sélectionner plusieurs images
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-200 bg-white rounded-sm text-gray-700 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-700 text-white rounded-sm font-medium transition-colors"
            >
              Créer le Produit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
