import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import SimplifiedCheckout from '../components/SimplifiedCheckout';
import { api } from '../utils/api';
import { getImagePlaceholder } from '../utils/imageUtils';

// mock router hooks
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

// mock api
vi.mock('../utils/api', () => {
  return {
    api: {
      rentals: {
        getById: vi.fn(),
      },
      payments: {
        create: vi.fn(),
      },
    },
  };
});

// mock img utils
vi.mock('../utils/imageUtils', () => {
  return {
    getImagePlaceholder: vi.fn(() => 'placeholder-image-url'),
  };
});

// mock AuthData
vi.mock('../hooks/useAuthData', () => {
  return {
    useAuthData: vi.fn(() => ({
      authData: {
        isAuthenticated: true,
        user: {
          _id: 'user1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone_number: '123-456-7890',
          role: 'user',
        },
      },
    })),
  };
});

// mock storage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// mock methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// mock icons
vi.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">CalendarIcon</div>,
  CreditCard: () => <div data-testid="credit-card-icon">CreditCardIcon</div>,
  Check: () => <div data-testid="check-icon">CheckIcon</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangleIcon</div>,
  X: () => <div data-testid="x-icon">XIcon</div>,
}));

describe('SimplifiedCheckout Component', () => {
  // mock data 
  const mockRental = {
    _id: 'rental1',
    watch: {
      _id: 'watch1',
      brand: { _id: 'brand1', brand_name: 'Rolex' },
      model: 'Submariner',
      year: 2022,
      rental_day_price: 100,
      condition: 'Excellent',
      quantity: 3,
      image_url: 'https://example.com/watch1.jpg',
    },
    rental_start_date: '2023-01-01T00:00:00.000Z',
    rental_end_date: '2023-01-08T00:00:00.000Z',
    total_rental_price: 700,
    isPaid: false,
  };

  // reset mocks
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    
    
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/checkout/simple',
      search: '?rental=rental1',
      hash: '',
      state: null,
    });
    
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    
    // setup storage data 
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: {
          _id: 'user1',
          role: 'user',
        },
      })
    );
    
    // default api mock
    api.rentals.getById.mockResolvedValue(mockRental);
    
    api.payments.create.mockResolvedValue({
      _id: 'payment1',
      rental_id: 'rental1',
      amount: 700,
      payment_method: 'Credit Card',
      payment_status: 'Completed',
    });
  });


  it('should redirect unauthenticated users to login page', () => {
    
    localStorage.clear();
    
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    expect(navigateMock).toHaveBeenCalledWith('/login?redirect=/checkout');
  });
  
  
  it('should fetch and display rental information correctly', async () => {
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(api.rentals.getById).toHaveBeenCalledWith('rental1');
    });
    
    // Should display the rental details
    await waitFor(() => {
      expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
      expect(screen.getByText('$700.00')).toBeInTheDocument();
      expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
      expect(screen.getByText('Jan 8, 2023')).toBeInTheDocument();
      expect(screen.getByText('7 days')).toBeInTheDocument();
    });
  });
  
  
  it('should show error when rental ID is missing from URL', async () => {
   
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/checkout/simple',
      search: '',
      hash: '',
      state: null,
    });
    
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(screen.getByText('No rental specified')).toBeInTheDocument();
    });
  });
  
 
  it('should redirect to rentals page if rental is already paid', async () => {
    
    api.rentals.getById.mockResolvedValue({
      ...mockRental,
      isPaid: true,
    });
    
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/account/rentals');
    });
  });
  
  
  it('should validate credit card form with proper errors', async () => {
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
  
    const payButton = screen.getByRole('button', { name: /Pay/ });
    fireEvent.click(payButton);
    
   
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid card number')).toBeInTheDocument();
      expect(screen.getByText('Please enter the cardholder name')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid expiry date (MM/YY)')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid CVV')).toBeInTheDocument();
    });
    
    
    fireEvent.change(screen.getByLabelText('Card Number'), { target: { value: '4111 1111 1111 1111' } });
    fireEvent.change(screen.getByLabelText('Cardholder Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Expiry Date'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
    
   
    fireEvent.click(payButton);
    
   
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid card number')).not.toBeInTheDocument();
    });
  });
  
  
  it('should process payment successfully and show confirmation', async () => {
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    
    fireEvent.change(screen.getByLabelText('Card Number'), { target: { value: '4111 1111 1111 1111' } });
    fireEvent.change(screen.getByLabelText('Cardholder Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Expiry Date'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
    
   
    const payButton = screen.getByRole('button', { name: /Pay \$700.00/ });
    fireEvent.click(payButton);
    
    
    await waitFor(() => {
      expect(api.payments.create).toHaveBeenCalledWith({
        rental_id: 'rental1',
        amount: 700,
        payment_method: 'Credit Card',
      });
    });
    
  
    await waitFor(() => {
      expect(screen.getByText('Payment Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('A confirmation has been sent to your email.')).toBeInTheDocument();
    });
  });
  
 
  it('should handle payment processing errors properly', async () => {
   
    api.payments.create.mockRejectedValue(new Error('Payment processing failed'));
    
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    
    fireEvent.change(screen.getByLabelText('Card Number'), { target: { value: '4111 1111 1111 1111' } });
    fireEvent.change(screen.getByLabelText('Cardholder Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Expiry Date'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
    
    
    const payButton = screen.getByRole('button', { name: /Pay/ });
    fireEvent.click(payButton);
    
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to process your payment/)).toBeInTheDocument();
    });
  });
  
 
  it('should handle PayPal payment method correctly', async () => {
    render(
      <BrowserRouter>
        <SimplifiedCheckout />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
 
    const paypalRadio = screen.getByLabelText('PayPal');
    fireEvent.click(paypalRadio);
    

    expect(screen.queryByLabelText('Card Number')).not.toBeInTheDocument();
    expect(screen.getByText(/You will be redirected to PayPal/)).toBeInTheDocument();
    
    
    const payButton = screen.getByRole('button', { name: /Pay/ });
    fireEvent.click(payButton);
    
  
    await waitFor(() => {
      expect(api.payments.create).toHaveBeenCalledWith({
        rental_id: 'rental1',
        amount: 700,
        payment_method: 'PayPal',
      });
    });
  });
});