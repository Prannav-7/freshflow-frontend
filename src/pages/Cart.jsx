import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');

    if (!user) {
      // Save intended action
      localStorage.setItem('redirectAfterLogin', '/checkout');

      // Redirect to login page
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    // User is logged in, proceed to checkout
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="container">
          <div className="empty-cart-content">
            <ShoppingBag size={80} />
            <h2>Your cart is empty</h2>
            <p>Add some organic goodness to your cart!</p>
            <Link to="/products" className="shop-btn">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={String(item.id)} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="cart-item-brand">{item.brand}</p>
                  {item.selectedSize && (
                    <p className="cart-item-size" style={{ color: '#22c55e', fontWeight: '500', fontSize: '0.9rem' }}>
                      Size: {item.selectedSize}
                    </p>
                  )}
                  <div className="cart-item-price">
                    <span className="current-price">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="original-price">₹{item.originalPrice}</span>
                    )}
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ₹{item.price * item.quantity}
                  </div>

                  <button
                    className="remove-btn cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Charges</span>
              <span className={deliveryCharge === 0 ? 'free' : ''}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>

            {subtotal < 500 && (
              <div className="delivery-info">
                Add ₹{500 - subtotal} more for FREE delivery
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>

            <div className="cart-benefits">
              <p>✓ 100% Organic Products</p>
              <p>✓ Quality Assured</p>
              <p>✓ Secure Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
