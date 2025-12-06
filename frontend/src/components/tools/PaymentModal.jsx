import { useState } from "react";
import { CreditCard, X, CheckCircle } from "lucide-react";

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        onPaymentSuccess(order._id);
        onClose();
        setPaymentSuccess(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Paiement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-green-600">Paiement réussi!</h3>
            <p className="text-gray-600 mt-2">Votre commande a été payée avec succès</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">Montant à payer:</p>
              <p className="text-2xl font-bold">{order?.finalAmount?.toFixed(2)} MAD</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Méthode de paiement</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { method: "stripe", icon: "fa-brands fa-stripe-s" },
                  { method: "paypal", icon: "fa-brands fa-paypal" },
                  { method: "card", icon: "fa-solid fa-credit-card" },
                ].map(({ method, icon }) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 border rounded-lg capitalize flex flex-col items-center gap-2 ${
                      paymentMethod === method
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300"
                    }`}
                  >
                    <i className={`${icon} text-xl`}></i>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handlePayment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro de carte</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date d'expiration</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="123"
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {processing ? (
                  "Traitement..."
                ) : (
                  <>
                    <CreditCard size={20} />
                    Payer {order?.finalAmount?.toFixed(2)} MAD
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
