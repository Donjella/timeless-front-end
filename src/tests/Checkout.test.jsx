import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import Checkout from '../components/Checkout';
import { api } from '../utils/api';
import { getImagePlaceholder } from '../utils/imageUtils';

// mock router 
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
        create: vi.fn(),
        getById: vi.fn(),
      },
      payments: {
        create: vi.fn(),
      },
    },
  };
});

// mock imgUtils
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
          street_address: '123 Main St',
          suburb: 'Downtown',
          state: 'CA',
          postcode: '94101',
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

const sessionStorageMock = (() => {
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

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// mock Lucide icons
vi.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">CalendarIcon</div>,
  CreditCard: () => <div data-testid="credit-card-icon">CreditCardIcon</div>,
  ShoppingBag: () => <div data-testid="shopping-bag-icon">ShoppingBagIcon</div>,
  Check: () => <div data-testid="check-icon">CheckIcon</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDownIcon</div>,
  ChevronUp: () => <div data-testid="chevron-up-icon">ChevronUpIcon</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangleIcon</div>,
  X: () => <div data-testid="x-icon">XIcon</div>,
}));


const originalDispatchEvent = window.dispatchEvent;
window.dispatchEvent = vi.fn();

describe('Checkout Component', () => {
    // mock data
    const mockWatchItem = {
      watchId: 'watch1',
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
    };
  
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
  
    // reset mock clear storage
    beforeEach(() => {
      vi.clearAllMocks();
      window.localStorage.clear();
      window.sessionStorage.clear();
      

      vi.mocked(useLocation).mockReturnValue({
        pathname: '/checkout',
        search: '',
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
      
      sessionStorage.setItem(
        'checkoutItems',
        JSON.stringify([mockWatchItem])
      );
  
      // default api mock
      api.rentals.create.mockResolvedValue({
        _id: 'rental1',
        watch: mockWatchItem.watch,
        rental_start_date: '2023-01-01T00:00:00.000Z',
        rental_end_date: '2023-01-08T00:00:00.000Z',
        total_rental_price: 700,
      });
      
      api.rentals.getById.mockResolvedValue(mockRental);
      
      api.payments.create.mockResolvedValue({
        _id: 'payment1',
        rental_id: 'rental1',
        amount: 700,
        payment_method: 'Credit Card',
        payment_status: 'Completed',
      });
    });
  
    afterAll(() => {
      window.dispatchEvent = originalDispatchEvent;
    });
    
    // 
    it('should redirect unauthenticated users to login page', () => {
      // clear auth data
      localStorage.clear();
      
      const navigateMock = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(navigateMock);
      
      render(
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      );
      
      expect(navigateMock).toHaveBeenCalledWith('/login?redirect=/checkout');
    });
    
   
    it('should load checkout items and display product information', async () => {
      render(
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
        expect(screen.getByText(/\$100\/day/)).toBeInTheDocument();
        expect(screen.getByText(/7 days x/)).toBeInTheDocument();
      });
    });
    
    
    it('should update rental dates and recalculate total price', async () => {
      render(
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
      });
      
      // date inputs
      const startDateInput = screen.getByLabelText('Start Date:');
      const endDateInput = screen.getByLabelText('End Date:');
      
      // changing rental dates
      fireEvent.change(startDateInput, { target: { value: '2023-05-01' } });
      fireEvent.change(endDateInput, { target: { value: '2023-05-11' } });
      
      // New duration 10 days
      await waitFor(() => {
        expect(screen.getByText(/10 days x/)).toBeInTheDocument();
        // Total 10 * $100 = $1000
        expect(screen.getByText('$1000.00')).toBeInTheDocument();
      });
    });
    
    it('should handle direct rental mode for existing rental', async () => {
        vi.mocked(useLocation).mockReturnValue({
        pathname: '/checkout',
        search: '?rental=rental1',
        hash: '',
        state: null,
        });
        
        render(
        <BrowserRouter>
            <Checkout />
        </BrowserRouter>
        );
        
        await waitFor(() => {
        expect(api.rentals.getById).toHaveBeenCalledWith('rental1');
        expect(screen.getByText('Complete Payment')).toBeInTheDocument();
        
        // dates shouldn't be editable
        const dateInputs = screen.queryAllByRole('date');
        expect(dateInputs.length).toBe(0);
        });
    });
    
    
    it('should validate credit card form with proper errors', async () => {
        render(
        <BrowserRouter>
            <Checkout />
        </BrowserRouter>
        );
        
        await waitFor(() => {
        expect(screen.getByText('Payment Method')).toBeInTheDocument();
        });
        
        // Try submit with empty form
        const payButton = screen.getByRole('button', { name: /Pay/ });
        fireEvent.click(payButton);
        
        // show validation errors
        await waitFor(() => {
        expect(screen.getByText('Please enter a valid card number')).toBeInTheDocument();
        expect(screen.getByText('Please enter the cardholder name')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid expiry date (MM/YY)')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid CVV')).toBeInTheDocument();
        });
        
        // Fill form with valid data
        fireEvent.change(screen.getByLabelText('Card Number'), { target: { value: '4111 1111 1111 1111' } });
        fireEvent.change(screen.getByLabelText('Cardholder Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Expiry Date'), { target: { value: '12/25' } });
        fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
        
        // Try submit again
        fireEvent.click(payButton);
        
        // Should not show validation errors 
        await waitFor(() => {
        expect(screen.queryByText('Please enter a valid card number')).not.toBeInTheDocument();
        });
    });
    
 
    it('should detect expired credit cards', async () => {
        render(
        <BrowserRouter>
            <Checkout />
        </BrowserRouter>
        );
        
        await waitFor(() => {
        expect(screen.getByText('Payment Method')).toBeInTheDocument();
        });
        
        // form with expired card
        fireEvent.change(screen.getByLabelText('Card Number'), { target: { value: '4111 1111 1111 1111' } });
        fireEvent.change(screen.getByLabelText('Cardholder Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Expiry Date'), { target: { value: '01/20' } }); 
        fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
        
        // Try submit
        const payButton = screen.getByRole('button', { name: /Pay/ });
        fireEvent.click(payButton);
        
        // show expired card error
        await waitFor(() => {
        expect(screen.getByText('Card has expired')).toBeInTheDocument();
        });
    });

});