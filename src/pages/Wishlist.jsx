import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (product) => {
        addToCart(product);
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(product.id);
    };

    const handleRemoveFromWishlist = (productId) => {
        removeFromWishlist(productId);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <h1 className="page-title">My Wishlist</h1>
                    <div className="empty-cart">
                        <Heart size={80} color="#ccc" />
                        <h2>Your Wishlist is Empty</h2>
                        <p>Save your favorite products to your wishlist</p>
                        <button onClick={() => navigate('/products')} className="continue-shopping">
                            Browse Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">
                    <Heart size={32} /> My Wishlist ({wishlistItems.length} items)
                </h1>

                <div className="cart-content">
                    <div className="cart-items">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="cart-item-image"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div className="cart-item-details">
                                    <h3
                                        className="cart-item-name"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="cart-item-category">{item.category}</p>
                                    {item.description && (
                                        <p className="cart-item-description">{item.description}</p>
                                    )}
                                </div>
                                <div className="cart-item-actions">
                                    <div className="cart-item-price">
                                        ₹{item.price}
                                    </div>
                                    <div className="wishlist-item-buttons">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="add-to-cart-btn"
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#2ecc71',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <ShoppingCart size={16} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromWishlist(item.id)}
                                            className="remove-btn"
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
