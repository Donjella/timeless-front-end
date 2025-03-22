import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../utils/api';
import WatchCatalog from '../components/WatchCatalog';
import { BrowserRouter } from 'react-router-dom';
import { getImagePlaceholder } from '../utils/imageUtils';





// need to mock router hooks
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useNavigate: () => vi.fn(),
    };
});
  

  // mock api
vi.mock('../utils/api', () => {
    return {
        api: {
            watches: {
              getAll: vi.fn(),
              update: vi.fn(),
              create: vi.fn(),
              delete: vi.fn(),
              filter: vi.fn(
                (watches, filters) => watches // mock that passes through watches
              ),
            },
            brands: {
              getAll: vi.fn(),
            },
          },
    }
});
  
  // mock imgUtils
  vi.mock('../utils/imageUtils', () => {
    return {
      getImagePlaceholder: vi.fn(() => 'placeholder-image-url'),
    };
  });
  
  // mock window.confirm
  global.confirm = vi.fn();
  
  // mock WatchModal component
  vi.mock('../components/WatchModal', () => {
    return {
      default: vi.fn(({ isOpen, onClose, watch, onSave }) => {
        if (!isOpen) return null;
        return (
          <div data-testid="watch-modal">
            <h2>Mock Watch Modal</h2>
            <p>Mode: {watch ? 'Edit' : 'Add'}</p>
            <button onClick={() => onClose()}>Close</button>
            <button 
              onClick={() => onSave({ 
                brand_id: 'brand1',
                model: 'Test Model',
                year: 2023,
                rental_day_price: 50,
                condition: 'New',
                quantity: 5,
                image_url: 'https://example.com/watch.jpg'
              }, watch ? 'edit' : 'add')}
            >
              Save
            </button>
          </div>
        );
      }),
    };
  });

