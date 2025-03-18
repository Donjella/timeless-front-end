import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/header.css";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                    
                    {/* Auth buttons */}
                    <div className="auth-buttons">
                        <Link to="/login" className="login-btn">Login</Link>
                        <Link to="/register" className="register-btn">Register</Link>
                    </div>
                </div>
                
                {/* Mobile menu */}
                <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <ul>
                        <li><Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>Catalog</Link></li>
                        <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
                        <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
                    </ul>
                </div>
            </div>
            
            {/* Navbar - placed outside the container but inside header to allow full width background */}
            <nav className="navbar">
                <div className="header-container">
                    <ul className="nav-links">
                        <li><Link to="/catalog">Catalog</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}