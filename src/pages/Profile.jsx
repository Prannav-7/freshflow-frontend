import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Lock, MapPin, LogOut, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import './Profile.css';
import { getOrders, updateUserProfile as updateProfileAPI, changePassword as changePasswordAPI } from '../api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Check if user is logged in
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(savedUser);
        setUser(userData);
        setFormData({
            displayName: userData.displayName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        // Fetch user's orders
        fetchUserOrders(userData.uid);
    }, [navigate]);

    const fetchUserOrders = async (userId) => {
        try {
            const allOrders = await getOrders();
            const userOrders = allOrders.filter(order => order.userId === userId);
            setOrders(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        try {
            // Call API to update profile in database
            const result = await updateProfileAPI(user.uid, {
                displayName: formData.displayName,
                phone: formData.phone
            });

            if (result.success) {
                // Update user data in localStorage
                const updatedUser = {
                    ...user,
                    displayName: formData.displayName,
                    phone: formData.phone
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert(`Error: ${result.error || 'Failed to update profile'}`);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleChangePassword = async () => {
        // Validation
        if (!formData.currentPassword) {
            alert('Please enter your current password');
            return;
        }
        if (!formData.newPassword) {
            alert('Please enter a new password');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (formData.newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        try {
            // Call API to change password
            const result = await changePasswordAPI(
                user.email,
                formData.currentPassword,
                formData.newPassword
            );

            if (result.success) {
                alert('Password changed successfully! Please login again with your new password.');
                // Clear password fields
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                alert(`Error: ${result.error || 'Failed to change password'}`);
            }
        } catch (error) {
            console.error('Password change error:', error);
            alert('Failed to change password. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
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

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <User size={48} />
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.displayName || 'User Profile'}</h1>
                        <p>{user?.email}</p>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>

                <div className="profile-content">
                    <div className="profile-tabs">
                        <button
                            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            <User size={20} />
                            Personal Info
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <Package size={20} />
                            Order History ({orders.length})
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={20} />
                            Security
                        </button>
                    </div>

                    <div className="profile-tab-content">
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <div className="tab-panel">
                                <div className="panel-header">
                                    <h2>Personal Information</h2>
                                    {!isEditing ? (
                                        <button className="edit-button" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={18} />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="edit-actions">
                                            <button className="save-button" onClick={handleSaveProfile}>
                                                <Save size={18} />
                                                Save
                                            </button>
                                            <button className="cancel-button" onClick={() => setIsEditing(false)}>
                                                <X size={18} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            title="Email cannot be changed"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>User ID</label>
                                        <input
                                            type="text"
                                            value={user?.uid || 'N/A'}
                                            disabled
                                            title="Cannot be changed"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order History Tab */}
                        {activeTab === 'orders' && (
                            <div className="tab-panel">
                                <h2>Order History</h2>
                                {orders.length > 0 ? (
                                    <div className="orders-list">
                                        {orders.map(order => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-header">
                                                    <div>
                                                        <h3>Order #{order.id?.substring(0, 8)}</h3>
                                                        <p className="order-date">
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="order-status"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <div className="order-items">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="order-item">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="order-item-image"
                                                            />
                                                            <div className="order-item-details">
                                                                <p className="item-name">{item.name}</p>
                                                                <p className="item-quantity">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="item-price">₹{item.price}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="order-footer">
                                                    <div className="order-total">
                                                        <span>Total Amount:</span>
                                                        <strong>₹{order.totalAmount}</strong>
                                                    </div>
                                                    <Link to={`/orders/${order.id}`} className="view-details-btn">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Package size={64} color="#ddd" />
                                        <h3>No Orders Yet</h3>
                                        <p>Start shopping to see your order history here!</p>
                                        <Link to="/products" className="shop-now-btn">
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="tab-panel">
                                <h2>Security Settings</h2>
                                <div className="security-section">
                                    <h3>Change Password</h3>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label>Current Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>New Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="change-password-btn" onClick={handleChangePassword}>
                                        <Lock size={18} />
                                        Change Password
                                    </button>
                                </div>

                                <div className="security-info">
                                    <h3>Account Security Tips</h3>
                                    <ul>
                                        <li>Use a strong password with at least 8 characters</li>
                                        <li>Don't share your password with anyone</li>
                                        <li>Change your password regularly</li>
                                        <li>Enable two-factor authentication when available</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
