import { MdCloudUpload, MdArrowBack, MdClose } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const [existingImages, setExistingImages] = useState({
    primaryImage: null,
    secondaryImages: [],
  });

  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories
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

  // Charger le produit à éditer
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const response = await productService.getProductById(id);
        const product = response.data;

        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price || "",
          ex_price: product.ex_price || "",
          stock: product.stock || "",
          categories: product.categories?.map((cat) => cat._id || cat) || [],
          primaryImage: null,
          secondaryImages: [],
        });

        setExistingImages({
          primaryImage: product.primaryImage || null,
          secondaryImages: product.secondaryImages || [],
        });

        setIsPublished(product.published || false);

      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        setErrors({ submit: "Impossible de charger le produit" });
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleCancel = () => {
    navigate("/seller/products");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      if (isSelected) {
        return {
          ...prev,
          categories: prev.categories.filter((id) => id !== categoryId),
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, categoryId],
        };
      }
    });

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

  const removeExistingSecondaryImage = (index) => {
    setExistingImages((prev) => ({
      ...prev,
      secondaryImages: prev.secondaryImages.filter((_, i) => i !== index),
    }));
  };

  const removeNewSecondaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      secondaryImages: prev.secondaryImages.filter((_, i) => i !== index),
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

  const handleSubmit = async (publishStatus = null) => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      if (formData.ex_price) {
        data.append("ex_price", formData.ex_price);
      }
      data.append("stock", formData.stock);

      // Si publishStatus est fourni, l'utiliser, sinon garder l'état actuel
      if (publishStatus !== null) {
        data.append("published", publishStatus);
      }

      if (user && user.id) {
        data.append("seller_id", user.id);
      }

      formData.categories.forEach((categoryId) => {
        data.append("categories[]", categoryId);
      });

      if (formData.primaryImage) {
        data.append("primaryImage", formData.primaryImage);
      }

      formData.secondaryImages.forEach((file) => {
        data.append("secondaryImages", file);
      });

      const response = await productService.updateProduct(id, data);

      console.log("Produit modifié avec succès:", response);
      const message = publishStatus === true 
        ? "Produit publié avec succès !" 
        : "Produit enregistré avec succès !";
      setSuccessMessage(message);

      setTimeout(() => {
        navigate("/seller/products");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la modification du produit:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        setErrors(backendErrors);
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            "Une erreur s'est produite lors de la modification du produit",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
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
          Modifier le Produit
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Modifiez les informations de votre produit
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de Vente (DH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Original (DH)
                </label>
                <input
                  type="number"
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
                  <p className="text-red-500 text-xs mt-1">{errors.ex_price}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 my-2">
                  Quantité en Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
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

                {/* Existing Primary Image */}
                {existingImages.primaryImage && !formData.primaryImage && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Image actuelle:
                    </p>
                    <img
                      src={`http://localhost:3000${existingImages.primaryImage}`}
                      alt="Image principale actuelle"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-orange-500 transition-colors">
                  <input
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
                          : "Changer l'image principale"}
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

                {/* Existing Secondary Images */}
                {existingImages.secondaryImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Images actuelles:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages.secondaryImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`http://localhost:3000${img}`}
                            alt={`Image secondaire ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingSecondaryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdClose className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Secondary Images */}
                {formData.secondaryImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Nouvelles images à ajouter:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {formData.secondaryImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="w-full h-24 bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center">
                            <p className="text-xs text-gray-600 text-center px-2">
                              {file.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewSecondaryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdClose className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 hover:border-orange-500 transition-colors">
                  <input
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
              onClick={() => handleSubmit(null)}
              className="px-6 py-2 bg-gray-600 text-white rounded-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer modifications"}
            </button>
            {!isPublished && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="px-6 py-2 bg-orange-700 text-white rounded-sm font-medium hover:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Publication..." : "Publier le produit"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
