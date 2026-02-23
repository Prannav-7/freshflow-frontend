import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import Toast from './Toast';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fresh-flow-fa56.onrender.com';
const API_URL = `${API_BASE_URL}/api/auth`;

export default function Login() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [toast, setToast] = useState(null);
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

    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters long';
        if (isSignUp) {
            if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
            if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
            if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        }
        return '';
    };

    const validateDisplayName = (name) => {
        if (!name) return 'Display name is required';
        if (name.trim().length < 2) return 'Display name must be at least 2 characters long';
        if (name.trim().length > 50) return 'Display name must not exceed 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Display name can only contain letters and spaces';
        return '';
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 'none', color: 'transparent', text: '' };
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 'weak', color: '#ff4444', text: 'Weak' };
        if (strength <= 4) return { strength: 'medium', color: '#ffbb33', text: 'Medium' };
        return { strength: 'strong', color: '#00C851', text: 'Strong' };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null);

        let validationError = '';
        if (name === 'email') validationError = validateEmail(value);
        else if (name === 'password') validationError = validatePassword(value);
        else if (name === 'displayName' && isSignUp) validationError = validateDisplayName(value);

        setValidationErrors({ ...validationErrors, [name]: validationError });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        const errors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            displayName: validateDisplayName(formData.displayName)
        };
        setValidationErrors(errors);
        if (Object.values(errors).some(v => v)) return;

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
                setToast({ type: 'success', message: `Welcome ${data.user.displayName || 'to Fresh Flow'}! Account created successfully.` });
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                setTimeout(() => navigate('/'), 4000);
            } else {
                setError(data.error || 'Sign up failed');
            }
        } catch (err) {
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        const errors = {
            email: validateEmail(formData.email),
            password: formData.password ? '' : 'Password is required'
        };
        setValidationErrors(errors);
        if (Object.values(errors).some(v => v)) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Login successful!');
                setToast({ type: 'success', message: `Welcome back, ${data.user.displayName || data.user.email}! Login successful.` });
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                const redirectPath = localStorage.getItem('redirectAfterLogin');
                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath);
                    } else {
                        navigate('/');
                    }
                }, 4000);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const additionalUserInfo = getAdditionalUserInfo(result);
            const isNewUser = additionalUserInfo?.isNewUser;

            const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    isNewUser: isNewUser
                })
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Login successful with Google!');
                setToast({ type: 'success', message: `Welcome, ${data.user.displayName || 'User'}! Login successful with Google.` });
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                const redirectPath = localStorage.getItem('redirectAfterLogin');
                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath);
                    } else {
                        navigate('/');
                    }
                }, 4000);
            } else {
                setError(data.error || 'Google login failed');
            }
        } catch (err) {
            setError('Error connecting to Google: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await fetch(`${API_URL}/signout`, { method: 'POST' });
            setUser(null);
            localStorage.removeItem('user');
            setToast({ type: 'success', message: 'Signed out successfully. Come back soon!' });
        } catch (err) {
            setError('Error signing out: ' + err.message);
        }
    };

    // Dashboard View
    if (user) {
        return (
            <div className="login-container">
                <div className="login-card dashboard">
                    <div className="welcome-section">
                        <div className="avatar">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="avatar-img" />
                            ) : (
                                user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                            )}
                        </div>
                        <h2>Welcome!</h2>
                        <p className="user-email">{user.email}</p>
                        <p className="user-name">{user.displayName || 'User'}</p>
                        <span className="user-role">{user.role}</span>
                    </div>
                    <div className="user-info">
                        <h3>Account Details</h3>
                        <div className="info-item"><span className="label">User ID:</span><span className="value">{user.uid}</span></div>
                        <div className="info-item"><span className="label">Email:</span><span className="value">{user.email}</span></div>
                        <div className="info-item"><span className="label">Name:</span><span className="value">{user.displayName || 'Not set'}</span></div>
                        <div className="info-item"><span className="label">Role:</span><span className="value">{user.role}</span></div>
                    </div>
                    <button onClick={handleSignOut} className="btn btn-signout">Sign Out</button>
                    {success && <div className="alert alert-success">{success}</div>}
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }

    // Auth Forms View
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
                            <label>Display Name</label>
                            <input name="displayName" value={formData.displayName} onChange={handleChange} placeholder="Enter your name" className={validationErrors.displayName ? 'input-error' : ''} />
                            {validationErrors.displayName && <span className="error-message">{validationErrors.displayName}</span>}
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className={validationErrors.email ? 'input-error' : ''} />
                        {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className={validationErrors.password ? 'input-error' : ''} />
                            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {validationErrors.password && <span className="error-message">{validationErrors.password}</span>}
                        {isSignUp && formData.password && !validationErrors.password && (
                            <div className="password-strength">
                                <div className="strength-bar-container">
                                    <div className="strength-bar" style={{ width: getPasswordStrength(formData.password).strength === 'weak' ? '33%' : getPasswordStrength(formData.password).strength === 'medium' ? '66%' : '100%', backgroundColor: getPasswordStrength(formData.password).color }}></div>
                                </div>
                                <span className="strength-text" style={{ color: getPasswordStrength(formData.password).color }}>Strength: {getPasswordStrength(formData.password).text}</span>
                            </div>
                        )}
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}</button>
                </form>

                <div className="divider"><span>OR</span></div>
                <button type="button" className="btn btn-google" onClick={handleGoogleSignIn} disabled={loading}>
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>
                <div className="toggle-form">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="link-button">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
