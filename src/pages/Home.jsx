import '../App.css';
import Header from '../components/Header';
import CentralAnimation from '../components/CentralAnimation';
import FeatureText from '../components/FeatureText';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();

  /* ── Scroll-triggered bar animation ── */
  const chartRef = useRef(null);
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartVisible(true);
          observer.disconnect();          // animate only once
        }
      },
      { threshold: 0.25 }                // trigger when 25% visible
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const surveyData = [
    { label: 'LEETCODE', pct: 82, highlight: false },
    { label: 'GEEKSFORGEEKS', pct: 71, highlight: false },
    { label: 'HACKERRANK', pct: 54, highlight: false },
    { label: 'INTERVIEWBIT', pct: 44, highlight: false },
    { label: 'ALGOZEN', pct: 38, highlight: true },
    { label: 'CODEFORCES', pct: 31, highlight: false },
    { label: 'CODECHEF', pct: 27, highlight: false },
    { label: 'NEETCODE', pct: 15, highlight: false },
  ];

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">RAD 24 AI lab</p>
            <h1>
              Platform where DSA meets Visual Intelligence
              <br />

            </h1>
            <p className="lede">
              A Perfect Platform to find a calm , focused and deeply understading approach to algorithms and problem solving.
            </p>
            <FeatureText />
            <div className="cta-row">
              <button className="btn primary" onClick={() => navigate('/signup')}>Let's Get Started</button>
              <button className="btn secondary">Help & Support</button>
            </div>
            <div className="trust-metrics">
              <div>
                <span className="metric-value">542+</span>
                <span className="metric-label">active engineers preparing for technical interviews</span>
              </div>
              <div>
                <span className="metric-value">1.5M+</span>
                <span className="metric-label">code submissions evaluated with real-time feedback</span>
              </div>
            </div>
          </div>
          <CentralAnimation />
        </section>


        {/* ── Horizontal Bar Chart ── */}
        <section className="survey-chart-section" ref={chartRef}>
          <h2 className="survey-chart-title">
            What tools are developers using for DSA interview prep?
          </h2>
          <hr className="survey-chart-divider" />

          {surveyData.map(({ label, pct, highlight }, index) => (
            <div className="survey-row" key={label}>
              <span className={`survey-label${highlight ? ' survey-label--highlight' : ''}`}>
                {label}
              </span>
              <div className="survey-bar-track">
                <div
                  className={`survey-bar-fill${highlight ? ' survey-bar-fill--highlight' : ''}`}
                  style={{
                    width: chartVisible ? `${pct}%` : '0%',
                    transitionDelay: `${index * 0.1}s`,
                  }}
                />
              </div>
              <span className="survey-pct">{chartVisible ? `${pct}%` : '0%'}</span>
            </div>
          ))}

          <p className="survey-source">SOURCE: ALGOZEN DEVELOPER INSIGHTS SURVEY 2025</p>
        </section>


        <section className="pillar-grid">
          <article>
            <p className="pillar-label">Learning Paths</p>
            <h3>Structured Curriculum</h3>
            <p>
              From basic data structures to advanced graph algorithms, follow expertly crafted
              modules designed to build your problem-solving intuition step-by-step.
            </p>
          </article>
          <article>
            <p className="pillar-label">Mock Interviews</p>
            <h3>AI-Powered Practice</h3>
            <p>
              Simulate high-pressure technical interviews with our AI interviewer. Get real-time
              hints, code evaluations, and detailed feedback to refine your approach.
            </p>
          </article>
          <article>
            <p className="pillar-label">Platform</p>
            <h3>Visual Intelligence</h3>
            <p>
              Stop trying to picture pointers in your head. Our interactive visualizations bring
              arrays, trees, and linked lists to life so you can truly understand the code.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;

