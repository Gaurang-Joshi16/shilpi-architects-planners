"use client";

import { METRICS, CATEGORIES } from "@/lib/constants";
import { useCounter } from "@/lib/hooks/useCounter";

function MetricBlock({ target, label }: { target: number; label: string }) {
  const ref = useCounter(target);
  return (
    <div className="metric-block">
      <span className="metric-number" ref={ref} data-target={target}>
        0
      </span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

export default function Metrics() {
  return (
    <section className="metrics-section" id="about">
      <div className="metrics-grid-row">
        {METRICS.map((m) => (
          <MetricBlock key={m.label} target={m.target} label={m.label} />
        ))}
      </div>

      <h3 className="metrics-sub-heading">
        SAP introduces calculated structural paradigms to advance community
        environments across a global layout framework.
      </h3>

      <div className="category-matrix-grid">
        {CATEGORIES.map((cat) => (
          <div className="category-card" key={cat.id} data-reveal>
            <div className="category-img-wrapper">
              <img src={cat.imgSrc} alt={cat.imgAlt} />
              <div className="category-tag-pill">
                {cat.label}{" "}
                <span className="category-count">{cat.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
