import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrders, cancelOrder } from '../api';
import { Package, Truck, CheckCircle, XCircle, ArrowLeft, Calendar, MapPin, Phone, Mail, User, FileText, Ban } from 'lucide-react';
import Invoice from '../components/Invoice';
import Toast from '../components/Toast';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [toast, setToast] = useState(null);

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

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        setCancelling(true);
        try {
            // Use the Firestore doc ID for the update
            const result = await cancelOrder(order.docId || order.id);
            if (result.success) {
                setToast({ message: 'Order cancelled successfully!', type: 'success' });
                // Refresh order details
                await fetchOrderDetail();
            } else {
                setToast({ message: result.error || 'Failed to cancel order', type: 'error' });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            setToast({ message: 'Error connecting to server', type: 'error' });
        } finally {
            setCancelling(false);
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
                        <div className="order-header-actions">
                            <div
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                            </div>

                            {/* Cancellation Button */}
                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                <button
                                    onClick={handleCancelOrder}
                                    className="cancel-order-button"
                                    disabled={cancelling}
                                >
                                    <Ban size={18} />
                                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            )}

                            <button onClick={() => setShowInvoice(true)} className="invoice-button">
                                <FileText size={18} />
                                View Invoice
                            </button>
                        </div>
                    </div>
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <div className="order-detail-grid">
                    {/* Customer Details - First */}
                    <div className="order-info-card">
                        <h2>Customer Details</h2>
                        <div className="info-row">
                            <User size={20} />
                            <div>
                                <label>Name</label>
                                <p>{order.shippingAddress?.fullName || order.userName}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Mail size={20} />
                            <div>
                                <label>Email</label>
                                <p>{order.shippingAddress?.email || order.userEmail}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <User size={20} />
                            <div>
                                <label>User ID</label>
                                <p>{order.userId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information - Second */}
                    <div className="order-info-card">
                        <h2>Shipping Address</h2>
                        <div className="info-row">
                            <User size={20} />
                            <div>
                                <label>Name</label>
                                <p>{order.shippingAddress?.fullName || order.userName}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Phone size={20} />
                            <div>
                                <label>Phone</label>
                                <p>{order.shippingAddress?.phone}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <Mail size={20} />
                            <div>
                                <label>Email</label>
                                <p>{order.shippingAddress?.email || order.userEmail}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <MapPin size={20} />
                            <div>
                                <label>Address</label>
                                <p>{order.shippingAddress?.address}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <MapPin size={20} />
                            <div>
                                <label>City</label>
                                <p>{order.shippingAddress?.city}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <MapPin size={20} />
                            <div>
                                <label>State</label>
                                <p>{order.shippingAddress?.state}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <MapPin size={20} />
                            <div>
                                <label>Pincode</label>
                                <p>{order.shippingAddress?.pincode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Information - Third */}
                    <div className="order-info-card">
                        <h2>Order Information</h2>
                        <div className="info-row">
                            <Package size={20} />
                            <div>
                                <label>Order ID</label>
                                <p>{order.id}</p>
                            </div>
                        </div>
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
                            <Truck size={20} />
                            <div>
                                <label>Payment Method</label>
                                <p>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
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

            {/* Invoice Modal */}
            {showInvoice && (
                <Invoice
                    order={order}
                    onClose={() => setShowInvoice(false)}
                />
            )}
        </div>
    );
};

export default OrderDetail;
