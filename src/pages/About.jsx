import '../App.css';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const MILESTONES = [
    { year: 'Nov 2025', event: 'AlgoZen founded by the RAD 24 Lab team at Hyderabad.' },
    { year: 'Dec 2025', event: 'Launched the AI Solver with Context Retrieval (RAG) pipeline — the first DSA-specialist AI.' },
    { year: 'Jan 2026', event: 'Introduced the Progressive Hint System and Algorithm Visualizer.' },
    { year: 'Feb 2026', event: 'AI Mock Interview feature launched with live camera, mic, and real-time code evaluation.' },
    { year: 'Mar 2026', event: 'Crossed 500+ active engineers. Pricing plans & Razorpay integration launched.' },
];

const VALUES = [
    {
        title: 'Depth over Breadth',
        body: 'We don\'t try to solve everything. We solve DSA better than anyone — with focused training, retrieval, and tooling built for algorithms.',
        icon: (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="rgba(255,126,95,0.1)" />
                <path d="M18 8v20M12 14l6-6 6 6" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: 'Learning First',
        body: 'We believe in growing your intuition, not handing you answers. Every feature — hints, visualisations, interviews — is designed to make you better.',
        icon: (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="rgba(255,126,95,0.1)" />
                <path d="M10 18h4l3-6 4 12 3-6h6" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: 'Accessible Excellence',
        body: 'Top-tier DSA prep shouldn\'t require expensive bootcamps. AlgoZen brings interview-grade guidance to every engineer, anywhere.',
        icon: (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="rgba(255,126,95,0.1)" />
                <circle cx="18" cy="14" r="5" stroke="#ff7e5f" strokeWidth="2" />
                <path d="M9 28c0-5 4-8 9-8s9 3 9 8" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
];

function About() {
    const navigate = useNavigate();

    return (
        <>
            <Header />
            <main className="about-page">

                {/* Ambient glow */}
                <div className="about-bg-glow" />

                {/* ── Hero ── */}
                <section className="about-hero">
                    <p className="eyebrow">About AlgoZen</p>
                    <h1 className="about-hero-h1">
                        Built for engineers who want to<br />
                        <span className="about-accent">truly understand</span> DSA
                    </h1>
                    <p className="lede about-hero-lede">
                        AlgoZen is a DSA-specialist AI platform created by the RAD 24 Lab team in Hyderabad.
                        We built the platform we wished existed when we were preparing for technical interviews —
                        one that explains, guides, and challenges you rather than just handing you answers.
                    </p>
                    <div className="cta-row about-hero-cta">
                        <button className="btn primary" onClick={() => navigate('/signup')}>Join AlgoZen</button>
                        <button className="btn secondary" onClick={() => navigate('/team')}>Meet the Team</button>
                    </div>
                </section>

                {/* ── Stats ── */}
                <section className="about-stats">
                    <div className="about-stat">
                        <span className="about-stat-value">542+</span>
                        <span className="about-stat-label">Active Engineers</span>
                    </div>
                    <div className="about-stat-divider" />
                    <div className="about-stat">
                        <span className="about-stat-value">1.5M+</span>
                        <span className="about-stat-label">Code Submissions Evaluated</span>
                    </div>
                    <div className="about-stat-divider" />
                    <div className="about-stat">
                        <span className="about-stat-value">6</span>
                        <span className="about-stat-label">Core Platform Features</span>
                    </div>
                    <div className="about-stat-divider" />
                    <div className="about-stat">
                        <span className="about-stat-value">3</span>
                        <span className="about-stat-label">Founding Engineers</span>
                    </div>
                </section>

                {/* ── Mission ── */}
                <section className="about-mission">
                    <div className="about-mission-text">
                        <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Our Mission</p>
                        <h2 className="about-section-title">
                            Making DSA mastery accessible to every engineer
                        </h2>
                        <p className="about-body">
                            The gap between studying DSA and actually cracking a technical interview is huge.
                            Generic AI models give generic answers. Platforms dump solutions without explanation.
                            AlgoZen bridges that gap with a <strong>context-first AI pipeline</strong> — one that retrieves
                            the right algorithmic knowledge before the model ever generates a word. The result is
                            targeted guidance: not just what the answer is, but <em>why</em> it works and how to
                            think about problems like it.
                        </p>
                        <p className="about-body">
                            We're a small, focused team from Hyderabad building the platform we wished existed
                            when we were on the other side of the interview table.
                        </p>
                    </div>
                    <div className="about-mission-card">
                        <p className="about-pull-quote">
                            "The best way to prepare for a DSA interview isn't to memorise solutions —
                            it's to build the intuition to <span className="about-accent">derive</span> them."
                        </p>
                        <p className="about-pull-attr">— RAD 24 Lab Team</p>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="about-values-section">
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>What We Stand For</p>
                    <h2 className="about-section-title">Our Core Values</h2>
                    <div className="about-values-grid">
                        {VALUES.map(({ title, body, icon }) => (
                            <article key={title} className="about-value-card">
                                <div className="about-value-icon">{icon}</div>
                                <h3 className="about-value-title">{title}</h3>
                                <p className="about-value-body">{body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="about-timeline-section">
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Our Journey</p>
                    <h2 className="about-section-title">How we got here</h2>
                    <div className="about-timeline">
                        {MILESTONES.map(({ year, event }, i) => (
                            <div key={i} className="about-milestone">
                                <div className="about-milestone-dot" />
                                <div className="about-milestone-year">{year}</div>
                                <p className="about-milestone-event">{event}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA Banner ── */}
                <section className="about-cta-banner">
                    <div className="about-cta-glow" />
                    <p className="eyebrow">Join Us</p>
                    <h2 className="about-cta-title">Ready to level up?</h2>
                    <p className="about-cta-sub">
                        Join hundreds of engineers using AlgoZen to crack interviews with depth —
                        not just answers.
                    </p>
                    <div className="cta-row" style={{ justifyContent: 'center' }}>
                        <button className="btn primary about-cta-btn" onClick={() => navigate('/signup')}>
                            Get Started Free →
                        </button>
                        <button className="btn secondary" style={{ color: '#f7f1ea' }} onClick={() => navigate('/help-support')}>
                            Contact Support
                        </button>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}

export default About;