// mock localStorage
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
  
  // mock sessionStorage
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
    Filter: () => <div data-testid="filter-icon">FilterIcon</div>,
    Search: () => <div data-testid="search-icon">SearchIcon</div>,
    AlertCircle: () => <div data-testid="alert-icon">AlertIcon</div>,
  }));
  
  describe('WatchCatalog Component', () => {
    // mock data for tests
    const mockWatches = [
      {
        _id: 'watch1',
        brand: { _id: 'brand1', brand_name: 'Rolex' },
        model: 'Submariner',
        year: 2022,
        rental_day_price: 100,
        condition: 'Excellent',
        quantity: 3,
        image_url: 'https://example.com/watch1.jpg',
      },
      {
        _id: 'watch2',
        brand: { _id: 'brand2', brand_name: 'Omega' },
        model: 'Speedmaster',
        year: 2021,
        rental_day_price: 75,
        condition: 'Good',
        quantity: 2,
        image_url: 'https://example.com/watch2.jpg',
      },
      {
        _id: 'watch3',
        brand: { _id: 'brand1', brand_name: 'Rolex' },
        model: 'Datejust',
        year: 2023,
        rental_day_price: 150,
        condition: 'New',
        quantity: 0, // out of stock
        image_url: 'https://example.com/watch3.jpg',
      },
    ];
  
    const mockBrands = [
      { _id: 'brand1', brand_name: 'Rolex' },
      { _id: 'brand2', brand_name: 'Omega' },
    ];
  
    // set default mock returns and clear mocks
    beforeEach(() => {
      vi.clearAllMocks();
      
      // setup default mocks
      api.watches.getAll.mockResolvedValue(mockWatches);
      api.brands.getAll.mockResolvedValue(mockBrands);
      api.watches.update.mockImplementation((id, data) => Promise.resolve({ ...data, _id: id }));
      api.watches.create.mockImplementation((data) => Promise.resolve({ ...data, _id: 'new-watch-id' }));
      api.watches.delete.mockResolvedValue({ success: true });
      
      // reset storage
      window.localStorage.clear();
      window.sessionStorage.clear();
      
      // default localStorage auth
      window.localStorage.setItem(
        'auth',
        JSON.stringify({
          token: 'mock-token',
          user: {
            _id: 'user1',
            role: 'user',
          },
        })
      );
      
      // reset window.confirm
      global.confirm.mockReset();
      global.confirm.mockReturnValue(true);
    });
  
    it('should render loading state correctly', async () => {
      // delay api res to check loading state
      api.watches.getAll.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(mockWatches), 100);
      }));
      
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // check for loading indicator
      expect(screen.getByText('Loading watches...')).toBeInTheDocument();
      
      // wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading watches...')).not.toBeInTheDocument();
      });
    });
  
    it('should show api connection error when data fetch fails', async () => {
      const errorMessage = 'API Connection Failed';
      api.watches.getAll.mockRejectedValue(new Error(errorMessage));
      
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // wait for error msg
      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText(`Failed to fetch data: ${errorMessage}`)).toBeInTheDocument();
      });
      
      // retry button should show
      const retryButton = screen.getByRole('button', { name: /retry connection/i });
      expect(retryButton).toBeInTheDocument();
    });
  
    it('should display watches correctly after successful fetch', async () => {
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // wait for watches to be displayed
      await waitFor(() => {
        expect(api.watches.getAll).toHaveBeenCalled();
        expect(api.brands.getAll).toHaveBeenCalled();
      });
      
      // check watch cards are displayed
      expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
      expect(screen.getByText('Omega Speedmaster')).toBeInTheDocument();
      expect(screen.getByText('Rolex Datejust')).toBeInTheDocument();
      
      // check price display
      expect(screen.getByText('$100/day')).toBeInTheDocument();
      expect(screen.getByText('$75/day')).toBeInTheDocument();
      expect(screen.getByText('$150/day')).toBeInTheDocument();
      
      // check out of stock badge
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
  
    it('should filter watches by search term', async () => {
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // wait for watches to be displayed
      await waitFor(() => {
        expect(api.watches.getAll).toHaveBeenCalled();
      });
      
      // enter search term
      const searchInput = screen.getByPlaceholderText('Search watches...');
        fireEvent.change(searchInput, { target: { value: 'submariner' } });

      // submariner should be visible, but not Speedmaster or Datejust
      expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
      expect(screen.queryByText('Omega Speedmaster')).not.toBeInTheDocument();
      expect(screen.queryByText('Rolex Datejust')).not.toBeInTheDocument();
      
      // clear search term
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // all watches should be visible again
      expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
      expect(screen.getByText('Omega Speedmaster')).toBeInTheDocument();
      expect(screen.getByText('Rolex Datejust')).toBeInTheDocument();
    });
    it('should filter watches by price range', async () => {
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // wait for watches to be displayed
      await waitFor(() => {
        expect(api.watches.getAll).toHaveBeenCalled();
      });
      
      // set min price to 100
      const priceSlider = screen.getByRole('slider');
      fireEvent.change(priceSlider, { target: { value: '100' } });
      
      // only watches with price >= 100 should be visible
      expect(screen.getByText('Rolex Submariner')).toBeInTheDocument(); // 100
      expect(screen.queryByText('Omega Speedmaster')).not.toBeInTheDocument(); // 75
      expect(screen.getByText('Rolex Datejust')).toBeInTheDocument(); // 150
    });
  
    it('should filter watches by condition', async () => {
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // wait for watches to be displayed
      await waitFor(() => {
        expect(api.watches.getAll).toHaveBeenCalled();
      });
      
      // set condition filter to "New"
      const conditionSelect = screen.getByRole('combobox');
      fireEvent.change(conditionSelect, { target: { value: 'New' } });
      
      // only "New" watches should be visible
      expect(screen.queryByText('Rolex Submariner')).not.toBeInTheDocument(); // Excellent
      expect(screen.queryByText('Omega Speedmaster')).not.toBeInTheDocument(); // Good
      expect(screen.getByText('Rolex Datejust')).toBeInTheDocument(); // New
    });
  
    it('should clear all filters when clear button is clicked', async () => {
      render(
        <BrowserRouter>
          <WatchCatalog />
        </BrowserRouter>
      );
      
      // wait for watches to be displayed
      await waitFor(() => {
        expect(api.watches.getAll).toHaveBeenCalled();
      });
      
      // apply multiple filters
      const searchInput = screen.getByPlaceholderText('Search watches...');
      fireEvent.change(searchInput, { target: { value: 'rolex' } });
      
      const priceSlider = screen.getByRole('slider');
      fireEvent.change(priceSlider, { target: { value: '100' } });
      
      // clear button should now be visible
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearButton).toBeInTheDocument();
      
      // click clear button
      fireEvent.click(clearButton);
      
      // all filters should be reset and all watches visible again
      expect(searchInput.value).toBe('');
      expect(priceSlider.value).toBe('0');
      
      // all watches should be visible
      expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
      expect(screen.getByText('Omega Speedmaster')).toBeInTheDocument();
      expect(screen.getByText('Rolex Datejust')).toBeInTheDocument();
    });
    
  });
