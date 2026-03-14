import '../App.css';
import './HelpSupport.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';

const FAQ = [
    {
        q: 'How do I get started with AlgoZen?',
        a: 'Sign up for a free account, head to the Dashboard, and paste any DSA problem into the AI Solver. AlgoZen will retrieve relevant context and guide you with hints, explanations, or full solutions.',
    },
    {
        q: 'What is the daily request limit for free users?',
        a: 'Free plan users get 10 AI Solver requests per day. The count resets automatically at midnight. Upgrade to a premium plan for unlimited requests.',
    },
    {
        q: 'How does the Context Retrieval (RAG) pipeline work?',
        a: 'When you submit a problem, AlgoZen first identifies the problem type and retrieves curated editorial-quality DSA context. This context is bundled with your query before being sent to the AI model, resulting in far more accurate and relevant answers.',
    },
    {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes. You can cancel your subscription from your account settings at any time. You will retain access to premium features until the end of your current billing period.',
    },
    {
        q: 'Which payment methods are accepted?',
        a: 'AlgoZen uses Razorpay for secure payment processing. We accept all major credit/debit cards, UPI, net banking, and popular wallets.',
    },
    {
        q: 'Is my data safe with AlgoZen?',
        a: 'Yes. We do not sell or share your personal data with third parties. All chat history is stored securely in Firebase and is accessible only to you. Please refer to our Privacy Policy for full details.',
    },
    {
        q: 'How do I report a bug or technical issue?',
        a: 'Email us at algozensupport24@gmail.com with a description of the issue, your device/browser info, and any screenshots if possible. We aim to respond within 24 hours.',
    },
];

function HelpSupport() {
    const [openIndex, setOpenIndex] = useState(null);
    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    return (
        <>
            <Header />
            <main className="hs-page">

                {/* Ambient glow */}
                <div className="hs-bg-glow" />

                {/* ── Hero ── */}
                <section className="hs-hero">
                    <p className="eyebrow">Help &amp; Support</p>
                    <h1 className="hs-hero-h1">How can we help you?</h1>
                    <p className="lede hs-hero-lede">
                        Browse the FAQs below or reach out to our team directly —
                        we're here to make your AlgoZen experience seamless.
                    </p>
                </section>

                {/* ── Contact Cards ── */}
                <section className="hs-contact-grid">

                    <div className="hs-contact-card">
                        <div className="hs-contact-icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
                                <path d="M6 9l8 6 8-6" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="6" y="8" width="16" height="12" rx="3" stroke="#ff7e5f" strokeWidth="1.8" />
                            </svg>
                        </div>
                        <p className="hs-contact-label">Email Support</p>
                        <a className="hs-contact-value" href="mailto:algozensupport24@gmail.com">
                            algozensupport24@gmail.com
                        </a>
                        <p className="hs-contact-note">We respond within 24 hours, Mon – Sat</p>
                    </div>

                    <div className="hs-contact-card">
                        <div className="hs-contact-icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
                                <path d="M14 6a6 6 0 1 1 0 12A6 6 0 0 1 14 6z" stroke="#ff7e5f" strokeWidth="1.8" />
                                <path d="M14 22c-4 0-7 1.5-7 3h14c0-1.5-3-3-7-3z" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="hs-contact-label">Office Address</p>
                        <p className="hs-contact-value">Hyderabad, Telangana</p>
                        <p className="hs-contact-note">India — 500 001</p>
                    </div>

                    <div className="hs-contact-card">
                        <div className="hs-contact-icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
                                <circle cx="14" cy="14" r="6" stroke="#ff7e5f" strokeWidth="1.8" />
                                <path d="M14 11v3.5l2 2" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="hs-contact-label">Support Hours</p>
                        <p className="hs-contact-value">Mon – Sat, 9 AM – 7 PM</p>
                        <p className="hs-contact-note">IST (UTC +5:30)</p>
                    </div>

                </section>

                {/* ── FAQ ── */}
                <section className="hs-faq-section">
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>FAQs</p>
                    <h2 className="hs-faq-title">Frequently Asked Questions</h2>

                    <div className="hs-faq-list">
                        {FAQ.map(({ q, a }, i) => (
                            <div
                                key={i}
                                className={`hs-faq-item ${openIndex === i ? 'hs-faq-item--open' : ''}`}
                            >
                                <button className="hs-faq-q" onClick={() => toggle(i)}>
                                    <span>{q}</span>
                                    <span className="hs-faq-chevron">{openIndex === i ? '−' : '+'}</span>
                                </button>
                                {openIndex === i && (
                                    <p className="hs-faq-a">{a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Still need help banner ── */}
                <section className="hs-cta-banner">
                    <div className="hs-cta-glow" />
                    <h2 className="hs-cta-title">Still need help?</h2>
                    <p className="hs-cta-sub">
                        Our support team is just an email away. Drop us a line and we'll get back to you as soon as possible.
                    </p>
                    <a className="btn primary hs-cta-btn" href="mailto:algozensupport24@gmail.com">
                        Email Us →
                    </a>
                </section>

            </main>
            <Footer />
        </>
    );
}

export default HelpSupport;
