import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './Pricing.css';

function Pricing() {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('Yearly');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async (planName, amount, durationMonths) => {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to purchase a subscription.');
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!keyId) {
                throw new Error('Razorpay key is not configured. Add VITE_RAZORPAY_KEY_ID to your .env file.');
            }
            if (typeof window.Razorpay === 'undefined') {
                throw new Error('Razorpay checkout script failed to load. Check your connection and refresh.');
            }

            // 1. Create order on the backend
            const baseUrl = '';
            const res = await fetch(`${baseUrl}/api/createOrder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, receipt: user.uid }),
            });
            const order = await res.json();

            if (!res.ok) {
                throw new Error(order?.error || `Server error (${res.status}). Check that the dev server is running and Razorpay keys are set.`);
            }
            if (!order || !order.id) {
                throw new Error(order?.error || 'Failed to create order');
            }

            // 2. Open Razorpay Checkout Modal
            const options = {
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: "AlgoZen Premium",
                description: `Subscription for ${planName}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await fetch(`${baseUrl}/api/verifyPayment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            // 4. Update Firebase Firestore
                            const userRef = doc(db, 'users', user.uid);
                            const userSnap = await getDoc(userRef);

                            let startDate = new Date();
                            if (userSnap.exists()) {
                                const data = userSnap.data();
                                // Stack subscriptions if they already have an active one
                                if (data.subscriptionEndDate && data.subscriptionEndDate.toDate() > new Date()) {
                                    startDate = data.subscriptionEndDate.toDate();
                                }
                            }

                            const endDate = new Date(startDate);
                            endDate.setMonth(endDate.getMonth() + durationMonths);

                            await updateDoc(userRef, {
                                isPremium: true,
                                plan: planName,
                                requestCount: 0, // reset requests
                                subscriptionStartDate: serverTimestamp(),
                                subscriptionEndDate: endDate,
                                recentPayment: {
                                    id: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id,
                                    date: new Date().toISOString()
                                }
                            });

                            alert('Payment successful! Your premium subscription is active.');
                            navigate('/dashboard');
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Error verifying payment:', error);
                        alert('Error updating subscription. Please check your dashboard or contact support.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    email: user.email,
                },
                theme: {
                    color: "#0b0f19" // matching AlgoZen dark vibe
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error(response.error);
                alert('Payment Failed: ' + response.error.description);
                setIsProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            const message = error?.message || 'Could not initiate payment. Please try again.';
            alert(message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="pricing-container">
            <header className="pricing-header">
                <h1>Plans that grow with you</h1>
            </header>

            <div className="pricing-cards">
                {/* 1 Month Plan */}
                <div className="pricing-card free-card">
                    <div className="card-header">
                        <div className="plan-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 9v-6"></path>
                                <path d="M12 15v6"></path>
                                <path d="M9 12h-6"></path>
                                <path d="M15 12h6"></path>
                            </svg>
                        </div>
                        <h2>1 Month</h2>
                        <p className="plan-desc">Short-term access to premium features</p>
                        <div className="price-container">
                            <span className="price">₹99</span>
                            <div className="price-period">
                                <div>INR</div>
                                <div>billed monthly</div>
                            </div>
                        </div>
                        <button className="plan-action-btn secondary-btn" disabled={isProcessing} onClick={() => handlePayment('1 Month', 99, 1)}>
                            {isProcessing ? 'Processing...' : 'Get 1 Month Plan'}
                        </button>
                    </div>
                    <div className="card-features">
                        <ul>
                            <li><CheckIcon /> Unlimited daily requests</li>
                            <li><CheckIcon /> Advanced Code Generation</li>
                            <li><CheckIcon /> Debugging features</li>
                            <li><CheckIcon /> Early access to new algorithms</li>
                        </ul>
                    </div>
                </div>

                {/* 3 Month Plan */}
                <div className="pricing-card pro-card">
                    <div className="card-header">
                        <div className="plan-icon-row">
                            <div className="plan-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M12 9v-6"></path>
                                    <path d="M12 15v6"></path>
                                    <path d="M9 12h-6"></path>
                                    <path d="M15 12h6"></path>
                                    <circle cx="18" cy="6" r="2"></circle>
                                    <path d="M16.5 7.5L14 10"></path>
                                </svg>
                            </div>
                        </div>
                        <h2>3 Months</h2>
                        <p className="plan-desc">Best value for your semester</p>
                        <div className="price-container">
                            <span className="price">₹249</span>
                            <div className="price-period">
                                <div>INR</div>
                                <div>billed every 3 months</div>
                            </div>
                        </div>
                        <button className="plan-action-btn primary-btn" disabled={isProcessing} onClick={() => handlePayment('3 Months', 249, 3)}>
                            {isProcessing ? 'Processing...' : 'Get 3 Month Plan'}
                        </button>
                    </div>
                    <div className="card-features">
                        <p className="feature-title">Everything in 1 Month, and:</p>
                        <ul>
                            <li><CheckIcon /> Save ~16% compared to monthly</li>
                            <li><CheckIcon /> Dedicated priority support</li>
                            <li><CheckIcon /> Exclusive interview prep guides</li>
                        </ul>
                    </div>
                </div>

                {/* Yearly Plan */}
                <div className="pricing-card max-card">
                    <div className="card-header">
                        <div className="plan-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 9v-6"></path>
                                <path d="M12 15v6"></path>
                                <path d="M9 12h-6"></path>
                                <path d="M15 12h6"></path>
                                <circle cx="18" cy="6" r="2"></circle>
                                <path d="M16.5 7.5L14 10"></path>
                                <circle cx="6" cy="18" r="2"></circle>
                                <path d="M7.5 16.5L10 14"></path>
                                <circle cx="6" cy="6" r="2"></circle>
                                <path d="M7.5 7.5L10 10"></path>
                            </svg>
                        </div>
                        <h2>12 Months</h2>
                        <p className="plan-desc">Maximum savings, ultimate access</p>
                        <div className="price-container">
                            <span className="price">₹999</span>
                            <div className="price-period">
                                <div>INR</div>
                                <div>billed annually</div>
                            </div>
                        </div>
                        <button className="plan-action-btn primary-btn" disabled={isProcessing} onClick={() => handlePayment('12 Months', 999, 12)}>
                            {isProcessing ? 'Processing...' : 'Get Yearly Plan'}
                        </button>
                    </div>
                    <div className="card-features">
                        <p className="feature-title">Everything in 3 Months, plus:</p>
                        <ul>
                            <li><CheckIcon /> Maximum discount (save ~16% more)</li>
                            <li><CheckIcon /> 1-on-1 Mock Interview Session</li>
                            <li><CheckIcon /> Resume review</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="pricing-footer">
                *Usage limits apply. Prices shown don't include applicable tax.
            </div>
        </div>
    );
}

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default Pricing;
