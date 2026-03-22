import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Toast from '../components/Toast';

// Helper: compute max units of a given size that fit in available stock
// Returns 0 if not even 1 unit can be fulfilled
const computeMaxQty = (item) => {
  const available = Number(item.available);
  if (!available || available <= 0) return 0;

  const sizeStr = item.selectedSize;
  if (!sizeStr) return Math.floor(available);

  const sizeMatch = sizeStr.match(/^([\d.]+)\s*(kg|gm|g|l|ml)$/i);
  if (!sizeMatch) return Math.floor(available);

  const sizeValue = parseFloat(sizeMatch[1]);
  const sizeUnit = sizeMatch[2].toLowerCase();

  let productUnit = item.unit;
  if (!productUnit) {
    const category = (item.category || '').toLowerCase();
    productUnit = category.includes('oil') ? 'l' : 'kg';
  }
  productUnit = productUnit.toLowerCase();

  let sizeInBaseUnit = sizeValue;
  if (productUnit === 'kg') {
    if (sizeUnit === 'gm' || sizeUnit === 'g') sizeInBaseUnit = sizeValue / 1000;
    else if (sizeUnit === 'kg') sizeInBaseUnit = sizeValue;
  } else if (productUnit === 'l') {
    if (sizeUnit === 'ml') sizeInBaseUnit = sizeValue / 1000;
    else if (sizeUnit === 'l') sizeInBaseUnit = sizeValue;
  }

  if (sizeInBaseUnit <= 0) return 0;
  return Math.floor(available / sizeInBaseUnit); // can be 0 — correctly blocks the item
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [toast, setToast] = useState(null);

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
            {/* Group items by Product ID */}
            {(() => {
              const grouped = cartItems.reduce((acc, item) => {
                const id = String(item.id);
                if (!acc[id]) {
                  acc[id] = {
                    ...item,
                    variations: []
                  };
                }
                acc[id].variations.push(item);
                return acc;
              }, {});

              return Object.values(grouped).map(product => (
                <div key={product.id} className="cart-item-grouped">
                  <div className="grouped-item-main">
                    <Link to={`/product/${product.id}`} className="cart-item-image">
                      <img src={product.image} alt={product.name} />
                    </Link>

                    <div className="cart-item-info">
                      <Link to={`/product/${product.id}`}>
                        <h3>{product.name}</h3>
                      </Link>
                      <p className="cart-item-brand">{product.brand}</p>
                    </div>
                  </div>

                  <div className="cart-item-variations">
                    {product.variations.map(variation => (
                      <div key={variation.selectedSize || 'default'} className="variation-row">
                        <div className="variation-details">
                          <span className="variation-size">Size: {variation.selectedSize || 'Standard'}</span>
                          <span className="variation-unit-price">₹{variation.price}</span>
                        </div>

                        <div className="variation-controls">
                          <div className="quantity-control small">
                            <button
                              onClick={() => {
                                if (variation.quantity > 1) {
                                  updateQuantity(variation.id, variation.quantity - 1, variation.selectedSize);
                                } else {
                                  removeFromCart(variation.id, variation.selectedSize);
                                }
                              }}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span>{variation.quantity}</span>
                            <button
                              onClick={() => {
                                const maxQty = computeMaxQty(variation);
                                if (variation.quantity >= maxQty) {
                                  setToast({
                                    type: 'error',
                                    message: `Only ${maxQty} unit(s) available in stock`
                                  });
                                  return;
                                }
                                updateQuantity(variation.id, variation.quantity + 1, variation.selectedSize);
                              }}
                              disabled={variation.quantity >= computeMaxQty(variation)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="variation-total">
                            ₹{variation.price * variation.quantity}
                          </div>

                          <button
                            className="remove-variation-btn"
                            onClick={() => {
                              removeFromCart(variation.id, variation.selectedSize);
                              setToast({
                                type: 'success',
                                message: `Removed ${variation.selectedSize || 'item'} from cart.`
                              });
                            }}
                            title="Remove this size"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}

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

export default Cart;
