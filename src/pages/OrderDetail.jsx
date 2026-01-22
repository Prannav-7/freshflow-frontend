import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrders } from '../api';
import { Package, Truck, CheckCircle, XCircle, ArrowLeft, Calendar, MapPin, Phone, Mail, User } from 'lucide-react';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            const orders = await getOrders();
            const foundOrder = orders.find(o => o.id === id || o.docId === id);

            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                console.error('Order not found');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#22c55e';
            case 'Shipped': return '#3b82f6';
            case 'Processing': return '#f59e0b';
            case 'Cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={24} />;
            case 'Shipped': return <Truck size={24} />;
            case 'Processing': return <Package size={24} />;
            case 'Cancelled': return <XCircle size={24} />;
            default: return <Package size={24} />;
        }
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="container">
                    <div className="loading-state">
                        <Package size={48} />
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-page">
                <div className="container">
                    <div className="error-state">
                        <XCircle size={64} color="#ef4444" />
                        <h2>Order Not Found</h2>
                        <p>The order you're looking for doesn't exist or has been removed.</p>
                        <Link to="/profile" className="back-link">
                            <ArrowLeft size={20} />
                            Back to Profile
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-detail-page">
            <div className="container">
                <div className="order-detail-header">
                    <button onClick={() => navigate('/profile')} className="back-button">
                        <ArrowLeft size={20} />
                        Back to Orders
                    </button>
                    <div className="order-header-info">
                        <h1>Order #{order.id?.substring(0, 8)}</h1>
                        <div
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                        </div>
                    </div>
                </div>

                <div className="order-detail-grid">
                    {/* Order Information */}
                    <div className="order-info-card">
                        <h2>Order Information</h2>
                        <div className="info-row">
                            <Calendar size={20} />
                            <div>
                                <label>Order Date</label>
                                <p>{new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Package size={20} />
                            <div>
                                <label>Order ID</label>
                                <p>{order.id}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Truck size={20} />
                            <div>
                                <label>Payment Method</label>
                                <p>{order.paymentMethod || 'Cash on Delivery'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="order-info-card">
                        <h2>Shipping Information</h2>
                        <div className="info-row">
                            <User size={20} />
                            <div>
                                <label>Recipient Name</label>
                                <p>{order.shippingAddress?.name || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Phone size={20} />
                            <div>
                                <label>Phone Number</label>
                                <p>{order.shippingAddress?.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Mail size={20} />
                            <div>
                                <label>Email</label>
                                <p>{order.shippingAddress?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <MapPin size={20} />
                            <div>
                                <label>Delivery Address</label>
                                <p>
                                    {order.shippingAddress?.street}<br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                                    {order.shippingAddress?.country}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items and Summary Grid */}
                <div className="order-content-wrapper">
                    {/* Order Items */}
                    <div className="order-items-section">
                        <h2>Order Items</h2>
                        <div className="order-items-list">
                            {order.items?.map((item, index) => (
                                <div key={index} className="order-item-card">
                                    <img src={item.image} alt={item.name} className="item-image" />
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        {item.size && <p className="item-size">Size: {item.size}</p>}
                                        <p className="item-price">₹{item.price}</p>
                                    </div>
                                    <div className="item-quantity">
                                        <span>Quantity</span>
                                        <strong>{item.quantity}</strong>
                                    </div>
                                    <div className="item-total">
                                        <span>Total</span>
                                        <strong>₹{item.price * item.quantity}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <h2>Order Summary</h2>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <strong>₹{order.totalAmount}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
