import '../App.css';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function CustomerStories() {
    const navigate = useNavigate();

    return (
        <>
            <Header />
            <main className="about-page" style={{ paddingTop: '80px', maxWidth: '900px', margin: '0 auto', textAlign: 'left', lineHeight: '1.7' }}>
                <div className="about-bg-glow" />

                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <p className="eyebrow">Customer Stories</p>
                    <h1 className="about-hero-h1" style={{ marginBottom: '20px' }}>
                        Real engineers. <br />
                        <span className="about-accent">Real offers.</span>
                    </h1>
                    <p className="about-body" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        See how developers from around the world are using AlgoZen to build intuition, master Data Structures and Algorithms, and land offers at top-tier tech companies.
                    </p>
                </div>

                {/* ── Story 1 ── */}
                <article style={{ background: '#fffdf9', border: '1px solid rgba(26,26,26,0.08)', borderRadius: '24px', padding: '40px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#1a1a1a' }}>SJ</div>
                        <div>
                            <h2 style={{ fontSize: '1.3rem', color: '#1a1a1a', margin: 0 }}>Sarah Jenkins</h2>
                            <p style={{ color: 'rgba(26,26,26,0.6)', margin: 0, fontSize: '0.9rem' }}>Software Engineer II • San Francisco, USA</p>
                        </div>
                    </div>
                    <h3 className="about-section-title" style={{ fontSize: '1.6rem', marginBottom: '16px' }}>"From blank screens to a Google offer."</h3>
                    <div className="about-body" style={{ color: 'rgba(26,26,26,0.8)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            "Before AlgoZen, my interview prep was a cycle of memorizing LeetCode solutions and praying I wouldn't get a curveball. The moment an interviewer changed a constraint, I would freeze. I didn't have the foundational intuition; I just had muscle memory."
                        </p>
                        <p style={{ marginBottom: '16px' }}>
                            "That changed when I started using AlgoZen's <strong>AI Mock Interviews</strong>. It wasn't just a compiler; it was an active participant. When I got stuck on a complex Dynamic Programming problem, it didn't just hand me the memoized code. Instead, it nudged me: <em>'Sarah, what's the overlapping subproblem here?'</em>"
                        </p>
                        <p>
                            "Practicing with the live camera and real-time audio evaluation broke my fear of speaking while coding. After 3 months of using the progressive hint system and taking 15 mock interviews, I walked into my Google onsite feeling completely calm. I didn't get the exact questions I practiced, but I had the framework to derive the answers. I signed my offer letter last week."
                        </p>
                    </div>
                </article>

                {/* ── Story 2 ── */}
                <article style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', marginBottom: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', color: '#f7f1ea' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,126,95,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#ff7e5f' }}>RV</div>
                        <div>
                            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Rahul Verma</h2>
                            <p style={{ color: 'rgba(247,241,234,0.6)', margin: 0, fontSize: '0.9rem' }}>Backend Developer • Bangalore, India</p>
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '16px', fontWeight: '700' }}>"Visualizing the invisible."</h3>
                    <div className="about-body" style={{ color: 'rgba(247,241,234,0.8)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            "I'm a visual learner. Reading walls of text about how a Red-Black Tree rotates, or how Dijkstra's algorithm updates path weights, never clicked for me. I would spend hours drawing nodes on paper, losing track of pointers."
                        </p>
                        <p style={{ marginBottom: '16px' }}>
                            "AlgoZen's <strong>Visual Intelligence</strong> changed the game. I remember tackling a tough Graph traversal problem. I submitted my code, and instead of just getting a 'Wrong Answer' output, AlgoZen generated an interactive visualization of exactly how my pointers were traversing the nodes. I immediately saw that my BFS queue was processing nodes in the wrong order."
                        </p>
                        <p>
                            "The platform didn't just teach me algorithms; it taught me how to debug my own logic. Today, I'm a Senior Backend Engineer at a leading fintech startup, and I still use the mental models I built using AlgoZen's visual tools."
                        </p>
                    </div>
                </article>

                {/* ── CTA ── */}
                <section className="about-cta-banner" style={{ marginTop: '80px' }}>
                    <div className="about-cta-glow" />
                    <h2 className="about-cta-title">Ready to write your own story?</h2>
                    <p className="about-cta-sub">
                        Join thousands of engineers who are mastering DSA with intelligence, not memorization.
                    </p>
                    <div className="cta-row" style={{ justifyContent: 'center' }}>
                        <button className="btn primary about-cta-btn" onClick={() => navigate('/signup')}>
                            Start For Free →
                        </button>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}

export default CustomerStories;
