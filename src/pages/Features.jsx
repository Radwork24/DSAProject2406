import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css';
import './Features.css';

const features = [
    {
        id: 1,
        tag: 'AI SOLVER',
        title: 'DSA AI Solver',
        subtitle: 'Context-First Problem Solving',
        description:
            'AlgoZen doesn\'t just answer — it first retrieves editorial-quality DSA context relevant to your problem, then passes that context along with your query to the model. The result is grounded, accurate guidance: not generic AI output.',
        tags: ['RAG Pipeline', 'Context Retrieval', 'LLM Integration', 'Augmented Prompts'],
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="rgba(255,126,95,0.1)" />
                <circle cx="28" cy="26" r="10" stroke="#ff7e5f" strokeWidth="2" />
                <path d="M22 26h12M28 20v12" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" />
                <path d="M28 37v4" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" />
                <path d="M23 41h10" stroke="#feb47b" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 2,
        tag: 'HINTS',
        title: 'Progressive Hint System',
        subtitle: 'Learn, Don\'t Just Copy',
        description:
            'AlgoZen surfaces graduated hints — from high-level approach clues to detailed step-by-step reasoning. You control how deep you go. The full solution only appears when you truly need it, keeping the learning intact.',
        tags: ['Hint 1 / 2 / 3', 'Approach Cards', 'Step-by-Step', 'Progressive Reveal'],
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="rgba(255,126,95,0.1)" />
                <path d="M20 18h16M20 26h12M20 34h8" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="34" r="5" stroke="#feb47b" strokeWidth="2" />
                <path d="M38 32v2.5l1.5 1.5" stroke="#feb47b" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 3,
        tag: 'VISUALIZER',
        title: 'Algorithm Visualizer',
        subtitle: 'See the Code Think',
        description:
            'Stop imagining pointer movements in your head. AlgoZen\'s interactive visualizer brings arrays, linked lists, trees, graphs, stacks, and queues to life — stepping through each operation so you truly understand what the code does.',
        tags: ['Arrays', 'Trees', 'Graphs', 'Linked Lists', 'Stacks & Queues'],
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="rgba(255,126,95,0.1)" />
                <rect x="16" y="32" width="6" height="10" rx="2" fill="#feb47b" />
                <rect x="25" y="24" width="6" height="18" rx="2" fill="#ff7e5f" />
                <rect x="34" y="18" width="6" height="24" rx="2" fill="#feb47b" />
                <path d="M16 30l9-10 9 6 8-12" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 4,
        tag: 'MOCK INTERVIEW',
        title: 'AI Mock Interviews',
        subtitle: 'Simulate Real Pressure',
        description:
            'Face a real AI interviewer that asks DSA problems, evaluates your approach in real time, and gives actionable feedback. Built-in camera and microphone support make it feel like the real thing — without the stakes.',
        tags: ['AI Interviewer', 'Live Feedback', 'Camera + Mic', 'Code Evaluation'],
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="rgba(255,126,95,0.1)" />
                <rect x="16" y="18" width="24" height="16" rx="4" stroke="#ff7e5f" strokeWidth="2" />
                <path d="M28 34v4M22 38h12" stroke="#ff7e5f" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="20" r="5" fill="rgba(254,180,123,0.25)" stroke="#feb47b" strokeWidth="1.8" />
                <path d="M36 20l1.5 1.5L40 18" stroke="#feb47b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 5,
        tag: 'DEBUGGING',
        title: 'AI Code Debugger',
        subtitle: 'Fix It Fast, Understand Why',
        description:
            'Paste your buggy code and AlgoZen identifies logical errors, off-by-one mistakes, edge case failures, and complexity issues. Every fix comes with an explanation so you don\'t repeat the same mistake.',
        tags: ['Error Detection', 'Edge Cases', 'Complexity Review', 'Explanations'],
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="rgba(255,126,95,0.1)" />
                <path d="M20 22h16M20 28h10M20 34h12" stroke="#feb47b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="37" cy="35" r="6" fill="rgba(255,126,95,0.15)" stroke="#ff7e5f" strokeWidth="2" />
                <path d="M35 35l1.5 1.5L39 33" stroke="#ff7e5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 6,
        tag: 'LEARNING PATHS',
        title: 'Structured Learning Paths',
        subtitle: 'From Zero to Interview-Ready',
        description:
            'Follow expertly crafted modules that take you from basic data structures to advanced graph algorithms. Each path is ordered by concept dependency so you build intuition before tackling complexity.',
        tags: ['Curated Modules', 'Concept Order', 'Beginner → Advanced', 'Progress Tracking'],
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="rgba(255,126,95,0.1)" />
                <circle cx="20" cy="20" r="4" stroke="#ff7e5f" strokeWidth="2" />
                <circle cx="36" cy="28" r="4" stroke="#feb47b" strokeWidth="2" />
                <circle cx="20" cy="36" r="4" stroke="#ff7e5f" strokeWidth="2" />
                <path d="M24 20h8M24 28H20M24 36h8" stroke="rgba(26,26,26,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M20 24v8" stroke="rgba(26,26,26,0.2)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

function Features() {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((c) => (c - 1 + features.length) % features.length);
    const next = () => setCurrent((c) => (c + 1) % features.length);

    const feature = features[current];

    return (
        <>
            <Header />
            <main className="feat-page">

                {/* Ambient glow */}
                <div className="feat-bg-glow" />

                <p className="feat-eyebrow">Platform Features</p>
                <h1 className="feat-heading">Everything you need to master DSA</h1>

                {/* Carousel */}
                <div className="feat-carousel">

                    {/* ← Prev */}
                    <button className="team-arrow team-arrow--prev" onClick={prev} aria-label="Previous feature">
                        &#8592;
                    </button>

                    {/* Card */}
                    <div className="feat-card" key={feature.id}>

                        {/* Left — icon + counter */}
                        <div className="feat-card-visual">
                            <div className="feat-icon-wrap">{feature.icon}</div>
                            <div className="feat-counter">
                                <span className="feat-counter-current">{String(current + 1).padStart(2, '0')}</span>
                                <span className="feat-counter-sep"> / </span>
                                <span className="feat-counter-total">{String(features.length).padStart(2, '0')}</span>
                            </div>
                        </div>

                        {/* Right — info */}
                        <div className="team-card-info">
                            <span className="team-card-tag">{feature.tag}</span>
                            <h2 className="team-card-name">{feature.title}</h2>
                            <p className="team-card-role">{feature.subtitle}</p>
                            <p className="team-card-bio">{feature.description}</p>
                            <div className="team-card-skills">
                                {feature.tags.map((t) => (
                                    <span key={t} className="team-skill-pill">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* → Next */}
                    <button className="team-arrow team-arrow--next" onClick={next} aria-label="Next feature">
                        &#8594;
                    </button>
                </div>

                {/* Dots */}
                <div className="team-dots">
                    {features.map((_, i) => (
                        <button
                            key={i}
                            className={`team-dot${i === current ? ' team-dot--active' : ''}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`Go to feature ${i + 1}`}
                        />
                    ))}
                </div>

            </main>
            <Footer />
        </>
    );
}

export default Features;
