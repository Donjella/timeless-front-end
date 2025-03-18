// src/utils/api.js

// Base URL for API requests
const API_BASE_URL = 'https://timeless-back-end.onrender.com';

// Helper function to get auth token from localStorage
const getToken = () => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  return auth.token;
};

// Helper function to create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
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
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Something went wrong'
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
        message: 'Network error. Please check your connection.'
      };
    }
  }
};

// API request functions
export const api = {
  // Auth endpoints
  auth: {
    register: (userData) => fetchWrapper('/api/users/register', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(userData)
    }),
    
    login: (credentials) => fetchWrapper('/api/users/login', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials)
    }),
    
    getProfile: () => fetchWrapper('/api/users/profile', {
      method: 'GET',
      headers: createHeaders()
    }),
    
    updateProfile: (userData) => fetchWrapper('/api/users/profile', {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(userData)
    })
  },
  
  // User management (admin)
  users: {
    getAll: () => fetchWrapper('/api/users', {
      method: 'GET',
      headers: createHeaders()
    }),
    
    getById: (id) => fetchWrapper(`/api/users/${id}`, {
      method: 'GET',
      headers: createHeaders()
    }),
    
    updateRole: (id, role) => fetchWrapper(`/api/users/role/${id}`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ role })
    }),
    
    delete: (id) => fetchWrapper(`/api/users/${id}`, {
      method: 'DELETE',
      headers: createHeaders()
    })
  }
  
  // Add other API endpoints as needed (watches, rentals, etc.)
};