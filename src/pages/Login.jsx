import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const isFormValid = formData.email.trim() && formData.password.trim();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Sign in with email and password
            await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Navigate to dashboard on successful login
            navigate('/dashboard');
        } catch (error) {
            console.error('Error logging in:', error);

            // Handle Firebase errors
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email. Please sign up first.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again.');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address. Please check and try again.');
                    break;
                case 'auth/user-disabled':
                    setError('This account has been disabled. Please contact support.');
                    break;
                case 'auth/network-request-failed':
                    setError('Network error. Please check your connection and try again.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed login attempts. Please try again later.');
                    break;
                case 'auth/invalid-credential':
                    setError('Invalid email or password. Please check your credentials.');
                    break;
                default:
                    setError('Failed to log in. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <h1 className="login-heading">
                    Welcome back to<br />AlgoZen
                </h1>
                <p className="login-subtext">
                    Sign in to continue your DSA learning journey and track your progress.
                </p>

                <form className="login-form" onSubmit={handleLogin}>
                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1L1 15H15L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="8" cy="12" r="0.5" fill="currentColor" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            Email<span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="login-input"
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Password<span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="login-input"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${isFormValid && !isLoading ? 'active' : ''}`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="button-spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            'Log In'
                        )}
                    </button>

                    <div className="login-footer">
                        <p className="signup-prompt">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className="signup-link"
                                onClick={() => navigate('/signup')}
                                disabled={isLoading}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
