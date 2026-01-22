import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fresh-flow-fa56.onrender.com';
const API_URL = `${API_BASE_URL}/api/auth`;

function Login() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
    };

    // Handle Sign Up
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });


            const data = await response.json();

            if (data.success) {
                setSuccess('Account created successfully! Redirecting...');
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch custom event to update header immediately
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                // Check if there's a redirect path
                const redirectPath = localStorage.getItem('redirectAfterLogin');

                // Clear the form
                setFormData({ email: '', password: '', displayName: '' });

                // Redirect immediately to home or saved path
                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath);
                    } else {
                        navigate('/');
                    }
                }, 500); // Short delay just to show success message
            } else {
                setError(data.error || 'Sign up failed');
            }
        } catch (err) {
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Sign In
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Login successful!');
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch custom event to update header immediately
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                setFormData({ email: '', password: '', displayName: '' });

                // Check for redirect path
                const redirectPath = localStorage.getItem('redirectAfterLogin');

                // Handle pending cart item
                const pendingCartItem = localStorage.getItem('pendingCartItem');
                if (pendingCartItem) {
                    localStorage.removeItem('pendingCartItem');
                }

                // Redirect to previous page or home
                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath);
                    } else {
                        navigate('/');
                    }
                }, 1000);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Sign Out
    const handleSignOut = async () => {
        try {
            await fetch(`${API_URL}/signout`, { method: 'POST' });
            setUser(null);
            localStorage.removeItem('user');
            setSuccess('Signed out successfully');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Error signing out: ' + err.message);
        }
    };

    // If user is logged in, show user dashboard
    if (user) {
        return (
            <div className="login-container">
                <div className="login-card dashboard">
                    <div className="welcome-section">
                        <div className="avatar">
                            {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <h2>Welcome back!</h2>
                        <p className="user-email">{user.email}</p>
                        <p className="user-name">{user.displayName || 'User'}</p>
                        <span className="user-role">{user.role}</span>
                    </div>

                    <div className="user-info">
                        <h3>Account Details</h3>
                        <div className="info-item">
                            <span className="label">User ID:</span>
                            <span className="value">{user.uid}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Email:</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Display Name:</span>
                            <span className="value">{user.displayName || 'Not set'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Role:</span>
                            <span className="value">{user.role}</span>
                        </div>
                    </div>

                    <button onClick={handleSignOut} className="btn btn-signout">
                        Sign Out
                    </button>

                    {success && <div className="alert alert-success">{success}</div>}
                </div>
            </div>
        );
    }

    // Login/Signup Form
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p>{isSignUp ? 'Sign up to get started' : 'Sign in to your account'}</p>
                </div>

                <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                minLength="6"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="toggle-form">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setSuccess(null);
                            }}
                            className="link-button"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
