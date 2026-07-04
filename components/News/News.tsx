import { NEWS } from "@/lib/constants";

export default function News() {
  return (
    <section id="news">
      <div className="news-header-row">
        <h2 className="news-section-title">NEWS</h2>
        <a href="#all-news" className="view-all-link">
          View All &nearr;
        </a>
      </div>

      <div className="news-matrix-carousel">
        {NEWS.map((item) => (
          <div className="news-card" key={item.id} data-reveal>
            <div className="news-img-frame">
              <img src={item.imgSrc} alt={item.imgAlt} />
            </div>
            <div className="news-info-meta">
              <p className="news-headline">{item.headline}</p>
              <span className="news-date">{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
