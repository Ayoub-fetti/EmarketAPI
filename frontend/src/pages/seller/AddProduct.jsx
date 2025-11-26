import { MdCloudUpload, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // États du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    ex_price: "",
    stock: "",
    categories: [],
    primaryImage: null,
    secondaryImages: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories depuis la base de données
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        setErrors({ categories: "Impossible de charger les catégories" });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCancel = () => {
    navigate("/seller/products");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Gérer la sélection/désélection des catégories
  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const isSelected = prev.categories.includes(categoryId);

      // Si déjà sélectionné, le retirer
      if (isSelected) {
        return {
          ...prev,
          categories: prev.categories.filter((id) => id !== categoryId),
        };
      } else {
        // Sinon, l'ajouter
        return {
          ...prev,
          categories: [...prev.categories, categoryId],
        };
      }
    });

    // Clear error when user selects
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: "" }));
    }
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        primaryImage: file,
      }));
    }
  };

  const handleSecondaryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      secondaryImages: [...prev.secondaryImages, ...files],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    }

    if (!formData.price) {
      newErrors.price = "Le prix est requis";
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = "Le prix ne peut pas être négatif";
    }

    if (!formData.ex_price) {
      newErrors.ex_price = "Le prix d'origine est requis";
    } else if (parseFloat(formData.ex_price) < 0) {
      newErrors.ex_price = "Le prix d'origine ne peut pas être négatif";
    }

    if (!formData.stock) {
      newErrors.stock = "Le stock est requis";
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = "Le stock ne peut pas être négatif";
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "Veuillez sélectionner au moins une catégorie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publishStatus) => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Créer FormData pour envoyer les fichiers
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("ex_price", formData.ex_price);
      data.append("stock", formData.stock);
      data.append("published", publishStatus);

      // Ajouter le seller_id de l'utilisateur connecté
      if (user && user.id) {
        data.append("seller_id", user.id);
      }

      // Le backend attend un tableau de catégories
      // FormData nécessite d'envoyer chaque élément du tableau séparément
      formData.categories.forEach((categoryId) => {
        data.append("categories[]", categoryId);
      });

      // Ajouter l'image principale
      if (formData.primaryImage) {
        data.append("primaryImage", formData.primaryImage);
      }

      // Ajouter les images secondaires
      formData.secondaryImages.forEach((file) => {
        data.append("secondaryImages", file);
      });

      // Envoyer au backend
      const response = await productService.createProduct(data);

      console.log("Produit créé avec succès:", response);
      const message = publishStatus
        ? "Produit publié avec succès !"
        : "Produit enregistré comme brouillon !";
      setSuccessMessage(message);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate("/seller/products");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      console.error("Détails de l'erreur:", error.response?.data);

      if (error.response?.data?.errors) {
        // Erreurs de validation du backend (format objet)
        const backendErrors = error.response.data.errors;
        setErrors(backendErrors);
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            "Une erreur s'est produite lors de la création du produit",
        });
      }
    } finally {
      setLoading(false);
    }
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
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-4 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          {/* Product Information */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations du Produit
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom du Produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Casque Bluetooth Premium"
                  className={`w-full px-4 py-2 border rounded-sm focus:outline-none ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre produit en détail..."
                  rows="6"
                  className={`w-full px-4 py-2.5 border rounded-sm focus:outline-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div>
                <label
                  aria-label="Catégories"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Catégories <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({formData.categories.length} sélectionnée
                    {formData.categories.length > 1 ? "s" : ""})
                  </span>
                </label>
                {loadingCategories ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-sm bg-gray-50">
                    <p className="text-gray-500 text-sm">
                      Chargement des catégories...
                    </p>
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-sm ${
                      errors.categories ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {categories.map((category) => (
                      <label
                        htmlFor="categories"
                        key={category._id}
                        className={`flex items-center gap-2 p-3 rounded-sm border-2 cursor-pointer transition-all ${
                          formData.categories.includes(category._id)
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        } ${
                          loading || loadingCategories
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          id="categories"
                          checked={formData.categories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                          disabled={loading || loadingCategories}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {errors.categories && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.categories}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Prix et Stock */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prix et Stock
            </h3>

            <div className="space-y-4">
              {/* Prix - 2 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix de Vente (DH) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-sm focus:outline-none ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Original Price */}
                <div>
                  <label
                    htmlFor="ex-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix Original (DH) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="ex-price"
                    name="ex_price"
                    value={formData.ex_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-sm focus:outline-none ${
                      errors.ex_price ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  />
                  {errors.ex_price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.ex_price}
                    </p>
                  )}
                </div>
              </div>

              {/* Stock - Pleine largeur en dessous */}
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantité en Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={`w-full px-4 py-2 border rounded-sm focus:outline-none ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
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
                    aria-label="Image Principale"
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageChange}
                    className="hidden"
                    id="primaryImage"
                    disabled={loading}
                  />
                  <label htmlFor="primaryImage" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <MdCloudUpload className="text-5xl text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {formData.primaryImage
                          ? formData.primaryImage.name
                          : "Importer une image"}
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
                  Images Secondaires ({formData.secondaryImages.length}{" "}
                  fichier(s))
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 hover:border-orange-500 transition-colors">
                  <input
                    aria-label="Images Secondaires"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSecondaryImagesChange}
                    className="hidden"
                    id="secondaryImages"
                    disabled={loading}
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
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-sm font-medium hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer en brouillon"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-orange-700 text-white rounded-sm font-medium hover:bg-orange-800"
              disabled={loading}
            >
              {loading ? "Publication..." : "Publier le produit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
