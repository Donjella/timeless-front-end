// src/hooks/useAuthData.js
import { createContext, useContext } from 'react';

// Default auth state
export const defaultAuthData = {
  isAuthenticated: false,
  user: null,
  token: null
};

// Create context
export const AuthContext = createContext({
  authData: defaultAuthData,
  setAuthData: () => {},
  login: () => {},
  logout: () => {},
  isAdmin: () => false
});

// Hook to use the auth context
export const useAuthData = () => useContext(AuthContext);