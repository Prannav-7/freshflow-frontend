import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Toast from './Toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [toast, setToast] = useState(null);
  const isInCart = cartItems.some(item => String(item.id) === String(product.id));
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');

    if (!user) {
      // Save intended action
      localStorage.setItem('redirectAfterLogin', window.location.pathname);

      // Redirect to login page after a short delay
      setToast({
        type: 'error',
        message: 'Please login to add items to cart'
      });
      setTimeout(() => {
        navigate('/login');
      }, 4000);
      return;
    }

    // User is logged in, add to cart with default size if multiple exist
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    addToCart(product, 1, defaultSize);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.discount > 0 && (
          <span className="discount-badge">{product.discount}% OFF</span>
        )}
        {!product.inStock && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
        <button
          className={`wishlist-icon-btn ${inWishlist ? 'in-wishlist' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            handleWishlistToggle();
          }}
          aria-label="Add to Wishlist"
        >
          <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="product-category">
          <span className="category-badge">{product.category}</span>
        </div>

        {product.available !== undefined && (
          <div className="product-available" style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Available: {(() => {
              // Get unit - auto-detect if missing
              let unit = product.unit;
              if (!unit) {
                const category = (product.category || '').toLowerCase();
                unit = category.includes('oil') ? 'L' : 'kg';
              }

              const unitLower = unit.toLowerCase();
              const avail = parseFloat(Number(product.available).toFixed(2));
              if (unitLower === 'kg')
                return `${avail} kg (${(product.available * 1000).toFixed(0)} gm)`;
              else if (unitLower === 'l')
                return `${avail} L (${(product.available * 1000).toFixed(0)} ml)`;
              else
                return `${avail} ${unit}`;
            })()}
          </div>
        )}

        <div className="product-rating">
          <span className="rating-value">
            {product.rating} <Star size={14} fill="currentColor" />
          </span>
          <span className="review-count">({product.reviews})</span>
        </div>

        <div className="product-price">
          <span className="current-price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="original-price">₹{product.originalPrice}</span>
              <span className="price-discount">{product.discount}% off</span>
            </>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="product-sizes">
            <small>(Multiple sizes)</small>
          </div>
        )}

        <div className="tap-to-select">
          Tap to select size
        </div>

        <button
          className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart size={18} />
          {isInCart ? 'Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductCard;
