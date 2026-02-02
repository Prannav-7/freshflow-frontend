import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, Heart, LogOut, Package, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect, useRef } from 'react';

const Header = ({ onSearch }) => {
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for logged-in user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    // Listen for custom login event (same tab)
    const handleLoginEvent = (event) => {
      setUser(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search with debouncing - navigate to products page as user types
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        // Navigate to products page with search query
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (searchQuery === '' && window.location.pathname === '/products') {
        // Clear search if input is empty and on products page
        navigate('/products');
      }
    }, 300); // 300ms delay for debouncing

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false); // Close mobile menu if open
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfileDropdownOpen(false);
    window.location.href = '/';
  };

  const handleMyOrders = () => {
    setProfileDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <header className="header">
      {/* Mobile Menu Backdrop */}
      <div
        className={`mobile-menu-backdrop ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <div className="header-top">
        <div className="container">
          <Link to="/" className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Fresh Flow</span>
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for organic products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>

          <nav className="header-actions">
            <Link to="/wishlist" className="header-action">
              <Heart size={24} />
              <span>Wishlist</span>
              {getWishlistCount() > 0 && (
                <span className="cart-badge">{getWishlistCount()}</span>
              )}
            </Link>
            <Link to="/cart" className="header-action cart-action">
              <ShoppingCart size={24} />
              <span>Cart</span>
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </Link>

            {user ? (
              <div className="user-profile-dropdown" ref={dropdownRef}>
                <button
                  className="profile-trigger"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="profile-trigger-content">
                    <div className="profile-icon">
                      <User size={20} />
                    </div>
                    <div className="profile-info">
                      <span className="profile-name">{user.displayName || 'User'}</span>
                      <span className="profile-email">{user.email}</span>
                    </div>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-icon">
                        <User size={24} />
                      </div>
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">{user.displayName || 'User'}</span>
                        <span className="dropdown-user-email">{user.email}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item" onClick={handleMyOrders}>
                      <Package size={18} />
                      <span>My Orders</span>
                    </button>

                    <button className="dropdown-item" onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/track-order');
                    }}>
                      <MapPin size={18} />
                      <span>Track Order</span>
                    </button>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="header-action">
                <User size={24} />
                <span>Login</span>
              </Link>
            )}
          </nav>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className={`header-bottom ${menuOpen ? 'open' : ''}`}>
        <div className="container">
          <nav className="main-nav">
            <Link to="/products?category=Rice" onClick={() => setMenuOpen(false)}>Rice Varieties</Link>
            <Link to="/products?category=Oil" onClick={() => setMenuOpen(false)}>Oils</Link>
            <Link to="/products?category=Grains" onClick={() => setMenuOpen(false)}>Millets & Grains</Link>
            <Link to="/products?category=Powder" onClick={() => setMenuOpen(false)}>Powders</Link>
            <Link to="/products?category=Sweeteners" onClick={() => setMenuOpen(false)}>Natural Sweeteners</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link to="/track-order" className="track-order-link" onClick={() => setMenuOpen(false)}>📦 Track Order</Link>

            {/* Admin Dashboard Link - Visible to any admin user */}
            {user && (user.role === 'admin' || ['psujeeth02@gmail.com', 'prannavp803@gmail.com', 'info.iyarkaivalari@gmail.com'].includes(user.email)) && (
              <Link to="/admin/dashboard" className="admin-nav-link" onClick={() => setMenuOpen(false)}>
                🔧 Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>

  );
};

export default Header;
