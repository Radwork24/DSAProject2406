import './App.css';
import Header from './components/Header';
import CentralAnimation from './components/CentralAnimation';
import FeatureText from './components/FeatureText';

function App() {
  return (
    <>
      <Header />
      <div className="app">
        <div className="landing-container">
          <div className="text-content">
            <h1>All-in-one DSA solver.</h1>
            <p>A fast and versatile Platform with features<FeatureText /></p>
            <div className="cta-section">
              <div className="install-command">
                <span>Let's get Started</span>
                <svg className="copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <button className="learn-more-btn">Learn more</button>
            </div>
          </div>
          <div className="animation-container">
            <CentralAnimation />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
