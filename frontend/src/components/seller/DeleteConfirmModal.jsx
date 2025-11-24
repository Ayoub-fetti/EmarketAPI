import { MdClose, MdWarning } from "react-icons/md";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "produit",
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-md shadow-xl max-w-lg w-full mx-4 p-6 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <MdClose className="text-2xl" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <MdWarning className="text-4xl text-orange-700" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          Confirmer la suppression
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          Êtes-vous sûr de vouloir supprimer{" "}
          {itemType === "coupon" ? "le coupon" : "le produit"}{" "}
          <span className="font-semibold text-gray-900">"{itemName}"</span> ?
          <br />
          <span className="text-sm text-red-700 mt-2 block">
            Cette action peut être annulée plus tard.
          </span>
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-2 py-2 border border-gray-300 text-gray-700 font-small rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-2 py-2 bg-orange-700 text-white font-small rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
