import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart, Tag, X } from "lucide-react";
import Button from "./Button";
import LazyImage from "./LazyImage";
import { validateCoupon } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
import { toast } from "react-toastify";

const Cart = ({ isOpen, onClose }) => {
  const { items, loading, updateQuantity, removeFromCart, clearCart, getSubtotal, getItemCount } =
    useCart();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // determine backend base url for images
  const BACKEND_BASE =
    import.meta.env.VITE_BACKEND_BASE_URL ||
    (import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace("/api", "") : "");

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Veuillez entrer un code promo");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const userId = localStorage.getItem("userId");
      const data = await validateCoupon(couponCode, getSubtotal(), userId);

      if (data.valid) {
        setAppliedCoupon(data.data);
        setCouponError("");
      }
    } catch (error) {
      setCouponError(error.response?.data?.error || "Code promo invalide");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCreateOrder = async () => {
    setCreatingOrder(true);
    setOrderError("");
    try {
      const coupons = appliedCoupon ? [appliedCoupon.code] : [];
      const result = await createOrder(coupons);

      if (result.success) {
        await clearCart();
        toast.success("Commande créée avec succès!");
        onClose();
        navigate("/orders/user");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création de la commande";
      setOrderError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreatingOrder(false);
    }
  };

  const getFinalTotal = () => {
    const total = getSubtotal();
    if (appliedCoupon) {
      return Math.max(0, total - appliedCoupon.discountAmount);
    }
    return total;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 backdrop-blur-xs z-40" onClick={onClose} />}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Panier ({getItemCount()} articles)</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Votre panier est vide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId._id} className="flex gap-3 p-3 border rounded-lg">
                    <LazyImage
                      src={
                        item.productId.primaryImage
                          ? `${BACKEND_BASE}${item.productId.primaryImage}`
                          : "/placeholder.jpg"
                      }
                      alt={item.productId.title}
                      className="w-16 h-16 object-cover rounded"
                      placeholderClassName="rounded"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.productId.title}</h4>
                      <p className="text-gray-600 text-sm">{item.productId.price} MAD</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId._id)}
                          className="ml-auto text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Checkout Section */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Coupon */}
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Code promo"
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    disabled={appliedCoupon}
                  />
                  <Button
                    onClick={
                      appliedCoupon
                        ? () => {
                            setAppliedCoupon(null);
                            setCouponCode("");
                          }
                        : handleValidateCoupon
                    }
                    disabled={validatingCoupon}
                    size="sm"
                    className={
                      appliedCoupon
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }
                  >
                    {appliedCoupon ? "Retirer" : "Appliquer"}
                  </Button>
                </div>
                {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-xs">
                    <Tag size={12} />
                    <span>Code appliqué: {appliedCoupon.code}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{getSubtotal().toFixed(2)} MAD</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Réduction</span>
                    <span>-{appliedCoupon.discountAmount.toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{getFinalTotal().toFixed(2)} MAD</span>
                </div>
              </div>

              {orderError && <p className="text-red-600 text-xs">{orderError}</p>}

              <Button
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {creatingOrder ? "Création..." : "Commander"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
