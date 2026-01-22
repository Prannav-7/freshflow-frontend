import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Package, MapPin, Phone, Mail, User, CreditCard, ArrowRight } from 'lucide-react';
import { addOrder } from '../api';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'cod'
    });

    useEffect(() => {
        // Check if user is logged in
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            alert('Please login to proceed with checkout');
            localStorage.setItem('redirectAfterLogin', '/checkout');
            navigate('/login');
            return;
        }

        const userData = JSON.parse(savedUser);
        setUser(userData);

        // Pre-fill user data
        setFormData(prev => ({
            ...prev,
            fullName: userData.displayName || '',
            email: userData.email || ''
        }));

        // Redirect if cart is empty
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [navigate, cartItems.length]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate order totals
            const subtotal = getCartTotal();
            const deliveryCharge = subtotal >= 500 ? 0 : 50;
            const total = subtotal + deliveryCharge;

            // Prepare order data for Firebase
            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || formData.fullName,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category
                })),
                shippingAddress: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                paymentMethod: formData.paymentMethod,
                subtotal: subtotal,
                deliveryCharge: deliveryCharge,
                totalAmount: total,
                status: 'pending',
                orderDate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            // Save order to Firebase
            const result = await addOrder(orderData);

            if (result.success) {
                // Reduce stock for ordered items
                try {
                    const stockResponse = await fetch('http://localhost:5000/api/products/reduce-stock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            items: cartItems.map(item => ({
                                id: item.firestoreId || item.id.toString(),
                                quantity: item.quantity,
                                size: item.selectedSize || item.size // Include size for unit conversion
                            }))
                        })
                    });

                    if (!stockResponse.ok) {
                        console.warn('Stock reduction failed, but order was placed');
                    }
                } catch (stockError) {
                    console.error('Error reducing stock:', stockError);
                    // Don't fail the whole order if stock reduction fails
                }

                alert(`Order placed successfully! Order ID: ${result.id}\nThank you for shopping with us.`);
                clearCart();
                navigate('/');
            } else {
                throw new Error('Failed to save order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = getCartTotal();
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const total = subtotal + deliveryCharge;

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="page-title">Checkout</h1>

                <div className="checkout-content">
                    <div className="checkout-form-section">
                        <div className="user-greeting">
                            <User size={24} />
                            <div>
                                <h3>Hello, {user.displayName || 'User'}!</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="checkout-form">
                            <div className="form-section">
                                <h2><Package size={20} /> Delivery Information</h2>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="10-digit mobile number"
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">Complete Address *</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="House No., Building Name, Street, Landmark"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="City name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="state">State *</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            placeholder="State name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="pincode">Pincode *</label>
                                        <input
                                            type="text"
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                            placeholder="6-digit pincode"
                                            pattern="[0-9]{6}"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2><CreditCard size={20} /> Payment Method</h2>

                                <div className="payment-options">
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                        />
                                        <div className="payment-option-content">
                                            <strong>Cash on Delivery</strong>
                                            <p>Pay when you receive your order</p>
                                        </div>
                                    </label>

                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="online"
                                            checked={formData.paymentMethod === 'online'}
                                            onChange={handleChange}
                                        />
                                        <div className="payment-option-content">
                                            <strong>Online Payment</strong>
                                            <p>UPI / Cards / Net Banking</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="place-order-btn"
                                disabled={loading}
                            >
                                {loading ? 'Placing Order...' : 'Place Order'} <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="checkout-summary">
                        <h2>Order Summary</h2>

                        <div className="order-items">
                            {cartItems.map(item => (
                                <div key={`${item.id}-${item.selectedSize || 'default'}`} className="order-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="order-item-info">
                                        <h4>{item.name}</h4>
                                        {item.selectedSize && (
                                            <p className="order-item-size" style={{ color: '#22c55e', fontSize: '0.85rem' }}>
                                                {item.selectedSize}
                                            </p>
                                        )}
                                        <p className="order-item-quantity">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="order-item-price">
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>₹{subtotal}</span>
                            </div>

                            <div className="total-row">
                                <span>Delivery Charges</span>
                                <span className={deliveryCharge === 0 ? 'free' : ''}>
                                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                </span>
                            </div>

                            {subtotal < 500 && (
                                <div className="delivery-tip">
                                    Add ₹{500 - subtotal} more for FREE delivery
                                </div>
                            )}

                            <div className="total-divider"></div>

                            <div className="total-row grand-total">
                                <span>Grand Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <div className="checkout-benefits">
                            <p>✓ 100% Organic Products</p>
                            <p>✓ Quality Assured</p>
                            <p>✓ Secure Payment</p>
                            <p>✓ Easy Returns</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
