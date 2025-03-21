import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { User, Watch } from 'lucide-react';
import '../../styles/header.css';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { authData, logout } = useAuthData();

  // Check if user is an admin
  const isAdmin =
    authData.isAuthenticated && authData.user && authData.user.role === 'admin';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Top section with logo and auth buttons */}
        <div className="header-top">
          {/* Mobile menu button */}
          <div className="mobile-menu-button">
            <button onClick={toggleMobileMenu}>
              <span className="menu-icon">≡</span>
            </button>
          </div>

          {/* Logo */}
          <div className="logo">
            <Link to="/">TIMELESS</Link>
          </div>

          {/* Auth buttons / User info */}
          <div className="auth-buttons">
            {!authData.isAuthenticated ? (
              <>
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/register" className="register-btn">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="welcome-message">
                  Welcome, {authData.user.first_name}
                </span>
<<<<<<< HEAD
                <Link to="/profile" className="profile-btn">
                  My Profile
                </Link>
=======

                {/* My Rentals button for regular users */}
                {!isAdmin && (
                  <Link to="/account/rentals" className="rentals-btn">
                    <Watch size={18} />
                    <span>My Rentals</span>
                  </Link>
                )}

                {/* Admin Dashboard button */}
>>>>>>> dev
                {isAdmin && (
                  <Link to="/admin" className="admin-btn">
                    Admin Dashboard
                  </Link>
                )}

                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>
                Watch Catalog
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </li>
<<<<<<< HEAD
            {authData.isAuthenticated && (
              <li>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  My Profile
=======
            {authData.isAuthenticated && !isAdmin && (
              <li>
                <Link
                  to="/account/rentals"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Rentals
>>>>>>> dev
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  Admin Dashboard
                </Link>
              </li>
            )}
            {authData.isAuthenticated && (
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Navbar - placed outside the container but inside header to allow full width background */}
      <nav className="navbar">
        <div className="header-container">
          <ul className="nav-links">
            <li>
              <Link to="/catalog">Watch Catalog</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin">Admin Dashboard</Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
