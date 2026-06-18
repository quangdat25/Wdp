import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo-removebg-preview.png';
import './Footer.css';

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="site-footer">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">
            {/* Col 1: Logo & info */}
            <div className="footer__col">
              <div className="footer__brand">
                <img src={logoImg} alt="Logo" width="40" height="40" style={{ objectFit: 'contain' }} />
                <div>
                  <strong>On Campus Dormitory</strong>
                  <p>KTX Đại học FPT</p>
                </div>
              </div>
              <p className="footer__desc">
                Hệ thống quản lý và đăng ký ký túc xá Đại học FPT. 
                Mang đến không gian sống xanh, tiện nghi cho sinh viên.
              </p>
            </div>

            {/* Col 2: Links */}
            <div className="footer__col">
              <h4 className="footer__col-title">Liên kết</h4>
              <ul className="footer__links">
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/about">Giới thiệu</Link></li>
                <li><Link to="/register">Đăng ký KTX</Link></li>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div className="footer__col">
              <h4 className="footer__col-title">Liên hệ</h4>
              <ul className="footer__contact">
                <li>
                  <span className="footer__contact-icon">📍</span>
                  Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội
                </li>
                <li>
                  <span className="footer__contact-icon">📞</span>
                  (024) 7300 1866
                </li>
                <li>
                  <span className="footer__contact-icon">✉️</span>
                  ktx@fpt.edu.vn
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© 2026 On Campus Dormitory — KTX Đại học FPT. All rights reserved.</p>
        </div>
      </div>

      {/* Back to top */}
      <button
        className="footer__back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
        id="back-to-top-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </footer>
  );
}

export default Footer;
