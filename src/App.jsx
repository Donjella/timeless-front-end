import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';
import './styles/App.css';
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
import UserProfile from './components/UserProfile';
import UserRentals from './components/UserRentals';
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

<<<<<<< HEAD
  
  // Protected route component for authenticated users
  const PrivateRoute = ({ children }) => {
=======
  // Regular user protected route
  const ProtectedRoute = ({ children }) => {
>>>>>>> dev
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
<<<<<<< HEAD
  };

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
  };

  // Placeholder for About and Contact pages
  const AboutPage = () => (
    <div className="page-content">
      <h1>About Timeless</h1>
      <p>
        We are a luxury watch rental service providing premium timepieces for
        any occasion.
      </p>
      <p>
        Founded in 2023, Timeless has quickly become the go-to destination for
        watch enthusiasts who want to experience the finest watches without the
        commitment of ownership.
      </p>
    </div>
  );

  const ContactPage = () => (
    <div className="page-content">
      <h1>Contact Us</h1>
      <p>
        We'd love to hear from you! Please contact us using the information
        below:
      </p>
      <div className="contact-info">
        <p>
          <strong>Email:</strong> info@timeless-watches.com
        </p>
        <p>
          <strong>Phone:</strong> (02) 1234 5678
        </p>
        <p>
          <strong>Address:</strong> 123 Watch Lane, Sydney, NSW 2000
        </p>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasePageLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<WatchCatalog />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
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
            path="account/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/rentals"
            element={
              <ProtectedRoute>
                <UserRentals />
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

export default App;
