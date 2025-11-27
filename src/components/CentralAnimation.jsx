function CentralAnimation() {
  return (
    <div className="hero-visual">
      <div className="gradient-ring" />
      <div className="data-card primary">
        <p className="card-label">Safety reviews</p>
        <h4>4,200 scenarios</h4>
        <p>stress-tested by red teams worldwide</p>
      </div>

      <div className="data-card secondary">
        <p className="card-label">Claude Opus 4.5</p>
        <h5>Now boarding</h5>
        <p>context windows up to 200K tokens</p>
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

