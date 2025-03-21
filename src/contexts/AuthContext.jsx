import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Token expiration checker
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Token has format: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);

    // Check if expiration time is past current time
    return exp * 1000 < Date.now();
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true; // Assume expired on error
  }
};

// Default auth state
const defaultAuthData = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// Create context
export const AuthContext = createContext({
  authData: defaultAuthData,
  setAuthData: () => {},
  login: () => {},
  logout: () => {},
  isAdmin: () => false,
  isTokenValid: () => false,
});

// Provider component
export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(defaultAuthData);

  // Load auth data from localStorage on initial load
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);

        // Check if token is expired
        if (parsedAuth.token && isTokenExpired(parsedAuth.token)) {
          console.warn('Token expired, logging out');
          localStorage.removeItem('auth');
          setAuthData(defaultAuthData);
        } else {
          setAuthData(parsedAuth);
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // Update localStorage when auth data changes
  useEffect(() => {
    if (authData.isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authData]);

  // Login function
  const login = (userData) => {
    const authPayload = {
      isAuthenticated: true,
      user: {
        id: userData._id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone_number: userData.phone_number,
        role: userData.role,
      },
      token: userData.token,
    };

    setAuthData(authPayload);
    return true;
  };

  // Logout function
  const logout = () => {
    setAuthData(defaultAuthData);
  };

  // Check if user is an admin
  const isAdmin = () => {
    return authData.user?.role === 'admin';
  };

  // Check if token is valid
  const isTokenValid = () => {
    return authData.token && !isTokenExpired(authData.token);
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        setAuthData,
        login,
        logout,
        isAdmin,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Prop validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthData = () => useContext(AuthContext);
