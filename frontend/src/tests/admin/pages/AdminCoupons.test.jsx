import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminCoupons from '../../../pages/admin/AdminCoupons';
import { adminCouponsService } from '../../../services/admin/adminCouponsService';
import { AuthProvider } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('../../../services/admin/adminCouponsService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedAdminCoupons = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminCoupons />
    </AuthProvider>
  </BrowserRouter>
);

describe('AdminCoupons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    adminCouponsService.fetchAllCoupons.mockResolvedValue([]);

    render(<MockedAdminCoupons />);
    expect(screen.getByText(/loading coupons/i)).toBeInTheDocument();
  });

  test('renders coupons list after loading', async () => {
    const mockCoupons = [
      {
        _id: '1',
        code: 'DISCOUNT10',
        type: 'percentage',
        value: 10,
        status: 'active',
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        _id: '2',
        code: 'SAVE50',
        type: 'fixed',
        value: 50,
        status: 'active',
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    adminCouponsService.fetchAllCoupons.mockResolvedValue(mockCoupons);

    render(<MockedAdminCoupons />);

    await waitFor(() => {
      expect(screen.getByText(/coupons management/i)).toBeInTheDocument();
      expect(screen.getByText('DISCOUNT10')).toBeInTheDocument();
      expect(screen.getByText('SAVE50')).toBeInTheDocument();
    });
  });

  test('opens create coupon modal', async () => {
    adminCouponsService.fetchAllCoupons.mockResolvedValue([]);

    render(<MockedAdminCoupons />);

    await waitFor(() => {
      const createButton = screen.getByText(/create coupon/i);
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/create new coupon/i)).toBeInTheDocument();
    });
  });

  test('searches coupons by code', async () => {
    const mockCoupons = [
      {
        _id: '1',
        code: 'DISCOUNT10',
        type: 'percentage',
        value: 10,
        status: 'active',
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        _id: '2',
        code: 'SAVE50',
        type: 'fixed',
        value: 50,
        status: 'active',
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    adminCouponsService.fetchAllCoupons.mockResolvedValue(mockCoupons);

    render(<MockedAdminCoupons />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by code/i);
      fireEvent.change(searchInput, { target: { value: 'DISCOUNT' } });
    });

    await waitFor(() => {
      expect(screen.getByText('DISCOUNT10')).toBeInTheDocument();
      expect(screen.queryByText('SAVE50')).not.toBeInTheDocument();
    });
  });

  test('opens view details modal', async () => {
    const mockCoupon = {
      _id: '1',
      code: 'DISCOUNT10',
      type: 'percentage',
      value: 10,
      status: 'active',
      startDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
    };

    adminCouponsService.fetchAllCoupons.mockResolvedValue([mockCoupon]);
    adminCouponsService.fetchCouponById.mockResolvedValue(mockCoupon);

    render(<MockedAdminCoupons />);

    await waitFor(() => {
      const detailsButtons = screen.getAllByText(/details/i);
      fireEvent.click(detailsButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/coupon details/i)).toBeInTheDocument();
      expect(screen.getByText('DISCOUNT10')).toBeInTheDocument();
    });
  });
});

