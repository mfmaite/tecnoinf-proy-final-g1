import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../(auth)/login';

// Mock fetch
global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders login form with email and password inputs', () => {
    render(<Login />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('updates input values on user input', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('submits form with correct payload', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mock-token' }),
    });
    
    render(<Login />);
    
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });
  });

  test('displays error message on failed login', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });
    
    render(<Login />);
    
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials|login failed/i)).toBeInTheDocument();
    });
  });

  test('disables button while submitting', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ token: 'mock-token' }),
      }), 500))
    );
    
    render(<Login />);
    
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    
    const button = screen.getByRole('button', { name: /login/i });
    await user.click(button);
    
    expect(button).toBeDisabled();
  });
});