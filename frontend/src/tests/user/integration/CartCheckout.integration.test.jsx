import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { CartProvider } from '../../../context/CartContext';
import Cart from '../../../components/tools/Cart';
import * as cartService from '../../../services/cartService';
import * as orderService from '../../../services/orderService';

jest.mock('../../../services/cartService');
jest.mock('../../../services/orderService');
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

const mockProduct = {
  _id: 'prod1',
  title: 'Test Product',
  price: 100,
  primaryImage: '/test.jpg',
  stock: 10
};

const renderWithCart = (cartItems = []) => {
  cartService.getCart.mockResolvedValue({
    success: true,
    data: { items: cartItems }
  });

  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <Cart isOpen={true} onClose={jest.fn()} />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Cart & Checkout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Add product to cart - empty cart displays correctly', async () => {
    renderWithCart([]);

    await waitFor(() => {
      expect(screen.getByText(/votre panier est vide/i)).toBeInTheDocument();
    });
  });

  test('Update quantity in cart - service called correctly', async () => {
    cartService.updateQuantity.mockResolvedValue({ success: true });
    
    renderWithCart([{ productId: mockProduct, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const plusButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg.lucide-plus')
    );
    
    fireEvent.click(plusButton);
    
    await waitFor(() => {
      expect(cartService.updateQuantity).toHaveBeenCalledWith('prod1', 2);
    });
  });

  test('Remove product from cart - service called correctly', async () => {
    cartService.removeFromCart.mockResolvedValue({ success: true });
    
    renderWithCart([{ productId: mockProduct, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg.lucide-trash2')
    );
    
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(cartService.removeFromCart).toHaveBeenCalledWith('prod1');
    });
  });

  test('Checkout → create order - service called correctly', async () => {
    orderService.createOrder.mockResolvedValue({ success: true });
    cartService.clearCart.mockResolvedValue({ success: true });
    
    renderWithCart([{ productId: mockProduct, quantity: 2 }]);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByRole('button', { name: /commander/i });
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(orderService.createOrder).toHaveBeenCalled();
    });
  });
});
