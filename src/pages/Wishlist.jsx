import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Toast from '../components/Toast';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [selectedSizes, setSelectedSizes] = useState({});
    const [toast, setToast] = useState(null);

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [productId]: size
        }));
    };

    const handleAddToCart = (product) => {
        const selectedSize = selectedSizes[product.id] || product.sizes?.[0];
        addToCart(product, 1, selectedSize);
        setToast({
            type: 'cart',
            message: `${product.name} added to cart!`
        });
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(product.id);
    };

    const handleRemoveFromWishlist = (productId) => {
        removeFromWishlist(productId);
        setToast({
            type: 'wishlist',
            message: 'Item removed from wishlist'
        });
    };

    const handleClearWishlist = () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            clearWishlist();
        }
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="container">
                    <div className="wishlist-empty">
                        <Heart size={80} className="empty-icon" />
                        <h2>Your Wishlist is Empty</h2>
                        <p>Save your favorite items to your wishlist and shop them later!</p>
                        <Link to="/products" className="btn-primary">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1>
                        <Heart size={32} fill="var(--primary)" stroke="var(--primary)" />
                        My Wishlist
                    </h1>
                    <div className="wishlist-header-actions">
                        <span className="wishlist-count">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</span>
                        <button onClick={handleClearWishlist} className="btn-clear">
                            <Trash2 size={18} />
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="wishlist-grid">
                    {wishlistItems.map((product) => {
                        const selectedSize = selectedSizes[product.id] || product.sizes?.[0];
                        const priceForSize = product.prices && product.prices[selectedSize]
                            ? product.prices[selectedSize]
                            : product.price;

                        return (
                            <div key={product.id} className="wishlist-item">
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveFromWishlist(product.id)}
                                    aria-label="Remove from wishlist"
                                >
                                    <Heart size={20} fill="var(--primary)" stroke="var(--primary)" />
                                </button>

                                <Link to={`/product/${product.id}`} className="wishlist-item-image">
                                    <img
                                        src={product.image || product.imageUrl}
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                </Link>

                                <div className="wishlist-item-details">
                                    <Link to={`/product/${product.id}`} className="wishlist-item-title">
                                        <h3>{product.name}</h3>
                                    </Link>

                                    {product.description && (
                                        <p className="wishlist-item-description">
                                            {product.description.length > 100
                                                ? `${product.description.substring(0, 100)}...`
                                                : product.description}
                                        </p>
                                    )}

                                    {product.sizes && product.sizes.length > 0 && (
                                        <div className="wishlist-item-sizes">
                                            <label>Size:</label>
                                            <div className="size-options">
                                                {product.sizes.map((size) => (
                                                    <button
                                                        key={size}
                                                        className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                                        onClick={() => handleSizeSelect(product.id, size)}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="wishlist-item-footer">
                                        <div className="wishlist-item-price">
                                            <span className="price">₹{priceForSize}</span>
                                            {product.originalPrice && product.originalPrice > priceForSize && (
                                                <span className="original-price">₹{product.originalPrice}</span>
                                            )}
                                        </div>

                                        <div className="wishlist-item-buttons">
                                            <button
                                                className="btn-add-to-cart"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                <ShoppingCart size={18} />
                                                Add to Cart
                                            </button>
                                            <button
                                                className="btn-remove-item"
                                                onClick={() => handleRemoveFromWishlist(product.id)}
                                            >
                                                <Trash2 size={18} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="wishlist-actions">
                    <Link to="/products" className="btn-secondary">
                        Continue Shopping
                    </Link>
                </div>
            </div>

            {/* Toast Notification */}
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

export default Wishlist;
