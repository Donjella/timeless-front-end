import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './styles/App.css';
import { BasePageLayout } from './pages/layouts/BasePageLayout';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import AdminDashboard from './components/AdminDashboard';
import WatchCatalog from './components/WatchCatalog';
import Checkout from './components/Checkout';
import SimplifiedCheckout from './components/SimplifiedCheckout';
import UserProfile from './components/UserProfile';
import EditProfile from './components/EditProfile';
import About from './pages/About';
import HomePage from './pages/Home';
import { useAuthData } from './hooks/useAuthData';

function App() {
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

  // Regular user protected route
  const ProtectedRoute = ({ children }) => {
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
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

          {/* User routes (protected) */}
          {/* Regular checkout route */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Simplified checkout route for rental payments */}
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

export default App;
