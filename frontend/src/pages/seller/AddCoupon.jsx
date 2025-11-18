import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

export default function AddCoupon() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minimumPurchase: "",
    startDate: "",
    expirationDate: "",
    maxUsage: "",
    maxUsagePerUser: "1",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Supprimer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis";
    } else if (formData.code.length < 6) {
      newErrors.code = "Le code doit contenir au moins 6 caractères";
    }

    if (!formData.value) {
      newErrors.value = "La valeur est requise";
    } else if (formData.value <= 0) {
      newErrors.value = "La valeur doit être positive";
    } else if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Le pourcentage ne peut pas dépasser 100";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La date de début est requise";
    }

    if (!formData.expirationDate) {
      newErrors.expirationDate = "La date d'expiration est requise";
    } else if (
      new Date(formData.expirationDate) <= new Date(formData.startDate)
    ) {
      newErrors.expirationDate =
        "La date d'expiration doit être après la date de début";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Pour l'instant, juste afficher les données (hardcodé)
    console.log("Données du coupon:", formData);
    alert("Coupon créé avec succès (mock)");
    navigate("/seller/coupons");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/seller/coupons")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <MdArrowBack className="text-xl" />
          <span>Retour aux coupons</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Créer un nouveau coupon
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Remplissez les informations du code promotionnel
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code du coupon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code du coupon *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: SAVE22, WINTER50"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
              style={{ textTransform: "uppercase" }}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Code unique de 6 à 20 caractères (lettres et chiffres uniquement)
            </p>
          </div>

          {/* Type et Valeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de réduction *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (DH)</option>
              </select>
            </div>

            {/* Valeur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur *
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder={
                  formData.type === "percentage" ? "Ex: 20" : "Ex: 50"
                }
                step="0.01"
                min="0"
                max={formData.type === "percentage" ? "100" : undefined}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.value ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.type === "percentage"
                  ? "Pourcentage de réduction (0-100)"
                  : "Montant de réduction en DH"}
              </p>
            </div>
          </div>

          {/* Achat minimum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achat minimum (DH)
            </label>
            <input
              type="number"
              name="minimumPurchase"
              value={formData.minimumPurchase}
              onChange={handleChange}
              placeholder="Ex: 100"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Montant minimum du panier pour utiliser ce coupon (laissez vide
              pour aucun minimum)
            </p>
          </div>

          {/* Dates de validité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* Date d'expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'expiration *
              </label>
              <input
                type="datetime-local"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.expirationDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.expirationDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.expirationDate}
                </p>
              )}
            </div>
          </div>

          {/* Limites d'utilisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Utilisation maximale totale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisation maximale totale
              </label>
              <input
                type="number"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleChange}
                placeholder="Illimité"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nombre maximum d'utilisations de ce coupon (laissez vide pour
                illimité)
              </p>
            </div>

            {/* Utilisation maximale par utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisation maximale par utilisateur *
              </label>
              <input
                type="number"
                name="maxUsagePerUser"
                value={formData.maxUsagePerUser}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Combien de fois un même utilisateur peut utiliser ce coupon
              </p>
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Un coupon inactif ne peut pas être utilisé même s'il est valide
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/seller/coupons")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
            >
              Créer le coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
