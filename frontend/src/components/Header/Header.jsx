import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo-removebg-preview.png';
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
      <div className="header__inner header__container">
        {/* Logo */}
        <Link to="/" className="header__logo" id="logo-link">
          <div className="header__logo-icon">
            <img src={logoImg} alt="Logo" width="40" height="40" style={{ objectFit: 'contain' }} />
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
