import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrder } from '../../api';
import { ShoppingBag, Search, Eye, Package, Calendar, User, MapPin } from 'lucide-react';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is admin - only specific emails allowed
        const ADMIN_EMAILS = ['psujeeth02@gmail.com', 'prannavp803@gmail.com'];

        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(savedUser);

        // Check if user has admin role or is in the fallback admin list
        const fallbackAdmins = ['psujeeth02@gmail.com', 'prannavp803@gmail.com', 'info.iyarkaivalari@gmail.com'];
        if (userData.role !== 'admin' && !fallbackAdmins.includes(userData.email)) {
            // Redirect to home page without alert for non-admin users
            navigate('/');
            return;
        }

        setUser(userData);
        fetchOrders();
    }, [navigate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            // Sort by date, newest first
            const sortedOrders = (data || []).sort((a, b) =>
                new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const result = await updateOrder(orderId, { status: newStatus });
            if (result.success) {
                // Update the order in the local state
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
                alert('Order status updated successfully!');
            } else {
                alert('Failed to update order status: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="orders-page">
            <div className="op-header">
                <div>
                    <h1><ShoppingBag size={32} /> Orders Management</h1>
                    <p>View and manage all customer orders</p>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
            </div>

            <div className="op-controls">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by customer name, email, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="status-filter">
                    <label>Status:</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="orders-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{filteredOrders.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">
                        ₹{filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header-section">
                                <div className="order-id-section">
                                    <span className="order-label">Order ID:</span>
                                    <span className="order-id">{order.id?.substring(0, 12)}...</span>
                                </div>
                                <div className="status-controls">
                                    <span className={`status-badge ${order.status || 'pending'}`}>
                                        {order.status || 'pending'}
                                    </span>
                                    <select
                                        className="status-dropdown"
                                        value={order.status || 'pending'}
                                        onChange={(e) => handleStatusChange(order.docId || order.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="order-body">
                                <div className="order-info-grid">
                                    <div className="info-item">
                                        <User size={16} />
                                        <div>
                                            <span className="info-label">Customer</span>
                                            <span className="info-value">{order.userName || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <Package size={16} />
                                        <div>
                                            <span className="info-label">Items</span>
                                            <span className="info-value">{order.items?.length || 0} products</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <div>
                                            <span className="info-label">Order Date</span>
                                            <span className="info-value">{formatDate(order.orderDate || order.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="info-item total">
                                        <span className="info-label">Total Amount</span>
                                        <span className="info-value">₹{order.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="order-items-preview">
                                    <h4>Order Items:</h4>
                                    <div className="items-list">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="item-preview">
                                                <img src={item.image} alt={item.name} />
                                                <div className="item-details">
                                                    <span className="item-name">{item.name}</span>
                                                    {item.size && (
                                                        <span className="item-size" style={{ color: '#22c55e', fontSize: '0.85rem' }}>
                                                            {item.size}
                                                        </span>
                                                    )}
                                                    <span className="item-quantity">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="item-price">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {order.shippingAddress && (
                                    <div className="shipping-info">
                                        <h4><MapPin size={16} /> Shipping Address</h4>
                                        <p>{order.shippingAddress.fullName}</p>
                                        <p>{order.shippingAddress.address}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                        <p>Phone: {order.shippingAddress.phone}</p>
                                    </div>
                                )}
                            </div>

                            <div className="order-actions">
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="view-details-btn"
                                >
                                    <Eye size={16} />
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="no-orders">
                            <ShoppingBag size={60} color="#ccc" />
                            <p>No orders found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="close-modal">×</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Order Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Order ID:</span>
                                        <span className="detail-value">{selectedOrder.id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <span className={`status-badge ${selectedOrder.status}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Order Date:</span>
                                        <span className="detail-value">{formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Payment Method:</span>
                                        <span className="detail-value">{selectedOrder.paymentMethod?.toUpperCase() || 'COD'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Customer Details</h3>
                                <p><strong>Name:</strong> {selectedOrder.userName}</p>
                                <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                                <p><strong>User ID:</strong> {selectedOrder.userId}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Shipping Address</h3>
                                {selectedOrder.shippingAddress && (
                                    <>
                                        <p><strong>Name:</strong> {selectedOrder.shippingAddress.fullName}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                                        <p><strong>Email:</strong> {selectedOrder.shippingAddress.email}</p>
                                        <p><strong>Address:</strong> {selectedOrder.shippingAddress.address}</p>
                                        <p><strong>City:</strong> {selectedOrder.shippingAddress.city}</p>
                                        <p><strong>State:</strong> {selectedOrder.shippingAddress.state}</p>
                                        <p><strong>Pincode:</strong> {selectedOrder.shippingAddress.pincode}</p>
                                    </>
                                )}
                            </div>

                            <div className="detail-section">
                                <h3>Order Summary</h3>
                                <div className="order-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedOrder.subtotal}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Delivery Charge:</span>
                                        <span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <span>₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
