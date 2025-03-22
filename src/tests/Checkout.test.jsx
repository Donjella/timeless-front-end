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

