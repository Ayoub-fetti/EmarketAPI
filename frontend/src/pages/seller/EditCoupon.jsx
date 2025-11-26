import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { couponService } from "../../services/couponService";
import { useCoupon } from "../../hooks/seller/useCoupon";

export default function EditCoupon() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { coupon, loading: loadingCoupon, error: errorCoupon } = useCoupon(id);

  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });
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

  // Charger les données du coupon
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        minimumPurchase: coupon.minimumPurchase.toString(),
        startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
        expirationDate: new Date(coupon.expirationDate)
          .toISOString()
          .slice(0, 16),
        maxUsage: coupon.maxUsage ? coupon.maxUsage.toString() : "",
        maxUsagePerUser: coupon.maxUsagePerUser.toString(),
        status: coupon.status,
      });
    }

    if (errorCoupon) {
      setAlertMessage({
        type: "error",
        message: errorCoupon,
      });
    }
  }, [coupon, errorCoupon]);

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
    // Supprimer le message d'alerte
    if (alertMessage.message) {
      setAlertMessage({ type: "", message: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlertMessage({
        type: "error",
        message: "Veuillez corriger les erreurs dans le formulaire",
      });
      return;
    }

    try {
      setSubmitting(true);
      setAlertMessage({ type: "", message: "" });

      // Préparer les données pour l'API
      const couponData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        minimumPurchase: formData.minimumPurchase
          ? Number(formData.minimumPurchase)
          : 0,
        startDate: new Date(formData.startDate).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString(),
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
        maxUsagePerUser: Number(formData.maxUsagePerUser) || 1,
        status: formData.status,
      };

      console.log("Mise à jour du coupon:", couponData);

      // Appel API pour mettre à jour le coupon
      const response = await couponService.updateCoupon(id, couponData);

      console.log("Réponse API:", response);

      setAlertMessage({
        type: "success",
        message: "Coupon mis à jour avec succès !",
      });

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate("/seller/coupons");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du coupon:", error);

      // Gérer les erreurs de validation du backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          backendErrors[err.path] = err.message;
        });
        setErrors(backendErrors);
        setAlertMessage({
          type: "error",
          message: "Veuillez corriger les erreurs dans le formulaire",
        });
      } else {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour du coupon";

        setAlertMessage({
          type: "error",
          message: errorMessage,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCoupon) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
          <p className="mt-4 text-gray-600">Chargement du coupon...</p>
        </div>
      </div>
    );
  }

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
          Modifier le coupon
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Code: <span className="font-mono font-bold">{formData.code}</span>
        </p>
      </div>

      {/* Alert Message */}
      {alertMessage.message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            alertMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{alertMessage.message}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-md border border-gray-200 p-6">
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
              className={`w-full px-4 py-2 border rounded-md outline-none transition-colors ${
                errors.code
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-gray-400"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-gray-400 transition-colors"
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
                className={`w-full px-4 py-2 border rounded-md outline-none transition-colors ${
                  errors.value
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-gray-400"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-gray-400 transition-colors"
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
                className={`w-full px-4 py-2 border rounded-md outline-none transition-colors ${
                  errors.startDate
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-gray-400"
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
                className={`w-full px-4 py-2 border rounded-md outline-none transition-colors ${
                  errors.expirationDate
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-gray-400"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-gray-400 transition-colors"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-gray-400 transition-colors"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-gray-400 transition-colors"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Un coupon inactif ne peut pas être utilisé même s'il est valide
            </p>
          </div>
        </form>
      </div>

      {/* Buttons */}
      <form onSubmit={handleSubmit}>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/seller/coupons")}
            disabled={submitting}
            className="px-6 py-2 border border-gray-200 bg-white rounded-sm text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-orange-700 text-white rounded-sm font-medium hover:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Mise à jour...</span>
              </>
            ) : (
              "Mettre à jour"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
