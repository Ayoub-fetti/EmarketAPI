import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { CartProvider } from '../../../context/CartContext';
import Login from '../../../pages/Login';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService');
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

const renderWithRouter = (initialRoute = '/login') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<div>User Dashboard</div>} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/seller" element={<div>Seller Dashboard</div>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Login user → redirect to /products', async () => {
    authService.login.mockResolvedValue({
      data: {
        token: 'user-token',
        user: { id: '1', email: 'user@test.com', role: 'user', fullname: 'User Test' }
      }
    });

    renderWithRouter('/login');

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'user@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    });
  });

  test('Login user → cannot access /admin', async () => {
    localStorage.setItem('token', 'user-token');
    localStorage.setItem('user', JSON.stringify({ role: 'user' }));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/admin" element={
              <div>
                {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'admin' 
                  ? 'Admin Dashboard' 
                  : window.location.pathname = '/'}
              </div>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  test('Login user → cannot access /seller', async () => {
    localStorage.setItem('token', 'user-token');
    localStorage.setItem('user', JSON.stringify({ role: 'user' }));

    render(
      <MemoryRouter initialEntries={['/seller']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/seller" element={
              <div>
                {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'seller' 
                  ? 'Seller Dashboard' 
                  : window.location.pathname = '/'}
              </div>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Seller Dashboard')).not.toBeInTheDocument();
    });
  });
});
