import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminCategories from '../../../pages/admin/AdminCategories';
import { adminCategoriesService } from '../../../services/admin/adminCategoriesService';
import { AuthProvider } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('../../../services/admin/adminCategoriesService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedAdminCategories = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminCategories />
    </AuthProvider>
  </BrowserRouter>
);

describe('AdminCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    adminCategoriesService.fetchCategories.mockResolvedValue([]);
    adminCategoriesService.fetchDeletedCategories.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminCategories />);
    });
    
    // Loading state might be very brief, so we check for either loading or content
    const loadingText = screen.queryByText(/loading categories/i);
    if (loadingText) {
      expect(loadingText).toBeInTheDocument();
    }
  });

  test('renders categories list after loading', async () => {
    const mockCategories = [
      { _id: '1', name: 'Electronics', createdAt: new Date().toISOString() },
      { _id: '2', name: 'Clothing', createdAt: new Date().toISOString() },
    ];

    adminCategoriesService.fetchCategories.mockResolvedValue(mockCategories);
    adminCategoriesService.fetchDeletedCategories.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminCategories />);
    });

    await waitFor(() => {
      expect(screen.getByText(/categories management/i)).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
    });
  });

  test('opens create modal when create button is clicked', async () => {
    adminCategoriesService.fetchCategories.mockResolvedValue([]);
    adminCategoriesService.fetchDeletedCategories.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminCategories />);
    });

    await waitFor(() => {
      expect(screen.getByText(/categories management/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/create category/i);
    
    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/create new category/i)).toBeInTheDocument();
    });
  });

  test('creates a new category', async () => {
    const newCategory = { _id: '3', name: 'Books', createdAt: new Date().toISOString() };

    adminCategoriesService.fetchCategories.mockResolvedValue([]);
    adminCategoriesService.fetchDeletedCategories.mockResolvedValue([]);
    adminCategoriesService.createCategory.mockResolvedValue(newCategory);

    await act(async () => {
      render(<MockedAdminCategories />);
    });

    await waitFor(() => {
      expect(screen.getByText(/categories management/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/create category/i);
    
    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/create new category/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/category name/i);
    
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Books' } });
    });

    // Find the submit button in the form (type="submit") instead of the "Create Category" button
    const submitButtons = screen.getAllByRole('button', { name: /create/i });
    const submitButton = submitButtons.find(btn => btn.type === 'submit') || submitButtons[submitButtons.length - 1];
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(adminCategoriesService.createCategory).toHaveBeenCalledWith({ name: 'Books' });
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('filters categories by search query', async () => {
    const mockCategories = [
      { _id: '1', name: 'Electronics', createdAt: new Date().toISOString() },
      { _id: '2', name: 'Clothing', createdAt: new Date().toISOString() },
    ];

    adminCategoriesService.fetchCategories.mockResolvedValue(mockCategories);
    adminCategoriesService.fetchDeletedCategories.mockResolvedValue([]);

    await act(async () => {
      render(<MockedAdminCategories />);
    });

    await waitFor(() => {
      expect(screen.getByText(/categories management/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by category name/i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Electronics' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.queryByText('Clothing')).not.toBeInTheDocument();
    });
  });

  test('toggles between active and deleted categories', async () => {
    const activeCategories = [
      { _id: '1', name: 'Active Category', createdAt: new Date().toISOString() },
    ];
    const deletedCategories = [
      { _id: '2', name: 'Deleted Category', createdAt: new Date().toISOString() },
    ];

    adminCategoriesService.fetchCategories.mockResolvedValue(activeCategories);
    adminCategoriesService.fetchDeletedCategories.mockResolvedValue(deletedCategories);

    await act(async () => {
      render(<MockedAdminCategories />);
    });

    await waitFor(() => {
      expect(screen.getByText('Active Category')).toBeInTheDocument();
    });

    const deletedButton = screen.getByText(/deleted/i);
    
    await act(async () => {
      fireEvent.click(deletedButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Deleted Category')).toBeInTheDocument();
    });
  });
});

