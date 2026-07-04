import { LABS, type Lab, type GlyphType } from "@/lib/constants";

function CornerGlyph({ type }: { type: GlyphType }) {
  return (
    <div className="lab-corner-glyph">
      {type === "building" && (
        <svg viewBox="0 0 100 100">
          <rect x="20" y="35" width="60" height="50" />
          <polyline points="20,35 50,15 80,35" />
          <line x1="50" y1="15" x2="50" y2="85" />
          <line x1="20" y1="60" x2="80" y2="60" />
        </svg>
      )}
      {type === "graph" && (
        <svg viewBox="0 0 100 100">
          <polyline points="15,80 35,55 55,65 75,30 90,45" />
          <circle cx="35" cy="55" r="2.5" />
          <circle cx="75" cy="30" r="2.5" />
          <circle cx="55" cy="65" r="2.5" />
          <line x1="10" y1="85" x2="95" y2="85" />
          <line x1="15" y1="15" x2="15" y2="85" />
        </svg>
      )}
      {type === "target" && (
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="18" />
          <line x1="20" y1="50" x2="80" y2="50" />
          <line x1="50" y1="20" x2="50" y2="80" />
          <circle cx="50" cy="50" r="3" />
        </svg>
      )}
      {type === "grid" && (
        <svg viewBox="0 0 100 100">
          <rect x="20" y="20" width="60" height="60" />
          <line x1="20" y1="40" x2="80" y2="40" />
          <line x1="20" y1="60" x2="80" y2="60" />
          <line x1="40" y1="20" x2="40" y2="80" />
          <line x1="60" y1="20" x2="60" y2="80" />
          <rect x="40" y="40" width="20" height="20" fill="rgba(42,69,232,0.25)" />
        </svg>
      )}
    </div>
  );
}

function LabCard({ lab }: { lab: Lab }) {
  return (
    <article className="lab" data-reveal>
      <div className="lab-head">
        <div>
          <div className="id">{lab.id}</div>
          <h3>
            {lab.titleMain}
            {lab.titleItalic && <em>{lab.titleItalic}</em>}
            {lab.titleBlue && <span className="blue">{lab.titleBlue}</span>}
            {lab.titleSuffix}
          </h3>
        </div>
        <span className={`badge${lab.badgeActive ? " active" : ""}`}>
          {lab.badge}
        </span>
      </div>

      <p className="desc">{lab.desc}</p>

      <div className="stats">
        {lab.stats.map((s) => (
          <div key={s.l}>
            <span className="v">{s.v}</span>
            <span className="l">{s.l}</span>
          </div>
        ))}
      </div>

      <div className="recent">
        <span className="h">▌ Recent</span>
        <ul>
          {lab.recent.map((r) => (
            <li key={r.title}>
              {r.title}
              {r.type && <em> {r.type}</em>}
              <span>{r.year}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="enter">{lab.enterLabel}</span>

      <CornerGlyph type={lab.glyphType} />
    </article>
  );
}

export default function Labs() {
  return (
    <section className="labs-section" id="labs">
      <div className="section-head" data-reveal>
        <h2>
          The Four <em>Labs</em>.
        </h2>
        <div className="meta">
          01 / DIVISIONS
          <br />
          <strong>ONE STUDIO · FOUR ARMS</strong>
          <br />
          PUNE · 2026
        </div>
      </div>

      {/* Lab Diagram SVG */}
      <div className="lab-diagram" data-reveal>
        <svg viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
          <line className="net" x1="250" y1="150" x2="110" y2="80" />
          <line className="net" x1="250" y1="150" x2="390" y2="80" />
          <line className="net" x1="250" y1="150" x2="110" y2="220" />
          <line className="net" x1="250" y1="150" x2="390" y2="220" />
          <line className="net" x1="110" y1="80" x2="390" y2="80" strokeDasharray="1 6" />
          <line className="net" x1="110" y1="220" x2="390" y2="220" strokeDasharray="1 6" />
          <line className="net" x1="110" y1="80" x2="110" y2="220" strokeDasharray="1 6" />
          <line className="net" x1="390" y1="80" x2="390" y2="220" strokeDasharray="1 6" />
          <circle className="node" cx="110" cy="80" r="10" />
          <circle className="node" cx="390" cy="80" r="10" />
          <circle className="node" cx="110" cy="220" r="10" />
          <circle className="node" cx="390" cy="220" r="10" />
          <circle className="hub" cx="250" cy="150" r="14" />
          <text className="hub-label" x="250" y="180" textAnchor="middle">SAP</text>
          <text x="110" y="55" textAnchor="middle">ATELIER</text>
          <text className="label" x="110" y="42" textAnchor="middle">/ 01</text>
          <text x="390" y="55" textAnchor="middle">FUTURES</text>
          <text className="label" x="390" y="42" textAnchor="middle">/ 02</text>
          <text x="110" y="255" textAnchor="middle">AI · COMPUTATION</text>
          <text className="label" x="110" y="270" textAnchor="middle">/ 03</text>
          <text x="390" y="255" textAnchor="middle">CIVIC REFORM</text>
          <text className="label" x="390" y="270" textAnchor="middle">/ 04</text>
        </svg>
      </div>

      {/* Lab Grid */}
      <div className="lab-grid">
        {LABS.map((lab) => (
          <LabCard key={lab.id} lab={lab} />
        ))}
      </div>
    </section>
  );
}
