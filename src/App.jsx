import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import './styles/App.css';
import { BasePageLayout } from './pages/layouts/BasePageLayout';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { useAuthData } from './hooks/useAuthData';
import AdminDashboard from './components/AdminDashboard'; 

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

  // PropTypes validation for AdminRoute
  AdminRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  // Simple placeholder for HomePage
  const HomePage = () => {
    return (
      <div className="home-content">
        <h1>Welcome to Timeless</h1>
        <p className="tagline">Premium luxury watches for any occasion</p>
        <div className="home-cta">
          <a href="/catalog" className="btn">
            Browse Our Collection
          </a>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasePageLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<div>Catalog Page (Placeholder)</div>} />
          <Route path="about" element={<div>About Page (Placeholder)</div>} />
          <Route path="contact" element={<div>Contact Page (Placeholder)</div>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Admin routes - now within BasePageLayout */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Not found */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;