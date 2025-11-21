import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../pages/Profile';
import { AuthProvider } from '../../context/AuthContext';
import { authService } from '../../services/authService';
jest.mock('../../services/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() }
    }
  }
}));
jest.mock('../../services/authService');

const mockUser = {
  id: '1',
  fullname: 'John Doe',
  email: 'john@example.com',
  avatar: '/uploads/avatar.jpg'
};

const MockedProfile = () => (
  <BrowserRouter>
    <AuthProvider>
      <Profile />
    </AuthProvider>
  </BrowserRouter>
);

describe('Profile Update Form', () => {
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Add this line
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('token', 'fake-token');
});


  afterEach(() => {
    localStorage.clear();
    console.error.mockRestore();
  });

  test('renders profile form with user data', async () => {
    render(<MockedProfile />);
    
    await waitFor(() => {
      const fullnameInput = screen.getByPlaceholderText(/enter your full name/i);
      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      
      expect(fullnameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
    });
  });

  test('updates form fields', async () => {
    render(<MockedProfile />);
    
    await waitFor(() => {
      const fullnameInput = screen.getByPlaceholderText(/enter your full name/i);
      fireEvent.change(fullnameInput, { target: { value: 'Jane Doe' } });
      expect(fullnameInput.value).toBe('Jane Doe');
    });
  });

  test('submits profile update successfully', async () => {
    authService.updateProfile.mockResolvedValue({
      data: {
        updatedUser: { ...mockUser, fullname: 'Jane Doe' }
      }
    });

    render(<MockedProfile />);
    
    await waitFor(() => {
      const fullnameInput = screen.getByPlaceholderText(/enter your full name/i);
      fireEvent.change(fullnameInput, { target: { value: 'Jane Doe' } });
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalled();
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error on failed update', async () => {
    authService.updateProfile.mockRejectedValue({
      response: { data: { message: 'Update failed' } }
    });

    render(<MockedProfile />);
    
    await waitFor(() => {
      const fullnameInput = screen.getByPlaceholderText(/enter your full name/i);
      fireEvent.change(fullnameInput, { target: { value: 'Jane Doe' } });
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });
});
