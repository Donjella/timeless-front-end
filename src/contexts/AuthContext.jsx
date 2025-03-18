import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Default auth state
const defaultAuthData = {
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

// Provider component
export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(defaultAuthData);
  
  // Load auth data from localStorage on initial load
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setAuthData(parsedAuth);
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
        role: userData.role
      },
      token: userData.token
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

  return (
    <AuthContext.Provider value={{ 
      authData, 
      setAuthData, 
      login, 
      logout, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Prop validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Add this export
export const useAuthData = () => useContext(AuthContext);