import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isInCart = cartItems.some(item => item.id === product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');

    if (!user) {
      // Save intended action
      localStorage.setItem('redirectAfterLogin', window.location.pathname);

      // Redirect to login page
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    // User is logged in, add to cart
    addToCart(product);
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
              if (unitLower === 'kg')
                return `${(product.available * 1000).toFixed(0)} gm (${product.available} kg)`;
              else if (unitLower === 'l')
                return `${(product.available * 1000).toFixed(0)} ml (${product.available} L)`;
              else
                return `${product.available} ${unit}`;
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
    </div>
  );
};

export default ProductCard;
