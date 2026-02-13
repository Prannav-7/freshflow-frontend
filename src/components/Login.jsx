import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
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

    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email is required';
        }
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (isSignUp) {
            if (!/[A-Z]/.test(password)) {
                return 'Password must contain at least one uppercase letter';
            }
            if (!/[a-z]/.test(password)) {
                return 'Password must contain at least one lowercase letter';
            }
            if (!/[0-9]/.test(password)) {
                return 'Password must contain at least one number';
            }
        }
        return '';
    };

    const validateDisplayName = (name) => {
        if (!name) {
            return 'Display name is required';
        }
        if (name.trim().length < 2) {
            return 'Display name must be at least 2 characters long';
        }
        if (name.trim().length > 50) {
            return 'Display name must not exceed 50 characters';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Display name can only contain letters and spaces';
        }
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

        if (strength <= 2) {
            return { strength: 'weak', color: '#ff4444', text: 'Weak' };
        } else if (strength <= 4) {
            return { strength: 'medium', color: '#ffbb33', text: 'Medium' };
        } else {
            return { strength: 'strong', color: '#00C851', text: 'Strong' };
        }
    };

    // Handle input changes with real-time validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError(null);

        // Real-time validation
        let validationError = '';
        if (name === 'email') {
            validationError = validateEmail(value);
        } else if (name === 'password') {
            validationError = validatePassword(value);
        } else if (name === 'displayName' && isSignUp) {
            validationError = validateDisplayName(value);
        }

        setValidationErrors({
            ...validationErrors,
            [name]: validationError
        });
    };

    // Validate entire form before submission
    const validateForm = () => {
        const errors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            displayName: isSignUp ? validateDisplayName(formData.displayName) : ''
        };

        setValidationErrors(errors);

        // Return true if no errors
        return !Object.values(errors).some(error => error !== '');
    };

    // Handle Sign Up
    const handleSignUp = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            setError('Please fix the validation errors before submitting');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });


            const data = await response.json();
            console.log('Signup response:', { status: response.status, data });

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
                setValidationErrors({ email: '', password: '', displayName: '' });

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
                console.warn('Signup rejected by server:', data);
                let msg = data.error || 'Sign up failed';
                if (data.code === 'auth/email-already-in-use') {
                    msg = "This email is already registered. Please go to 'Sign In' instead.";
                }
                setError(msg);
            }
        } catch (err) {
            console.error('Signup connection error:', err);
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Sign In
    const handleSignIn = async (e) => {
        e.preventDefault();

        // Validate email and password
        const emailError = validateEmail(formData.email);
        const passwordError = formData.password ? '' : 'Password is required';

        if (emailError || passwordError) {
            setValidationErrors({
                ...validationErrors,
                email: emailError,
                password: passwordError
            });
            setError('Please enter valid credentials');
            return;
        }

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
            console.log('Signin response:', { status: response.status, data });

            if (data.success) {
                setSuccess('Login successful!');
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch custom event to update header immediately
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                setFormData({ email: '', password: '', displayName: '' });
                setValidationErrors({ email: '', password: '', displayName: '' });

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
                console.warn('Signin rejected by server:', data);
                let msg = data.error || 'Login failed';
                if (response.status === 401) {
                    msg = "Incorrect password or account was created via Google. Try 'Continue with Google'.";
                }
                setError(msg);
            }
        } catch (err) {
            console.error('Signin connection error:', err);
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Google Sign In
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Send Google user data to our backend to sync with Firestore
            const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Login successful with Google!');
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch custom event to update header immediately
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

                // Check for redirect path
                const redirectPath = localStorage.getItem('redirectAfterLogin');

                // Redirect
                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath);
                    } else {
                        navigate('/');
                    }
                }, 1000);
            } else {
                setError(data.error || 'Google login failed');
            }
        } catch (err) {
            console.error('Google Sign-in Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Login cancelled. Please try again.');
            } else {
                setError('Error connecting to Google: ' + err.message);
            }
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
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="avatar-img" />
                            ) : (
                                user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                            )}
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
                                className={validationErrors.displayName ? 'input-error' : ''}
                            />
                            {validationErrors.displayName && (
                                <span className="error-message">{validationErrors.displayName}</span>
                            )}
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
                            className={validationErrors.email ? 'input-error' : ''}
                        />
                        {validationErrors.email && (
                            <span className="error-message">{validationErrors.email}</span>
                        )}
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
                                className={validationErrors.password ? 'input-error' : ''}
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
                        {validationErrors.password && (
                            <span className="error-message">{validationErrors.password}</span>
                        )}
                        {isSignUp && formData.password && !validationErrors.password && (
                            <div className="password-strength">
                                <div className="strength-bar-container">
                                    <div
                                        className="strength-bar"
                                        style={{
                                            width: getPasswordStrength(formData.password).strength === 'weak' ? '33%' :
                                                getPasswordStrength(formData.password).strength === 'medium' ? '66%' : '100%',
                                            backgroundColor: getPasswordStrength(formData.password).color
                                        }}
                                    ></div>
                                </div>
                                <span className="strength-text" style={{ color: getPasswordStrength(formData.password).color }}>
                                    Password Strength: {getPasswordStrength(formData.password).text}
                                </span>
                            </div>
                        )}
                        {isSignUp && (
                            <p className="password-requirements">
                                Password must be at least 6 characters and contain uppercase, lowercase, and a number
                            </p>
                        )}
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

                <div className="divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="btn btn-google"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className="toggle-form">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setSuccess(null);
                                setFormData({ email: '', password: '', displayName: '' });
                                setValidationErrors({ email: '', password: '', displayName: '' });
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
