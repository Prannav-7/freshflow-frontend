import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3 className="footer-title">
              <span className="logo-icon">🌿</span>
              VALARI
            </h3>
            <p className="footer-description">
              VALARI IYARKAI VELAN URPATHI MAIYAM - Your trusted source for 100% organic products. We bring nature's best directly to your doorstep.
            </p>
            <div className="footer-credentials">
              <p><strong>GSTIN:</strong> 33AFNPM8201K1ZB</p>
              <p><strong>FSSAI:</strong> 22422061000260</p>
            </div>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products?category=Rice">Traditional Rice</Link></li>
              <li><Link to="/products?category=Oil">Cold-Pressed Oils</Link></li>
              <li><Link to="/products?category=Grains">Millets & Grains</Link></li>
              <li><Link to="/products?category=Powder">Natural Powders</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">Returns & Refunds</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact Info</h4>
            <ul className="contact-info">
              <li>
                <Phone size={16} />
                <span>8056638446</span>
              </li>
              <li>
                <Phone size={16} />
                <span>9976238446</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>51-A, SORIYAMPALAYAM, VAZHAITHOTTAM (Po), SIVAGIRI - 638109, ERODE (Dt)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 VALARI IYARKAI VELAN URPATHI MAIYAM. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
