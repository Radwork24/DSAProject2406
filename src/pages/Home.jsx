import '../App.css';
import Header from '../components/Header';
import CentralAnimation from '../components/CentralAnimation';
import FeatureText from '../components/FeatureText';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

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
              <button className="btn primary" onClick={() => navigate('/dashboard')}>Let's Get Started</button>
              <button className="btn secondary">Help & Support</button>
            </div>
            <div className="trust-metrics">
              <div>
                <span className="metric-value">12k+</span>
                <span className="metric-label">organizations piloting Claude responsibly</span>
              </div>
              <div>
                <span className="metric-value">45</span>
                <span className="metric-label">policy commitments filed in 2025 alone</span>
              </div>
            </div>
          </div>
          <CentralAnimation />
        </section>

        <section className="cta-panels">
          <article className="panel">
            <div className="panel-label">Claude Opus 4.5</div>
            <h2>Advanced tool use on the Claude Developer Platform</h2>
            <p>
              Introducing our best model for coding, enterprise workflows, and detailed
              reasoning—now with native pathways for safety reviews and observability.
            </p>
            <button className="text-link">Learn more →</button>
          </article>

          <article className="panel">
            <div className="panel-label">Commitments</div>
            <h2>Safety, governance, and independent audits</h2>
            <p>
              We publish red-team findings, share artifacts with global regulators, and support
              partners with playbooks for secure deployments.
            </p>
            <div className="inline-list">
              <span>Incident response teams</span>
              <span>Transparency reporting</span>
              <span>Alignment research</span>
            </div>
          </article>
        </section>

        <section className="pillar-grid">
          <article>
            <p className="pillar-label">Research</p>
            <h3>Frontier interpretability</h3>
            <p>
              From mechanistic interpretability to long-horizon evaluations, we invest in tools
              that make complex systems legible to the people who deploy them.
            </p>
          </article>
          <article>
            <p className="pillar-label">Economic futures</p>
            <h3>Partnering with institutions</h3>
            <p>
              We work with academics, governments, and civil society to study the economic
              implications of frontier AI and prioritize shared prosperity.
            </p>
          </article>
          <article>
            <p className="pillar-label">Products</p>
            <h3>Claude wherever you build</h3>
            <p>
              Whether through the Claude API, desktop app, or in-product agent tools, we ship
              experiences that keep people in control of the technology.
            </p>
          </article>
        </section>
      </main>
    </>
  );
}

export default Home;

