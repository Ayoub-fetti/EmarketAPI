import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart, Tag } from "lucide-react";
import Button from "./Button";
import { validateCoupon } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    items,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCart();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

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
      navigate("/orders/user");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message ||
      "Erreurs lors de la creation de la commande";
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

  if (loading) return <div className="p-4">Chargement...</div>;

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Panier ({getItemCount()} articles)
        </h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 flex items-center gap-2"
        >
          <Trash2 size={16} />
          Vider
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId._id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <img
                src={
                  item.productId.primaryImage
                    ? `http://localhost:3000${item.productId.primaryImage}`
                    : "/placeholder.jpg"
                }
                alt={item.productId.title}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                }}
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.productId.title}</h3>
                <p className="text-gray-600">{item.productId.price} MAD</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId._id, item.quantity - 1)
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId._id, item.quantity + 1)
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {(item.productId.price * item.quantity).toFixed(2)} MAD
                </p>
                <button
                  onClick={() => removeFromCart(item.productId._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Résumé</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Code promo</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="PROMO2024"
                className="flex-1 px-3 py-2 border rounded-lg"
                disabled={appliedCoupon}
              />
              {!appliedCoupon ? (
                <Button
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  {validatingCoupon ? "..." : "Appliquer"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Retirer
                </Button>
              )}
            </div>
            {couponError && (
              <p className="text-red-600 text-sm mt-1">{couponError}</p>
            )}
            {appliedCoupon && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                <Tag size={16} />
                <span>Code appliqué: {appliedCoupon.code}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{getSubtotal().toFixed(2)} MAD</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{appliedCoupon.discountAmount.toFixed(2)} MAD</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{getFinalTotal().toFixed(2)} MAD</span>
            </div>
          </div>

          {orderError && (
            <p className="text-red-600 text-sm mb-2">{orderError}</p>
          )}
          <Button
            onClick={handleCreateOrder}
            disabled={creatingOrder}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
          >
            {creatingOrder ? "Création..." : "Commander"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
