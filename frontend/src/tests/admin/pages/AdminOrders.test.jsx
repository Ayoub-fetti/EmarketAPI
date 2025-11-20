import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminOrders from '../../../pages/admin/AdminOrders';
import { adminOrdersService } from '../../../services/admin/adminOrdersService';
import { AuthProvider } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('../../../services/admin/adminOrdersService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedAdminOrders = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminOrders />
    </AuthProvider>
  </BrowserRouter>
);

describe('AdminOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    adminOrdersService.fetchAllOrders.mockResolvedValue([]);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    render(<MockedAdminOrders />);
    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
  });

  test('renders orders list after loading', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        userId: { fullname: 'John Doe', email: 'john@test.com' },
        finalAmount: 100,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'order2',
        userId: { fullname: 'Jane Smith', email: 'jane@test.com' },
        finalAmount: 200,
        status: 'delivered',
        createdAt: new Date().toISOString(),
      },
    ];

    adminOrdersService.fetchAllOrders.mockResolvedValue(mockOrders);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    render(<MockedAdminOrders />);

    await waitFor(() => {
      expect(screen.getByText(/orders management/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('filters orders by status', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        userId: { fullname: 'John Doe' },
        finalAmount: 100,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'order2',
        userId: { fullname: 'Jane Smith' },
        finalAmount: 200,
        status: 'delivered',
        createdAt: new Date().toISOString(),
      },
    ];

    adminOrdersService.fetchAllOrders.mockResolvedValue(mockOrders);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    render(<MockedAdminOrders />);

    await waitFor(() => {
      const statusFilter = screen.getByLabelText(/filter by status/i);
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('opens order details modal', async () => {
    const mockOrder = {
      _id: 'order1',
      userId: { fullname: 'John Doe', email: 'john@test.com' },
      finalAmount: 100,
      status: 'pending',
      items: [],
      createdAt: new Date().toISOString(),
    };

    adminOrdersService.fetchAllOrders.mockResolvedValue([mockOrder]);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    render(<MockedAdminOrders />);

    await waitFor(() => {
      const detailsButtons = screen.getAllByText(/details/i);
      fireEvent.click(detailsButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/order details/i)).toBeInTheDocument();
    });
  });

  test('searches orders by customer name', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        userId: { fullname: 'John Doe', email: 'john@test.com' },
        finalAmount: 100,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'order2',
        userId: { fullname: 'Jane Smith', email: 'jane@test.com' },
        finalAmount: 200,
        status: 'delivered',
        createdAt: new Date().toISOString(),
      },
    ];

    adminOrdersService.fetchAllOrders.mockResolvedValue(mockOrders);
    adminOrdersService.fetchDeletedOrders.mockResolvedValue([]);

    render(<MockedAdminOrders />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by order id/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});

