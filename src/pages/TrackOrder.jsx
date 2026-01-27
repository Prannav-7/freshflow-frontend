import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import './TrackOrder.css';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check for order ID in sessionStorage (from checkout redirect)
    useEffect(() => {
        const storedOrderId = sessionStorage.getItem('trackOrderId');
        if (storedOrderId) {
            setOrderId(storedOrderId);
            // Clear it from sessionStorage
            sessionStorage.removeItem('trackOrderId');
            // Auto-track the order
            handleTrackOrderWithId(storedOrderId);
        }
    }, []);

    const handleTrackOrderWithId = async (id) => {
        if (!id.trim()) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fresh-flow-fa56.onrender.com';
            const response = await fetch(`${API_BASE_URL}/api/orders/track/${id.trim()}`);
            const data = await response.json();

            if (data.success) {
                setOrderData(data.order);
            } else {
                setError(data.error || 'Order not found. Please check your order ID.');
            }
        } catch (err) {
            console.error('Error tracking order:', err);
            setError('Failed to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackOrder = async (e) => {
        e.preventDefault();

        if (!orderId.trim()) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fresh-flow-fa56.onrender.com';
            const response = await fetch(`${API_BASE_URL}/api/orders/track/${orderId.trim()}`);
            const data = await response.json();

            if (data.success) {
                setOrderData(data.order);
            } else {
                setError(data.error || 'Order not found. Please check your order ID.');
            }
        } catch (err) {
            console.error('Error tracking order:', err);
            setError('Failed to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return <CheckCircle size={24} className="status-icon delivered" />;
            case 'cancelled':
                return <XCircle size={24} className="status-icon cancelled" />;
            case 'shipped':
            case 'out for delivery':
                return <Truck size={24} className="status-icon shipped" />;
            case 'processing':
                return <Package size={24} className="status-icon processing" />;
            default:
                return <Clock size={24} className="status-icon pending" />;
        }
    };

    const getStatusClass = (status) => {
        return status?.toLowerCase().replace(/\s+/g, '-') || 'pending';
    };

    const getOrderTimeline = (status) => {
        const allStatuses = ['pending', 'processing', 'shipped', 'out for delivery', 'delivered'];
        const currentIndex = allStatuses.indexOf(status?.toLowerCase());

        return allStatuses.map((s, index) => ({
            status: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
            completed: index <= currentIndex,
            current: s === status?.toLowerCase()
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="track-order-page">
            <div className="container">
                <div className="track-header">
                    <h1>Track Your Order</h1>
                    <p>Enter your order ID to track your delivery status</p>
                </div>

                <form onSubmit={handleTrackOrder} className="track-form">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Enter Order ID (e.g., ORD123456)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading} className="track-btn">
                            {loading ? 'Tracking...' : 'Track Order'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="error-message">
                        <XCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {orderData && (
                    <div className="order-tracking-result">
                        {/* Order Status Header */}
                        <div className="order-status-card">
                            <div className="status-header">
                                {getStatusIcon(orderData.status)}
                                <div className="status-info">
                                    <h2>Order {orderData.status || 'Pending'}</h2>
                                    <p className="order-id">Order ID: {orderData.docId || orderId}</p>
                                </div>
                                <div className={`status-badge ${getStatusClass(orderData.status)}`}>
                                    {orderData.status || 'Pending'}
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="order-timeline">
                                {getOrderTimeline(orderData.status).map((step, index) => (
                                    <div
                                        key={step.status}
                                        className={`timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                                    >
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <p className="timeline-label">{step.label}</p>
                                            {step.current && orderData.orderDate && (
                                                <p className="timeline-date">{formatDate(orderData.orderDate)}</p>
                                            )}
                                        </div>
                                        {index < getOrderTimeline(orderData.status).length - 1 && (
                                            <div className="timeline-line"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="order-details-grid">
                            {/* Delivery Information */}
                            <div className="detail-card">
                                <h3><MapPin size={20} /> Delivery Address</h3>
                                {orderData.shippingAddress ? (
                                    <div className="address-details">
                                        <p className="recipient-name">{orderData.shippingAddress.fullName}</p>
                                        <p>{orderData.shippingAddress.address}</p>
                                        <p>
                                            {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}
                                        </p>
                                        <div className="contact-info">
                                            <p><Phone size={16} /> {orderData.shippingAddress.phone}</p>
                                            <p><Mail size={16} /> {orderData.shippingAddress.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p>No address information available</p>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="detail-card">
                                <h3><Package size={20} /> Order Summary</h3>
                                <div className="order-summary-info">
                                    <div className="summary-row">
                                        <span>Order Date:</span>
                                        <strong>{formatDate(orderData.orderDate)}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Payment Method:</span>
                                        <strong>{orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Total Items:</span>
                                        <strong>{orderData.items?.length || 0}</strong>
                                    </div>
                                    <div className="summary-divider"></div>
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <strong>₹{orderData.totalAmount || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        {orderData.items && orderData.items.length > 0 && (
                            <div className="order-items-section">
                                <h3>Order Items ({orderData.items.length})</h3>
                                <div className="items-list">
                                    {orderData.items.map((item, index) => (
                                        <div key={index} className="order-item-card">
                                            <img
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name}
                                                onError={(e) => e.target.src = '/placeholder.png'}
                                            />
                                            <div className="item-details">
                                                <h4>{item.name}</h4>
                                                <p className="item-category">{item.category}</p>
                                                {item.size && <p className="item-size">Size: {item.size}</p>}
                                                <p className="item-quantity">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="item-price">
                                                ₹{item.price * item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="help-section">
                            <h3>Need Help?</h3>
                            <p>If you have any questions about your order, please contact our customer support.</p>
                            <div className="help-actions">
                                <a href="/contact" className="help-btn">Contact Support</a>
                                {orderData.status?.toLowerCase() === 'pending' && (
                                    <button className="help-btn secondary">Cancel Order</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!orderData && !error && !loading && (
                    <div className="track-placeholder">
                        <Package size={64} className="placeholder-icon" />
                        <h3>Track Your Order</h3>
                        <p>Enter your order ID above to see real-time tracking information</p>
                        <div className="tracking-tips">
                            <h4>Where to find your Order ID?</h4>
                            <ul>
                                <li>Check your order confirmation email</li>
                                <li>Visit your profile's order history</li>
                                <li>Look for the SMS confirmation sent to your phone</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
