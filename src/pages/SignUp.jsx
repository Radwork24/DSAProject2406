import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import './SignUp.css';

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        month: '',
        day: '',
        year: '',
        country: 'India'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const countries = [
        'Afghanistan', 'Argentina', 'Australia', 'Bangladesh', 'Brazil',
        'Canada', 'China', 'Egypt', 'France', 'Germany',
        'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
        'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia',
        'Mexico', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria',
        'Pakistan', 'Philippines', 'Poland', 'Russia', 'Saudi Arabia',
        'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
        'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine',
        'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const isFormValid = formData.name.trim() &&
        formData.email.trim() &&
        formData.password.trim() &&
        formData.confirmPassword.trim() &&
        formData.month &&
        formData.day &&
        formData.year &&
        formData.country;

    const handleContinue = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Update user profile with name
            await updateProfile(userCredential.user, {
                displayName: formData.name
            });

            // Store user data in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                name: formData.name,
                email: formData.email,
                birthdate: {
                    month: formData.month,
                    day: formData.day,
                    year: formData.year
                },
                country: formData.country,
                createdAt: new Date().toISOString()
            });

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error signing up:', error);

            // Handle Firebase errors
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('This email is already registered. Please use a different email.');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address. Please check and try again.');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak. Please use a stronger password.');
                    break;
                case 'auth/network-request-failed':
                    setError('Network error. Please check your connection and try again.');
                    break;
                default:
                    setError(error.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-content">
                <h1 className="signup-heading">
                    Let's add some details to<br />your account
                </h1>
                <p className="signup-subtext">
                    This helps provide you with age-appropriate settings. Your data is securely protected with encryption and other security best practices.
                </p>

                <form className="signup-form" onSubmit={handleContinue}>
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
                            Name<span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder="Enter your name"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email<span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="signup-input"
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
                            className="signup-input"
                            placeholder="Create a password (min. 6 characters)"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Confirm Password<span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder="Confirm your password"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Birthdate<span className="required">*</span>
                        </label>
                        <div className="birthdate-selects">
                            <div className="select-wrapper month-select">
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    className="signup-select"
                                    disabled={isLoading}
                                >
                                    <option value="">Month</option>
                                    {months.map((month) => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                                <div className="select-arrow">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="select-wrapper">
                                <select
                                    name="day"
                                    value={formData.day}
                                    onChange={handleChange}
                                    className="signup-select"
                                    disabled={isLoading}
                                >
                                    <option value="">Day</option>
                                    {days.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                                <div className="select-arrow">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="select-wrapper">
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="signup-select"
                                    disabled={isLoading}
                                >
                                    <option value="">Year</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="select-arrow">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Country / region<span className="required">*</span>
                        </label>
                        <div className="country-select-wrapper select-wrapper">
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="signup-select"
                                disabled={isLoading}
                            >
                                {countries.map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                            <div className="select-arrow">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <p className="signup-terms">
                        By continuing to use AlgoZen, you agree to the{' '}
                        <a href="#terms">Terms of Use</a>. See our{' '}
                        <a href="#privacy">Privacy Statement</a>.
                    </p>

                    <button
                        type="submit"
                        className={`continue-button ${isFormValid && !isLoading ? 'active' : ''}`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="button-spinner"></span>
                                Creating account...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>

                    <div className="signup-footer">
                        <p className="login-prompt">
                            Already have an account?{' '}
                            <button
                                type="button"
                                className="login-link"
                                onClick={() => navigate('/login')}
                                disabled={isLoading}
                            >
                                Log in
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
