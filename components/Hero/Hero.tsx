export default function Hero() {
  return (
    <section className="hero-reel-section">
      <div className="video-container-box">
        <img
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=90"
          alt="SAP Courtyard Core Frame"
        />
      </div>
      <div className="hero-text-overlay">
        <h1 className="hero-title">
          <span className="line">
            <span className="txt">A studio for the</span>
          </span>
          <span className="line">
            <span className="txt">
              <em>architecture</em> of the{" "}
              <span className="blue">not&#8209;yet</span>
            </span>
          </span>
        </h1>
        <div className="hero-sub">
          Architects <span>·</span> Planners <span>·</span> Research{" "}
          <span>·</span> AI Labs
        </div>
      </div>
    </section>
  );
}
