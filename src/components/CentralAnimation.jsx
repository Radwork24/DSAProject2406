function CentralAnimation() {
  return (
    <div className="hero-visual">
      <div className="gradient-ring" />

      {/* Floating particle effects */}
      <div className="particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={`p-${i}`} className={`particle particle--${i}`} />
        ))}
      </div>

      <div className="data-card primary">
        <p className="card-label">Optimized and executed on advanced DSA problem sets certified by </p>
        <h4>12,000+</h4>
        <p>Structured test evaluations.</p>
        <div className="card-shimmer" />
      </div>

      <div className="data-card secondary">
        <p className="card-label">Algo Zen V5.6</p>
        <h5>Now boarding</h5>
        <p>Deep Visualisation-powered algorithm debugging.</p>
        <div className="card-shimmer" />
      </div>
    </div>
  );
}

export default CentralAnimation;
