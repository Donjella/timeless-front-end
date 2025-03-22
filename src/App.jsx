import React from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './styles/app.css';
import { BasePageLayout } from './pages/layouts/BasePageLayout';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
<<<<<<< HEAD
import { UserProfile } from './pages/UserProfile';
import { useAuthData } from './hooks/useAuthData';
=======
>>>>>>> dev
import AdminDashboard from './components/AdminDashboard';
import WatchCatalog from './components/WatchCatalog';
import Checkout from './components/Checkout';
import SimplifiedCheckout from './components/SimplifiedCheckout';
import UserProfile from './components/UserProfile';
import EditProfile from './components/EditProfile';
import About from './pages/About';
import HomePage from './pages/Home';
import { useAuthData } from './hooks/useAuthData';
import { AuthProvider } from '/src/contexts/AuthProvider.jsx';

// Create an inner component that uses the auth context
function AppRoutes() {
  const { authData } = useAuthData();

  // Check if user is an admin
  const isAdmin =
    authData.isAuthenticated && authData.user && authData.user.role === 'admin';

  // Protected route component
  const AdminRoute = ({ children }) => {
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (!isAdmin) {
      return <Navigate to="/" />;
    }

    return children;
  };

<<<<<<< HEAD
<<<<<<< HEAD
  
  // Protected route component for authenticated users
  const PrivateRoute = ({ children }) => {
=======
=======
  AdminRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

>>>>>>> dev
  // Regular user protected route
  const ProtectedRoute = ({ children }) => {
>>>>>>> dev
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
<<<<<<< HEAD
  };

<<<<<<< HEAD
// PropTypes validation for AdminRoute
  AdminRoute.propTypes = {
    children: PropTypes.node.isRequired,
=======
>>>>>>> dev
  };

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  // Simple placeholder for HomePage
  const HomePage = () => {
    return (
      <div className="home-content">
        <h1>Welcome to Timeless</h1>
        <p className="tagline">Premium luxury watches for any occasion</p>
        <div className="home-cta">
          <Link to="/catalog" className="btn">
            Browse Our Collection
          </Link>
        </div>
      </div>
    );
=======
  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
>>>>>>> dev
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasePageLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<WatchCatalog />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

<<<<<<< HEAD
          {/* User routes - protected */}
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* Admin routes - now within BasePageLayout */}
=======
          {/* User routes (protected) */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment"
            element={
              <ProtectedRoute>
                <SimplifiedCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
>>>>>>> dev
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Not found */}
          <Route
            path="*"
            element={<div className="not-found">404 - Page Not Found</div>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

// Main App component that provides the AuthContext
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
