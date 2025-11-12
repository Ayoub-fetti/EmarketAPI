import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Button from "./Button";

const Cart = () => {
  const {
    items,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    TAX_RATE,
  } = useCart();

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
                <p className="text-gray-600">{item.productId.price}€</p>
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
                  {(item.productId.price * item.quantity).toFixed(2)}€
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

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{getSubtotal().toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({TAX_RATE * 100}%)</span>
              <span>{getTax().toFixed(2)}€</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{getTotal().toFixed(2)}€</span>
            </div>
          </div>

          <Button 
          className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700">
            Commander
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
