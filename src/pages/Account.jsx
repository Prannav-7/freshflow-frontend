import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, LogOut, ShoppingBag, Heart } from 'lucide-react';
import './Account.css';

const Account = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            alert('Please login to view your account');
            navigate('/login');
            return;
        }
        setUser(JSON.parse(savedUser));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="account-page">
            <div className="container">
                <div className="account-content">
                    <div className="account-sidebar">
                        <div className="user-welcome">
                            <div className="user-avatar-large">
                                {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <h2>{user.displayName || 'User'}</h2>
                            <p>{user.email}</p>
                            <span className="user-role-badge">{user.role || 'user'}</span>
                        </div>

                        <nav className="account-nav">
                            <a href="#profile" className="nav-item active">
                                <User size={20} />
                                <span>My Profile</span>
                            </a>
                            <Link to="/cart" className="nav-item">
                                <ShoppingBag size={20} />
                                <span>My Orders</span>
                            </Link>
                            <Link to="/wishlist" className="nav-item">
                                <Heart size={20} />
                                <span>Wishlist</span>
                            </Link>
                            <button onClick={handleLogout} className="nav-item logout">
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>

                    <div className="account-main">
                        <div className="account-section">
                            <h2>Personal Information</h2>

                            <div className="info-grid">
                                <div className="info-card">
                                    <div className="info-icon">
                                        <User size={24} />
                                    </div>
                                    <div className="info-content">
                                        <label>Full Name</label>
                                        <p>{user.displayName || 'Not set'}</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <Mail size={24} />
                                    </div>
                                    <div className="info-content">
                                        <label>Email Address</label>
                                        <p>{user.email}</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <Shield size={24} />
                                    </div>
                                    <div className="info-content">
                                        <label>User ID</label>
                                        <p className="user-id">{user.uid}</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="info-content">
                                        <label>Member Since</label>
                                        <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="account-section">
                            <h2>Account Status</h2>
                            <div className="status-grid">
                                <div className="status-item">
                                    <span className="status-label">Account Status</span>
                                    <span className="status-value active">Active</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-label">Role</span>
                                    <span className="status-value">{user.role || 'User'}</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-label">Last Login</span>
                                    <span className="status-value">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="account-actions">
                            <Link to="/products" className="action-btn primary">
                                Continue Shopping
                            </Link>
                            <Link to="/cart" className="action-btn secondary">
                                View Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
