import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../pages/Team.css';

import mohitImg from '/Users/mohitgurjar/.gemini/antigravity/brain/ce4b749b-a4c8-4e6b-bead-1906920de9b0/team_mohit_1773211088060.png';
import abhayImg from '/Users/mohitgurjar/.gemini/antigravity/brain/ce4b749b-a4c8-4e6b-bead-1906920de9b0/team_abhay_1773211103893.png';
import yogeshImg from '/Users/mohitgurjar/.gemini/antigravity/brain/ce4b749b-a4c8-4e6b-bead-1906920de9b0/team_yogesh_1773211139971.png';

const members = [
    {
        id: 1,
        name: 'Mohit Gurjar',
        role: 'Founder & Full-Stack Engineer',
        tag: 'RAD 24 LAB TEAM',
        image: mohitImg,
        bio: 'Mohit leads the architecture and full-stack development of AlgoZen. Passionate about making complex algorithms accessible through visual intelligence, he designed the core DSA engine and AI Solver pipeline from scratch.',
        skills: ['React', 'Node.js', 'Python', 'DSA Systems', 'AI Integration'],
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
    },
    {
        id: 2,
        name: 'Abhay Singh',
        role: 'Backend & AI Systems Engineer',
        tag: 'RAD 24 LAB TEAM',
        image: abhayImg,
        bio: 'Abhay powers the backend infrastructure and AI pipeline behind AlgoZen. With deep expertise in API design and LLM integration, he built the hint engine, mock interview system, and real-time code evaluation services.',
        skills: ['Python', 'FastAPI', 'LLMs', 'WebSockets', 'Docker'],
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
    },
    {
        id: 3,
        name: 'Yogesh Tiwari',
        role: 'UI/UX Designer & Frontend Engineer',
        tag: 'RAD 24 LAB TEAM',
        image: yogeshImg,
        bio: 'Yogesh crafts the visual language and user experience of AlgoZen. He translated complex DSA concepts into clean, intuitive interfaces — from the visualization engine to the interview module — ensuring every interaction feels intentional.',
        skills: ['Figma', 'CSS Animations', 'React', 'Motion Design', 'UX Research'],
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
    },
];

function Team() {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((c) => (c - 1 + members.length) % members.length);
    const next = () => setCurrent((c) => (c + 1) % members.length);

    const member = members[current];

    return (
        <>
            <Header />
            <main className="team-page">

                {/* Background ambient glow matching Home theme */}
                <div className="team-bg-glow" />

                <p className="team-eyebrow">RAD 24 LAB TEAM</p>
                <h1 className="team-heading">The people behind AlgoZen</h1>

                <div className="team-carousel">
                    {/* ← Prev arrow */}
                    <button className="team-arrow team-arrow--prev" onClick={prev} aria-label="Previous member">
                        &#8592;
                    </button>

                    {/* Card */}
                    <div className="team-card" key={member.id}>
                        {/* Left — photo */}
                        <div className="team-card-photo-wrap">
                            <img src={member.image} alt={member.name} className="team-card-photo" />
                            <div className="team-card-photo-glow" />
                        </div>

                        {/* Right — info */}
                        <div className="team-card-info">
                            <span className="team-card-tag">{member.tag}</span>
                            <h2 className="team-card-name">{member.name}</h2>
                            <p className="team-card-role">{member.role}</p>
                            <p className="team-card-bio">{member.bio}</p>

                            <div className="team-card-skills">
                                {member.skills.map((s) => (
                                    <span key={s} className="team-skill-pill">{s}</span>
                                ))}
                            </div>

                            <div className="team-card-links">
                                <a href={member.github} target="_blank" rel="noreferrer" className="team-link" aria-label="GitHub">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                </a>
                                <a href={member.linkedin} target="_blank" rel="noreferrer" className="team-link" aria-label="LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* → Next arrow */}
                    <button className="team-arrow team-arrow--next" onClick={next} aria-label="Next member">
                        &#8594;
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="team-dots">
                    {members.map((_, i) => (
                        <button
                            key={i}
                            className={`team-dot${i === current ? ' team-dot--active' : ''}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`Go to member ${i + 1}`}
                        />
                    ))}
                </div>

            </main>
            <Footer />
        </>
    );
}

export default Team;
