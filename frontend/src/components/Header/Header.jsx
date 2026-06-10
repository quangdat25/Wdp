import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`} id="site-header">
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo" id="logo-link">
          <div className="header__logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="2.5" fill="none"/>
              <rect x="22" y="2" width="16" height="16" rx="3" stroke="#e8601c" strokeWidth="2.5" fill="none"/>
              <rect x="2" y="22" width="16" height="16" rx="3" stroke="#e8601c" strokeWidth="2.5" fill="none"/>
              <rect x="22" y="22" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="2.5" fill="none"/>
              <circle cx="10" cy="10" r="3" fill="#4CAF50"/>
              <circle cx="30" cy="10" r="3" fill="#e8601c"/>
              <circle cx="10" cy="30" r="3" fill="#e8601c"/>
              <circle cx="30" cy="30" r="3" fill="#4CAF50"/>
            </svg>
          </div>
          <div className="header__logo-text">
            <span className="header__logo-title">On campus</span>
            <span className="header__logo-subtitle">Dormitory</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`} id="main-nav">
          <Link to="/" className="header__nav-link" id="nav-home">
            Trang chủ
          </Link>
          <Link to="/about" className="header__nav-link" id="nav-about">
            About
          </Link>
          <Link to="/login" className="header__nav-btn" id="nav-login">
            Login
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`header__hamburger ${mobileMenuOpen ? 'header__hamburger--active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          id="hamburger-btn"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
