import '../App.css';
import './WhyAlgoZen.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

/* ── Feature comparison data ── */
const FEATURES = [
    { label: 'DSA-Specific Training', algozen: true, chatgpt: false, claude: false, deepseek: false },
    { label: 'Context Retrieval (RAG)', algozen: true, chatgpt: false, claude: false, deepseek: false },
    { label: 'Problem-type Detection', algozen: true, chatgpt: false, claude: false, deepseek: false },
    { label: 'Hint & Step-by-Step Mode', algozen: true, chatgpt: false, claude: false, deepseek: false },
    { label: 'Code Debugging Support', algozen: true, chatgpt: true, claude: true, deepseek: true },
    { label: 'Time / Space Complexity', algozen: true, chatgpt: true, claude: true, deepseek: false },
    { label: 'Visualisation Integration', algozen: true, chatgpt: false, claude: false, deepseek: false },
    { label: 'Mock Interview Mode', algozen: true, chatgpt: false, claude: false, deepseek: false },
    { label: 'General-Purpose Answers', algozen: false, chatgpt: true, claude: true, deepseek: true },
];

/* ── Pipeline steps ── */
/* ── Pipeline step SVG icons ── */
const IconIngest = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
        <path d="M14 7v10M10 13l4 4 4-4" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 20h12" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconSearch = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
        <circle cx="13" cy="13" r="5" stroke="#ff7e5f" strokeWidth="1.8" />
        <path d="M17 17l3.5 3.5" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconPrompt = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
        <rect x="7" y="9" width="14" height="2" rx="1" fill="#ff7e5f" />
        <rect x="7" y="13" width="10" height="2" rx="1" fill="#ff7e5f" />
        <rect x="7" y="17" width="6" height="2" rx="1" fill="#ff7e5f" />
    </svg>
);
const IconAI = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="rgba(255,126,95,0.12)" />
        <circle cx="14" cy="13" r="5" stroke="#ff7e5f" strokeWidth="1.8" />
        <path d="M11 13h6M14 10v6" stroke="#ff7e5f" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14 19v2" stroke="#ff7e5f" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 20.5h6" stroke="#ff7e5f" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const PIPELINE = [
    {
        step: '01',
        title: 'Problem Ingestion',
        desc: 'You paste or type a DSA problem. AlgoZen reads the full statement, constraints, and examples before doing anything else.',
        icon: <IconIngest />,
    },
    {
        step: '02',
        title: 'Context Retrieval',
        desc: 'A DSA-aware retrieval layer searches curated algorithm articles, solutions, and editorial patterns most relevant to the problem category.',
        icon: <IconSearch />,
    },
    {
        step: '03',
        title: 'Augmented Prompt',
        desc: 'The retrieved context is bundled with your query into a rich, structured prompt — so the model already "knows" which techniques apply.',
        icon: <IconPrompt />,
    },
    {
        step: '04',
        title: 'Targeted AI Response',
        desc: 'The model generates explanations, hints, optimised code, and debugging help that are grounded in real DSA knowledge — not generic text.',
        icon: <IconAI />,
    },
];

/* ── Advantage cards ── */
const ADVANTAGES = [
    {
        label: 'Precision',
        title: 'Built for DSA — Not Everything',
        body: 'General models try to know everything. AlgoZen knows DSA deeply. Focused training means better suggestions, spot-on time/space analysis, and no hallucinated APIs.',
        tags: ['Focused', 'Accurate', 'Reliable'],
    },
    {
        label: 'Methodology',
        title: 'Context Before Code',
        body: 'Before generating a single line, AlgoZen retrieves editorial-quality context. Your query is answered with the right algorithm in mind — not the most common one.',
        tags: ['RAG Pipeline', 'Context-First', 'Grounded'],
    },
    {
        label: 'Workflow',
        title: 'Hints Over Handouts',
        body: 'Copying a full solution teaches nothing. AlgoZen surfaces graduated hints so you actually learn — and only shows complete code when you need it.',
        tags: ['Progressive', 'Hints', 'Learning'],
    },
];

/* ── Check / Cross icons ── */
const Check = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="9" fill="rgba(255,126,95,0.15)" />
        <path d="M5 9l3 3 5-5" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const Cross = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="9" fill="rgba(26,26,26,0.06)" />
        <path d="M6 6l6 6M12 6l-6 6" stroke="rgba(26,26,26,0.3)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

