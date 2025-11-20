import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminReviews from '../../../pages/admin/AdminReviews';
import { adminReviewsService } from '../../../services/admin/adminReviewsService';
import { AuthProvider } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('../../../services/admin/adminReviewsService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedAdminReviews = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminReviews />
    </AuthProvider>
  </BrowserRouter>
);

describe('AdminReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    adminReviewsService.fetchAllReviews.mockResolvedValue([]);

    render(<MockedAdminReviews />);
    expect(screen.getByText(/loading reviews/i)).toBeInTheDocument();
  });

  test('renders reviews list after loading', async () => {
    const mockReviews = [
      {
        _id: '1',
        user: { fullname: 'John Doe', email: 'john@test.com' },
        product: { title: 'Product 1' },
        rating: 5,
        comment: 'Great product!',
        status: 'approved',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        user: { fullname: 'Jane Smith', email: 'jane@test.com' },
        product: { title: 'Product 2' },
        rating: 3,
        comment: 'Average product',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    adminReviewsService.fetchAllReviews.mockResolvedValue(mockReviews);

    render(<MockedAdminReviews />);

    await waitFor(() => {
      expect(screen.getByText(/reviews moderation/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('filters reviews by status', async () => {
    const mockReviews = [
      {
        _id: '1',
        user: { fullname: 'John Doe' },
        product: { title: 'Product 1' },
        rating: 5,
        comment: 'Great!',
        status: 'approved',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        user: { fullname: 'Jane Smith' },
        product: { title: 'Product 2' },
        rating: 3,
        comment: 'Average',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    adminReviewsService.fetchAllReviews.mockResolvedValue(mockReviews);

    render(<MockedAdminReviews />);

    await waitFor(() => {
      const statusFilter = screen.getByLabelText(/filter by status/i);
      fireEvent.change(statusFilter, { target: { value: 'approved' } });
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('opens moderate modal', async () => {
    const mockReview = {
      _id: '1',
      user: { fullname: 'John Doe', email: 'john@test.com' },
      product: { title: 'Product 1' },
      rating: 5,
      comment: 'Great product!',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    adminReviewsService.fetchAllReviews.mockResolvedValue([mockReview]);

    render(<MockedAdminReviews />);

    await waitFor(() => {
      const moderateButtons = screen.getAllByText(/moderate/i);
      fireEvent.click(moderateButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/moderate review/i)).toBeInTheDocument();
    });
  });

  test('searches reviews by user or product', async () => {
    const mockReviews = [
      {
        _id: '1',
        user: { fullname: 'John Doe', email: 'john@test.com' },
        product: { title: 'Laptop' },
        rating: 5,
        comment: 'Great!',
        status: 'approved',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        user: { fullname: 'Jane Smith', email: 'jane@test.com' },
        product: { title: 'Phone' },
        rating: 3,
        comment: 'Average',
        status: 'approved',
        createdAt: new Date().toISOString(),
      },
    ];

    adminReviewsService.fetchAllReviews.mockResolvedValue(mockReviews);

    render(<MockedAdminReviews />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by user/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});

