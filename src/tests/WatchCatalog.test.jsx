import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import WatchCatalog from '../components/WatchCatalog';
import { api } from '../utils/api';

// Mock API
vi.mock('../utils/api', () => ({
  api: {
    watches: {
      getAll: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    brands: {
      getAll: vi.fn(),
    },
    auth: {
      isAdmin: vi.fn(),
    },
  },
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock image placeholder utility
vi.mock('../utils/imageUtils', () => ({
  getImagePlaceholder: () => '/placeholder.jpg',
}));

describe('WatchCatalog Component', () => {
  // Sample data for tests
  const mockWatches = [
    {
      _id: 'watch1',
      model: 'Submariner',
      brand: { _id: 'brand1', brand_name: 'Rolex' },
      year: 2020,
      rental_day_price: 150,
      condition: 'Excellent',
      image_url: '/images/rolex-submariner.jpg',
      quantity: 3,
    },
    {
      _id: 'watch2',
      model: 'Speedmaster',
      brand: { _id: 'brand2', brand_name: 'Omega' },
      year: 2019,
      rental_day_price: 100,
      condition: 'Good',
      image_url: '/images/omega-speedmaster.jpg',
      quantity: 2,
    },
  ];

  const mockBrands = [
    { _id: 'brand1', brand_name: 'Rolex' },
    { _id: 'brand2', brand_name: 'Omega' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    api.watches.getAll.mockResolvedValue(mockWatches);
    api.brands.getAll.mockResolvedValue(mockBrands);

    // Clear localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should render the watch catalog with watches', async () => {
    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Check if watches are displayed
    expect(screen.getByText(/Rolex Submariner/i)).toBeInTheDocument();
    expect(screen.getByText(/Omega Speedmaster/i)).toBeInTheDocument();
  });

  it('should not show admin buttons for regular users', async () => {
    // Set up localStorage for regular user
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

    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Add New Watch button should not be visible for regular users
    expect(screen.queryByText('Add New Watch')).not.toBeInTheDocument();
  });

  it('should show admin buttons for admin users', async () => {
    // Set up localStorage for admin user
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: {
          _id: 'user1',
          role: 'admin',
        },
      })
    );

    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to be displayed
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Add New Watch button should be visible
    expect(screen.getByText('Add New Watch')).toBeInTheDocument();

    // Open watch details
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Admin actions should be visible
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should open watch details modal when view details is clicked', async () => {
    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Find and click View Details button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Check if modal was opened with the correct watch
    expect(screen.getByText(/Year:/i)).toBeInTheDocument();
    expect(screen.getByText(/Condition:/i)).toBeInTheDocument();
    expect(screen.getByText('Rent Now')).toBeInTheDocument();
  });

  it('should filter watches when a brand filter is applied', async () => {
    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Initially both watches should be visible
    expect(screen.getByText(/Rolex Submariner/i)).toBeInTheDocument();
    expect(screen.getByText(/Omega Speedmaster/i)).toBeInTheDocument();

    // Click the Rolex brand checkbox
    const brandCheckbox = screen.getByLabelText('Rolex');
    fireEvent.click(brandCheckbox);

    // After filtering, only Rolex watch should be visible
    expect(screen.getByText(/Rolex Submariner/i)).toBeInTheDocument();
    expect(screen.queryByText(/Omega Speedmaster/i)).not.toBeInTheDocument();
  });

  it('should navigate to checkout when rent now is clicked', async () => {
    // Set up localStorage for logged in user
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

    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Open watch details
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Click Rent Now
    const rentButton = screen.getByText('Rent Now');
    fireEvent.click(rentButton);

    // Check if navigation was triggered to checkout
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');

    // Check if sessionStorage was set with correct checkout item
    expect(sessionStorage.setItem).toHaveBeenCalled();
    const storedItems = JSON.parse(sessionStorage.setItem.mock.calls[0][1]);
    expect(storedItems[0].watchId).toBe('watch1');
  });

  it('should redirect to login when trying to rent while not logged in', async () => {
    // Ensure no auth in localStorage
    localStorage.clear();

    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Open watch details
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Click Rent Now
    const rentButton = screen.getByText('Rent Now');
    fireEvent.click(rentButton);

    // Check if navigation was triggered to login with redirect
    expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=/checkout');
  });

  it('should delete watch when admin clicks delete and confirms', async () => {
    // Set up localStorage for admin user
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: {
          _id: 'user1',
          role: 'admin',
        },
      })
    );

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    // Mock successful delete
    api.watches.delete.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    // Wait for watches to load
    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Open watch details
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Click Delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Confirm dialog should be shown
    expect(confirmSpy).toHaveBeenCalled();

    // API delete should be called
    await waitFor(() => {
      expect(api.watches.delete).toHaveBeenCalledWith('watch1');
    });

    // Modal should be closed
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();

    // Clean up
    confirmSpy.mockRestore();
  });
});