function WhyAlgoZen() {
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const pipelineRef = useRef(null);
    const [tableVisible, setTableVisible] = useState(false);
    const [pipelineVisible, setPipelineVisible] = useState(false);

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.target === tableRef.current && e.isIntersecting) { setTableVisible(true); }
                if (e.target === pipelineRef.current && e.isIntersecting) { setPipelineVisible(true); }
            }),
            { threshold: 0.15 }
        );
        if (tableRef.current) io.observe(tableRef.current);
        if (pipelineRef.current) io.observe(pipelineRef.current);
        return () => io.disconnect();
    }, []);

    return (
        <>
            <Header />

            <main className="page-shell">

                {/* ── Hero ── */}
                <section className="waz-hero">
                    <div className="waz-glow" />
                    <p className="eyebrow">Why AlgoZen</p>
                    <h1 className="waz-hero-h1">
                        Not just another AI.<br />
                        <span className="waz-accent">DSA-First</span>, Context-Driven.
                    </h1>
                    <p className="lede waz-hero-lede">
                        ChatGPT, Claude, and DeepSeek are brilliant generalists. AlgoZen is a specialist —
                        built from the ground up to tackle data structures &amp; algorithms with depth,
                        precision, and a retrieval pipeline no general model can match.
                    </p>
                    <div className="cta-row">
                        <button className="btn primary" onClick={() => navigate('/signup')}>Try AlgoZen Free</button>
                        <button className="btn secondary" onClick={() => navigate('/pricing')}>See Plans</button>
                    </div>
                </section>

                {/* ── Comparison Table ── */}
                <section className="waz-table-section" ref={tableRef}>
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Feature Comparison</p>
                    <h2 className="waz-section-title">How does AlgoZen stack up?</h2>
                    <p className="waz-section-sub">
                        We compared core capabilities across the four platforms most used for DSA prep.
                    </p>

                    <div className={`waz-table-wrap ${tableVisible ? 'waz-table-visible' : ''}`}>
                        <table className="waz-table">
                            <thead>
                                <tr>
                                    <th className="waz-th-feature">Feature</th>
                                    <th className="waz-th-az">AlgoZen</th>
                                    <th>ChatGPT</th>
                                    <th>Claude</th>
                                    <th>DeepSeek</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FEATURES.map(({ label, algozen, chatgpt, claude, deepseek }) => (
                                    <tr key={label} className={algozen && !chatgpt && !claude && !deepseek ? 'waz-row-exclusive' : ''}>
                                        <td className="waz-td-feature">{label}</td>
                                        <td className="waz-td-az">{algozen ? <Check /> : <Cross />}</td>
                                        <td>{chatgpt ? <Check /> : <Cross />}</td>
                                        <td>{claude ? <Check /> : <Cross />}</td>
                                        <td>{deepseek ? <Check /> : <Cross />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="survey-source" style={{ marginTop: '16px' }}>
                        SOURCE: ALGOZEN INTERNAL CAPABILITY REVIEW 2025
                    </p>
                </section>

                {/* ── The AlgoZen Pipeline ── */}
                <section className="waz-pipeline-section" ref={pipelineRef}>
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Under the Hood</p>
                    <h2 className="waz-section-title">The AlgoZen Pipeline</h2>
                    <p className="waz-section-sub">
                        General AI models jump straight to generation. AlgoZen retrieves the right DSA context first —
                        so every answer is grounded in algorithmic knowledge, not guesswork.
                    </p>

                    <div className="waz-pipeline">
                        {PIPELINE.map(({ step, title, desc, icon }, i) => (
                            <div
                                key={step}
                                className="waz-pipeline-step"
                                style={{
                                    opacity: pipelineVisible ? 1 : 0,
                                    transform: pipelineVisible ? 'translateY(0)' : 'translateY(32px)',
                                    transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
                                }}
                            >
                                {i < PIPELINE.length - 1 && <div className="waz-pipeline-connector" />}
                                <div className="waz-pipeline-icon">{icon}</div>
                                <div className="waz-pipeline-badge">{step}</div>
                                <h3 className="waz-pipeline-title">{title}</h3>
                                <p className="waz-pipeline-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Advantage Cards ── */}
                <section className="waz-advantages-section">
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Core Advantages</p>
                    <h2 className="waz-section-title">Three reasons engineers choose AlgoZen</h2>

                    <div className="waz-advantages">
                        {ADVANTAGES.map(({ label, title, body, tags }) => (
                            <article key={title} className="panel">
                                <p className="panel-label">{label}</p>
                                <h2>{title}</h2>
                                <p>{body}</p>
                                <div className="inline-list">
                                    {tags.map((t) => <span key={t}>{t}</span>)}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── CTA Banner ── */}
                <section className="waz-cta-banner">
                    <div className="waz-cta-glow" />
                    <p className="eyebrow">Ready?</p>
                    <h2 className="waz-cta-title">Stop guessing. Start solving.</h2>
                    <p className="waz-cta-sub">
                        Join hundreds of engineers who use AlgoZen to crack DSA interviews with
                        depth — not just answers.
                    </p>
                    <button className="btn primary waz-cta-btn" onClick={() => navigate('/signup')}>
                        Get Started for Free →
                    </button>
                </section>

            </main>
            <Footer />
        </>
    );
}

export default WhyAlgoZen;
