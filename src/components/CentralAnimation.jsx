function CentralAnimation() {
  return (
    <div className="hero-visual">
      <div className="gradient-ring" />
      <div className="data-card primary">
        <p className="card-label">Optimized and executed on advanced DSA problem sets certified by </p>
        <h4>12,000+</h4>
        <p>Structured test evluations.</p>
      </div>

      <div className="data-card secondary">
        <p className="card-label">Algo Zen V5.6</p>
        <h5>Now boarding</h5>
        <p>Deep Visualisation-powered algorithm debugging.</p>
      </div>

      <div className="orbit-dots">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={`dot-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default CentralAnimation;

