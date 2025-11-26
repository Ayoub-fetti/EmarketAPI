import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../../pages/Register';
import { AuthProvider } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';
import { toast } from 'react-toastify';
jest.mock('../../../services/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() }
    }
  }
}));
jest.mock('../../../services/authService');
jest.mock('react-toastify');

const MockedRegister = () => (
  <BrowserRouter>
    <AuthProvider>
      <Register />
    </AuthProvider>
  </BrowserRouter>
);

describe('Register Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', () => {
    render(<MockedRegister />);
    expect(screen.getByPlaceholderText(/enter your fullname/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('updates form fields', () => {
    render(<MockedRegister />);
    const fullnameInput = screen.getByPlaceholderText(/enter your fullname/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    fireEvent.change(fullnameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(fullnameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('submits registration successfully', async () => {
    authService.register.mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { id: '1', fullname: 'John Doe', email: 'john@example.com', role: 'user' }
      }
    });

    render(<MockedRegister />);
    
    fireEvent.change(screen.getByPlaceholderText(/enter your fullname/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Inscription réussie !');
    });
  });

  test('displays error on failed registration', async () => {
    authService.register.mockRejectedValue({
      response: { data: { errors: { email: 'Email already exists' } } }
    });

    render(<MockedRegister />);
    
    fireEvent.change(screen.getByPlaceholderText(/enter your fullname/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'existing@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erreur lors de l'inscription");
    });
  });
});
