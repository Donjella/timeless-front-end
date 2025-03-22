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