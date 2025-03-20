// src/utils/api.js

// Base URL for API requests
const API_BASE_URL = 'https://timeless-back-end.onrender.com';

// Helper function to get auth token from localStorage
const getToken = () => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  return auth.token;
};

// Helper function to get user role from localStorage
const getUserRole = () => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  return auth.user?.role || null;
};

// Helper function to create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic fetch wrapper with error handling
const fetchWrapper = async (endpoint, options) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);
    
    // For 204 No Content responses
    if (response.status === 204) {
      return { success: true };
    }
    
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Something went wrong',
      };
    }

    return data;
  } catch (error) {
    // Check if it's a custom error or a network error
    if (error.status) {
      throw error;
    } else {
      throw {
        status: 0,
        message: 'Network error. Please check your connection.',
      };
    }
  }
};

// API request functions
export const api = {
  // Auth endpoints
  auth: {
    register: (userData) =>
      fetchWrapper('/api/users/register', {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify(userData),
      }),

    login: (credentials) =>
      fetchWrapper('/api/users/login', {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify(credentials),
      }),

    getProfile: () =>
      fetchWrapper('/api/users/profile', {
        method: 'GET',
        headers: createHeaders(),
      }),

    updateProfile: (userData) =>
      fetchWrapper('/api/users/profile', {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify(userData),
      }),
      
    logout: () => {
      localStorage.removeItem('auth');
    },
    
    isAdmin: () => {
      return getUserRole() === 'admin';
    },
    
    isAuthenticated: () => {
      return !!getToken();
    }
  },

  // User management (admin)
  users: {
    getAll: () =>
      fetchWrapper('/api/users', {
        method: 'GET',
        headers: createHeaders(),
      }),

    getById: (id) =>
      fetchWrapper(`/api/users/${id}`, {
        method: 'GET',
        headers: createHeaders(),
      }),

    updateRole: (id, role) =>
      fetchWrapper(`/api/users/role/${id}`, {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify({ role }),
      }),

    delete: (id) =>
      fetchWrapper(`/api/users/${id}`, {
        method: 'DELETE',
        headers: createHeaders(),
      }),
  },

  // Watch endpoints
  watches: {
    getAll: () =>
      fetchWrapper('/api/watches', {
        method: 'GET',
        headers: createHeaders(false), // Public endpoint
      }),

    getById: (id) =>
      fetchWrapper(`/api/watches/${id}`, {
        method: 'GET',
        headers: createHeaders(false), // Public endpoint
      }),

    create: (watchData) =>
      fetchWrapper('/api/watches', {
        method: 'POST',
        headers: createHeaders(), // Admin only
        body: JSON.stringify({
          ...watchData,
          brandId: watchData.brand_id // Map to the expected backend field name
        }),
      }),

    update: (id, watchData) =>
      fetchWrapper(`/api/watches/${id}`, {
        method: 'PUT',
        headers: createHeaders(), // Admin only
        body: JSON.stringify({
          ...watchData,
          brandId: watchData.brand_id // Map to the expected backend field name
        }),
      }),

    delete: (id) =>
      fetchWrapper(`/api/watches/${id}`, {
        method: 'DELETE',
        headers: createHeaders(), // Admin only
      }),
      
    // Filter watches (client-side)
    filter: (watches, filters) => {
      return watches.filter(watch => {
        // Search term filter
        if (filters.searchTerm && !watch.model.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
            !watch.brand.brand_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return false;
        }
        
        // Brand filter
        if (filters.brandIds && filters.brandIds.length > 0 && !filters.brandIds.includes(watch.brand._id)) {
          return false;
        }
        
        // Price range filter
        if (filters.minPrice !== undefined && watch.rental_day_price < filters.minPrice) {
          return false;
        }
        
        // Condition filter
        if (filters.condition && filters.condition !== 'Any' && watch.condition !== filters.condition) {
          return false;
        }
        
        return true;
      });
    }
  },

  // Brand endpoints
  brands: {
    getAll: () =>
      fetchWrapper('/api/brands', {
        method: 'GET',
        headers: createHeaders(false), // Public endpoint
      }),

    getById: (id) =>
      fetchWrapper(`/api/brands/${id}`, {
        method: 'GET',
        headers: createHeaders(false), // Public endpoint
      }),

    create: (brandData) =>
      fetchWrapper('/api/brands', {
        method: 'POST',
        headers: createHeaders(), // Admin only
        body: JSON.stringify({
          brand_name: brandData.brand_name
        }),
      }),

    update: (id, brandData) =>
      fetchWrapper(`/api/brands/${id}`, {
        method: 'PUT',
        headers: createHeaders(), // Admin only
        body: JSON.stringify(brandData),
      }),

    delete: (id) =>
      fetchWrapper(`/api/brands/${id}`, {
        method: 'DELETE',
        headers: createHeaders(), // Admin only
      }),
  },

  // Rental endpoints
  rentals: {
    getAll: () =>
      fetchWrapper('/api/rentals', {
        method: 'GET',
        headers: createHeaders(), // Admin only
      }),

    getMyRentals: () =>
      fetchWrapper('/api/rentals/my-rentals', {
        method: 'GET',
        headers: createHeaders(),
      }),

    getById: (id) =>
      fetchWrapper(`/api/rentals/${id}`, {
        method: 'GET',
        headers: createHeaders(),
      }),

    create: (rentalData) =>
      fetchWrapper('/api/rentals', {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          watch_id: rentalData.watch_id,
          rental_days: rentalData.rental_days,
          collection_mode: rentalData.collection_mode || 'Pickup'
        }),
      }),

    updateStatus: (id, status) =>
      fetchWrapper(`/api/rentals/${id}/status`, {
        method: 'PATCH',
        headers: createHeaders(), // Admin only
        body: JSON.stringify({ rental_status: status }),
      }),

    cancelRental: (id) =>
      fetchWrapper(`/api/rentals/${id}/cancel`, {
        method: 'PATCH',
        headers: createHeaders(),
      }),
  },
  
  // Utils for handling errors and loading states
  utils: {
    // Format error message for display
    formatErrorMessage: (error) => {
      if (typeof error === 'string') return error;
      
      if (error.message) return error.message;
      
      if (error.status === 401) return 'You must be logged in to perform this action.';
      if (error.status === 403) return 'You do not have permission to perform this action.';
      if (error.status === 404) return 'The requested resource was not found.';
      
      return 'An unexpected error occurred. Please try again.';
    }
  }
};