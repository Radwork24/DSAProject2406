import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './Pricing.css'; // Reuse pricing styles for simplicity

function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, error

    useEffect(() => {
        const processPayment = async () => {
            const sessionId = searchParams.get('session_id');
            const planName = searchParams.get('plan');
            const durationMonths = parseInt(searchParams.get('duration'), 10);

            if (!sessionId || !planName || isNaN(durationMonths)) {
                setStatus('error');
                return;
            }

            const user = auth.currentUser;
            if (!user) {
                // If not logged in, wait a bit for Firebase auth to initialize
                setTimeout(async () => {
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        await updateSubscription(currentUser, sessionId, planName, durationMonths);
                    } else {
                        setStatus('error');
                    }
                }, 2000);
                return;
            }

            await updateSubscription(user, sessionId, planName, durationMonths);
        };

        const updateSubscription = async (user, sessionId, planName, durationMonths) => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                let startDate = new Date();
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    // If this exact session was already processed, skip
                    if (data.recentPayment && data.recentPayment.id === sessionId) {
                        setStatus('success');
                        return;
                    }

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
                    requestCount: 0,
                    subscriptionStartDate: serverTimestamp(),
                    subscriptionEndDate: endDate,
                    recentPayment: {
                        id: sessionId,
                        provider: 'dodo_payments',
                        date: new Date().toISOString()
                    }
                });

                setStatus('success');
            } catch (error) {
                console.error('Error updating subscription:', error);
                setStatus('error');
            }
        };

        processPayment();
    }, [searchParams]);

    return (
        <div className="pricing-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            {status === 'processing' && (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--text-color)' }}>Verifying your payment...</h2>
                    <p style={{ color: '#8b949e', marginTop: '10px' }}>Please don't close this page.</p>
                </div>
            )}
            
            {status === 'success' && (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid #30363d' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(46, 160, 67, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    <h2 style={{ color: '#3fb950', marginBottom: '16px' }}>Payment Successful!</h2>
                    <p style={{ color: '#8b949e', marginBottom: '24px' }}>Your premium subscription is now active.</p>
                    <button 
                        className="plan-action-btn primary-btn"
                        onClick={() => navigate('/dashboard')}
                        style={{ width: 'auto', padding: '12px 32px' }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid #30363d' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(248, 81, 73, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                    </div>
                    <h2 style={{ color: '#f85149', marginBottom: '16px' }}>Verification Failed</h2>
                    <p style={{ color: '#8b949e', marginBottom: '24px' }}>We couldn't verify your payment. Please contact support if you were charged.</p>
                    <button 
                        className="plan-action-btn secondary-btn"
                        onClick={() => navigate('/pricing')}
                        style={{ width: 'auto', padding: '12px 32px' }}
                    >
                        Return to Pricing
                    </button>
                </div>
            )}
        </div>
    );
}

export default PaymentSuccess;
