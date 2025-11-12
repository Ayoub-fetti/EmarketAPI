import { createContext, useContext, useState, useEffect } from 'react';
import * as cartService from '../services/cartService.js';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const TAX_RATE = 0.2;

  useEffect(() => {
    loadCart();
  }, [user]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loading]);

  const loadCart = async () => {
    try {
      setLoading(true);
      
      // Charger depuis localStorage d'abord
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }

      // Synchroniser avec le serveur
      const response = await cartService.getCart();
      if (response.success && response.data.items) {
        setItems(response.data.items);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erreur panier:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      await cartService.addToCart(product._id, quantity);
      
      const existingItem = items.find(item => item.productId._id === product._id);
      
      if (existingItem) {
        setItems(items.map(item =>
          item.productId._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setItems([...items, { productId: product, quantity }]);
      }
      
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
      console.error('Erreur lors de l\'ajout', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    try {
      await cartService.updateQuantity(productId, quantity);
      
      setItems(items.map(item =>
        item.productId._id === productId
          ? { ...item, quantity }
          : item
      ));
    } catch (error) {
      toast.error('Erreur mise à jour');
      console.error('Erreur mise à jour',error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      
      setItems(items.filter(item => item.productId._id !== productId));
      
      toast.success('Produit retiré');
    } catch (error) {
      toast.error('Erreur suppression');
      console.error('Erreur suppression',error);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setItems([]);
      toast.success('Panier vidé');
    } catch (error) {
      toast.error('Erreur vidage panier');
      console.error('Erreur vidage panier', error);
    }
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => 
      total + (item.productId.price * item.quantity), 0
    );
  };

  const getTax = () => getSubtotal() * TAX_RATE;
  const getTotal = () => getSubtotal() + getTax();
  const getItemCount = () => items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getSubtotal,
      getTax,
      getTotal,
      getItemCount,
      TAX_RATE,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
