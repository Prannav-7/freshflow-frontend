import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Package, MapPin, Phone, Mail, User, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { addOrder } from '../api';
import Toast from '../components/Toast';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

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
            setToast({ message: 'Please login to proceed', type: 'error' });
            localStorage.setItem('redirectAfterLogin', '/checkout');
            setTimeout(() => navigate('/login'), 2000);
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

    const validateForm = () => {
        const newErrors = {};
        const lettersOnlyRegex = /^[A-Za-z\s]+$/;

        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
        } else if (!lettersOnlyRegex.test(formData.fullName.trim())) {
            newErrors.fullName = 'Name should only contain letters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (10 digits, starts with 6-9)
        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Should be 10 digits starting with 6, 7, 8 or 9';
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Complete address is required';
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Please provide a more detailed address';
        }

        // City validation (Letters only)
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        } else if (!lettersOnlyRegex.test(formData.city.trim())) {
            newErrors.city = 'City should only contain letters';
        }

        // State validation (Letters only)
        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        } else if (!lettersOnlyRegex.test(formData.state.trim())) {
            newErrors.state = 'State should only contain letters';
        }

        // Pincode validation (6 digits)
        const pincodeRegex = /^[0-9]{6}$/;
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!pincodeRegex.test(formData.pincode)) {
            newErrors.pincode = 'Please enter a valid 6-digit pincode';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            setToast({ message: 'Please correct the errors in the form', type: 'error' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

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
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fresh-flow-fa56.onrender.com';
                    const stockResponse = await fetch(`${API_BASE_URL}/api/products/reduce-stock`, {
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
                }

                setToast({ message: 'Order placed successfully!', type: 'success' });

                // Show tracking dialog after a short delay
                setTimeout(() => {
                    const orderMessage = `✅ Order Placed Successfully!\n\n` +
                        `Order ID: ${result.id}\n\n` +
                        `You can track your order anytime using this Order ID.\n` +
                        `Would you like to track your order now?`;

                    if (window.confirm(orderMessage)) {
                        sessionStorage.setItem('trackOrderId', result.id);
                        clearCart();
                        navigate('/track-order');
                    } else {
                        clearCart();
                        navigate('/');
                    }
                }, 1000);
            } else {
                throw new Error('Failed to save order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setToast({ message: 'Failed to place order. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const subtotal = getCartTotal();
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const total = subtotal + deliveryCharge;

    if (!user) {
        return null;
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

                        <form onSubmit={handleSubmit} className="checkout-form" noValidate>
                            <div className="form-section">
                                <h2><Package size={20} /> Delivery Information</h2>

                                <div className="form-row">
                                    <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                    </div>

                                    <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                        />
                                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                                    </div>
                                </div>

                                <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
                                    <label htmlFor="address">Complete Address *</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="House No., Building Name, Street, Landmark"
                                        rows="3"
                                    ></textarea>
                                    {errors.address && <span className="error-message">{errors.address}</span>}
                                </div>

                                <div className="form-row">
                                    <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
                                        <label htmlFor="city">City *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="City name"
                                        />
                                        {errors.city && <span className="error-message">{errors.city}</span>}
                                    </div>

                                    <div className={`form-group ${errors.state ? 'has-error' : ''}`}>
                                        <label htmlFor="state">State *</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="State name"
                                        />
                                        {errors.state && <span className="error-message">{errors.state}</span>}
                                    </div>

                                    <div className={`form-group ${errors.pincode ? 'has-error' : ''}`}>
                                        <label htmlFor="pincode">Pincode *</label>
                                        <input
                                            type="text"
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="6-digit pincode"
                                        />
                                        {errors.pincode && <span className="error-message">{errors.pincode}</span>}
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
            {toast && <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />}
        </div>
    );
};

export default Checkout;

