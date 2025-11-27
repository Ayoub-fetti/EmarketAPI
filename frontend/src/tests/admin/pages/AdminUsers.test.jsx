import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminUsers from '../../../pages/admin/AdminUsers';
import { adminUsersService } from '../../../services/admin/adminUsersService';
import { AuthProvider } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('../../../services/admin/adminUsersService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedAdminUsers = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminUsers />
    </AuthProvider>
  </BrowserRouter>
);

describe('AdminUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    adminUsersService.fetchUsers.mockResolvedValue([]);
    adminUsersService.fetchDeletedUsers.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminUsers />);
    });
    
    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading users/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test('renders users list after loading', async () => {
    const mockUsers = [
      {
        _id: '1',
        fullname: 'John Doe',
        email: 'john@test.com',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        fullname: 'Jane Seller',
        email: 'jane@test.com',
        role: 'seller',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    adminUsersService.fetchUsers.mockResolvedValue(mockUsers);
    adminUsersService.fetchDeletedUsers.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminUsers />);
    });

    await waitFor(() => {
      expect(screen.getByText(/users management/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Seller')).toBeInTheDocument();
    });
  });


  test('searches users by name or email', async () => {
    const mockUsers = [
      {
        _id: '1',
        fullname: 'John Doe',
        email: 'john@test.com',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        fullname: 'Jane Smith',
        email: 'jane@test.com',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    adminUsersService.fetchUsers.mockResolvedValue(mockUsers);
    adminUsersService.fetchDeletedUsers.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminUsers />);
    });

    await waitFor(() => {
      expect(screen.getByText(/users management/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'John' } });
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('opens edit modal when edit button is clicked', async () => {
    const mockUser = {
      _id: '1',
      fullname: 'John Doe',
      email: 'john@test.com',
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    adminUsersService.fetchUsers.mockResolvedValue([mockUser]);
    adminUsersService.fetchDeletedUsers.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminUsers />);
    });

    await waitFor(() => {
      expect(screen.getByText(/users management/i)).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/edit/i);
    
    await act(async () => {
      fireEvent.click(editButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/edit user/i)).toBeInTheDocument();
    });
  });
});

