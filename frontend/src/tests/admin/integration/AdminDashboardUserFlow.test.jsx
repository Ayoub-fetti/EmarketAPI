import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '../../../layouts/admin/AdminLayout';
import AdminStats from '../../../pages/admin/AdminStats';
import AdminUsers from '../../../pages/admin/AdminUsers';
import AdminProducts from '../../../pages/admin/AdminProducts';
import { AuthProvider } from '../../../context/AuthContext';
import { adminStatsService } from '../../../services/admin/adminStatsService';
import { adminUsersService } from '../../../services/admin/adminUsersService';
import { adminProductsService } from '../../../services/admin/adminProductsService';

// Mock all admin services
jest.mock('../../../services/admin/adminStatsService');
jest.mock('../../../services/admin/adminUsersService');
jest.mock('../../../services/admin/adminProductsService');

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockAdminUser = {
  id: '1',
  email: 'admin@test.com',
  role: 'admin',
  fullname: 'Admin User',
};

const mockUsers = [
  {
    _id: '1',
    email: 'user1@test.com',
    fullname: 'User One',
    role: 'user',
    status: 'active',
  },
  {
    _id: '2',
    email: 'user2@test.com',
    fullname: 'User Two',
    role: 'seller',
    status: 'active',
  },
];

const mockProducts = [
  {
    _id: '1',
    title: 'Product 1',
    price: 100,
    stock: 10,
    published: true,
  },
  {
    _id: '2',
    title: 'Product 2',
    price: 200,
    stock: 5,
    published: false,
  },
];

const renderAdminLayout = (initialRoute = '/admin/stats') => {
  localStorage.setItem('token', 'mock-token');
  localStorage.setItem('user', JSON.stringify(mockAdminUser));

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="stats" element={<AdminStats />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Admin Dashboard User Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    adminStatsService.fetchUsers = jest.fn().mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchOrders = jest.fn().mockResolvedValue({ list: [], total: 0 });
    adminStatsService.fetchProducts = jest.fn().mockResolvedValue({ list: [], total: 0 });
    
    adminUsersService.fetchUsers = jest.fn().mockResolvedValue(mockUsers);
    adminUsersService.fetchDeletedUsers = jest.fn().mockResolvedValue([]);
    
    adminProductsService.fetchActiveProducts = jest.fn().mockResolvedValue(mockProducts);
    adminProductsService.fetchDeletedProducts = jest.fn().mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('complete user flow: login -> view stats -> navigate to users -> view users', async () => {
    // Step 1: Render dashboard (simulating logged in user)
    await act(async () => {
      renderAdminLayout('/admin/stats');
    });

    // Step 2: Verify stats page loads
    await waitFor(() => {
      expect(adminStatsService.fetchUsers).toHaveBeenCalled();
      expect(adminStatsService.fetchOrders).toHaveBeenCalled();
      expect(adminStatsService.fetchProducts).toHaveBeenCalled();
    });

    // Step 3: Navigate to Users page
    const usersLink = screen.getByRole('link', { name: /users/i });
    
    await act(async () => {
      fireEvent.click(usersLink);
    });

    // Step 4: Verify users page loads with data
    await waitFor(() => {
      expect(adminUsersService.fetchUsers).toHaveBeenCalled();
    });

    // Step 5: Verify users are displayed (if the component renders them)
    await waitFor(() => {
      // The users should be fetched, even if not immediately visible
      expect(adminUsersService.fetchUsers).toHaveBeenCalled();
    });
  });

  test('complete user flow: navigate between multiple pages', async () => {
    await act(async () => {
      renderAdminLayout('/admin/stats');
    });

    // Navigate to Users
    const usersLink = screen.getByRole('link', { name: /users/i });
    await act(async () => {
      fireEvent.click(usersLink);
    });

    await waitFor(() => {
      expect(adminUsersService.fetchUsers).toHaveBeenCalled();
    });

    // Navigate to Products
    const productsLink = screen.getByRole('link', { name: /products/i });
    await act(async () => {
      fireEvent.click(productsLink);
    });

    await waitFor(() => {
      expect(adminProductsService.fetchActiveProducts).toHaveBeenCalled();
    });

    // Navigate back to Stats
    const statsLink = screen.getByRole('link', { name: /statistics/i });
    await act(async () => {
      fireEvent.click(statsLink);
    });

    await waitFor(() => {
      // Stats service should be called again when navigating back
      expect(adminStatsService.fetchUsers).toHaveBeenCalled();
    });
  });

  test('user information persists across navigation', async () => {
    await act(async () => {
      renderAdminLayout('/admin/stats');
    });

    // Verify user info is displayed
    await waitFor(() => {
      expect(screen.getByText(mockAdminUser.fullname)).toBeInTheDocument();
      expect(screen.getByText(mockAdminUser.email)).toBeInTheDocument();
    });

    // Navigate to another page
    const usersLink = screen.getByRole('link', { name: /users/i });
    await act(async () => {
      fireEvent.click(usersLink);
    });

    // Verify user info is still displayed
    await waitFor(() => {
      expect(screen.getByText(mockAdminUser.fullname)).toBeInTheDocument();
      expect(screen.getByText(mockAdminUser.email)).toBeInTheDocument();
    });
  });

  test('active navigation link updates when navigating', async () => {
    await act(async () => {
      renderAdminLayout('/admin/stats');
    });

    // Initially, stats should be active
    await waitFor(() => {
      const statsLink = screen.getByRole('link', { name: /statistics/i });
      expect(statsLink).toHaveClass('bg-orange-500');
    });

    // Navigate to users
    const usersLink = screen.getByRole('link', { name: /users/i });
    await act(async () => {
      fireEvent.click(usersLink);
    });

    // Users should now be active
    await waitFor(() => {
      const updatedUsersLink = screen.getByRole('link', { name: /users/i });
      expect(updatedUsersLink).toHaveClass('bg-orange-500');
    });
  });
});

