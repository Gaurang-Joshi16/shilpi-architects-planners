'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NEWS_ARTICLES } from '../../lib/newsData'
import { createClient } from '../../utils/supabase/client'
import NewsletterForm from '../../components/NewsletterForm'
import './news.css'



export default function News() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [newsList, setNewsList] = useState(NEWS_ARTICLES)

  useEffect(() => {
    async function fetchNews() {
      const supabase = createClient();
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setNewsList(data.map(p => ({
          slug: p.slug,
          title: p.title,
          date: p.date,
          location: p.location,
          year: p.year,
          heroImage: p.hero_image,
          objectPosition: p.object_position
        })));
      }
    }
    fetchNews();
  }, []);

  useEffect(() => {
    // ── DARK MODE INIT ──
    const themeToggle = document.getElementById('themeToggle');
        const toggleIcon = document.querySelector('.toggle-icon');

    const isDarkSaved = localStorage.getItem('sap-theme') === 'dark';
    if (isDarkSaved) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
        if (toggleIcon) toggleIcon.innerHTML = isDarkSaved ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    const onThemeToggle = () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
            if (toggleIcon) toggleIcon.innerHTML = isDark ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      localStorage.setItem('sap-theme', isDark ? 'dark' : 'light');
    };

    if (themeToggle) {
      themeToggle.addEventListener('click', onThemeToggle);
    }

    // ── LEAFLET MAP (FOR FOOTER) ──
    function generatePerfectMap() {
      if (typeof window === 'undefined') return
      const container = document.getElementById('live-leaflet-map')
      if (!container) return
      if (container._leaflet_id) {
        container._leaflet_id = null
        container.innerHTML = ''
      }
      const officeCoords = [18.5076, 73.7918]
      import('leaflet').then(L => {
        if (container._leaflet_id) return
        const map = L.default.map('live-leaflet-map', {
          zoomControl: true,
          attributionControl: false
        }).setView(officeCoords, 16)
        L.default.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 19 }
        ).addTo(map)
        const marker = L.default.marker(officeCoords).addTo(map)
        marker.bindPopup(
          '<b>Shilpi Architects and planners</b><br>' +
          'K.P.C.S House,Office No.6,Right Bhusari Colony,<br>' +
          'Above Bank of Maharashtra,Paud Road,Kothrud,Pune-411038.'
        ).openPopup()
        setTimeout(() => map.invalidateSize(true), 200)
      })
    }
    generatePerfectMap();


    // ── HAMBURGER & DROPDOWN ──
    const hamburger = document.getElementById('mob-hamburger')
    const dropdown = document.getElementById('mob-dropdown')

    const onHamburgerClick = (e) => {
      e.stopPropagation()
      const isOpen = dropdown.classList.contains('open')
      if (isOpen) {
        dropdown.classList.remove('open')
        hamburger.classList.remove('open')
      } else {
        dropdown.classList.add('open')
        hamburger.classList.add('open')
      }
    }

    const onDocumentClick = (e) => {
      if (dropdown && hamburger) {
        if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
          dropdown.classList.remove('open')
          hamburger.classList.remove('open')
        }
      }
    }

    if (hamburger && dropdown) {
      hamburger.addEventListener('click', onHamburgerClick)
    }

    document.addEventListener('click', onDocumentClick)

    const mobLinks = document.querySelectorAll('.news-mob-sub-btn')
    mobLinks.forEach(l => {
      l.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('open')
        if (dropdown) dropdown.classList.remove('open')
      })
    })

    // ── CURSOR ENGINE ──
    const initProjectsCursor = () => {
      const cur = document.getElementById('cur');
      const ring = document.getElementById('curRing');
      if (!cur || !ring) return;

      let mx = 0, my = 0, rx = 0, ry = 0;
      let cursorReady = false;

      const onMouseMove = (e) => {
        if (!cursorReady) {
          cursorReady = true;
          cur.style.opacity = '1';
          ring.style.opacity = '1';
        }
        mx = e.clientX;
        my = e.clientY;
        cur.style.left = mx + 'px';
        cur.style.top = my + 'px';
      };

      window.addEventListener('mousemove', onMouseMove);

      let animationFrameId;
      const cursorLoop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        animationFrameId = requestAnimationFrame(cursorLoop);
      };
      cursorLoop();

      const refreshHoverTargets = () => {
        document.querySelectorAll(
          'a, button, .ntab, .news-ntab, .mob-sub-btn, .news-mob-sub-btn, .footer-link'
        ).forEach(el => {
          el.removeEventListener('mouseenter', onMouseEnter);
          el.removeEventListener('mouseleave', onMouseLeave);

          el.addEventListener('mouseenter', onMouseEnter);
          el.addEventListener('mouseleave', onMouseLeave);
        });
      };

      function onMouseEnter() {
        ring.classList.add('hover');
        cur.classList.add('hover', 'dot');
      }

      function onMouseLeave() {
        ring.classList.remove('hover');
        cur.classList.remove('hover', 'dot');
      }

      refreshHoverTargets();

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    };

    const cleanupCursor = initProjectsCursor();

    return () => {
      if (themeToggle) themeToggle.removeEventListener('click', onThemeToggle);
      if (hamburger) hamburger.removeEventListener('click', onHamburgerClick);
      document.removeEventListener('click', onDocumentClick);
      if (cleanupCursor) cleanupCursor();
    }
  }, []);

  return (
    <>
      <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
      <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>

      {/* ── NAVBAR (HYBRID HOME-STYLE) ── */}
      <nav id="nav" className="news-nav">
        {/* Logo Link (Same as Projects) */}
        <div className="news-logo-wrapper">
          <Link className="news-logo-area" href="/">
            <img src="/logo.png" alt="SAP" />
            <div className="news-logo-text">
              SHILPI
              <small>ARCHITECTS &amp;&nbsp;PLANNERS</small>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links (Same 5 as Home page) */}
        <div id="nav-tabs" className="news-nav-tabs">
          <Link href="/practice" className="news-ntab" style={{ textDecoration: 'none' }}>Practice</Link>
          <Link href="/projects" className="news-ntab" style={{ textDecoration: 'none' }}>Projects</Link>
          <div className="labs-dropdown-wrapper">
            <Link href="/#labs" className="news-ntab" style={{ textDecoration: 'none' }}>Labs</Link>
            <div className="labs-dropdown-menu">
              <Link href="/labs/ai-computation">AI & Computation</Link>
              <Link href="/labs/civic-reform">Civic Reform Studio</Link>
              <Link href="/labs/urban-futures">Urban Futures Lab</Link>
            </div>
          </div>
          <Link href="/news" className="news-ntab active" style={{ textDecoration: 'none' }}>News</Link>
          <Link href="/contact" className="news-ntab" style={{ textDecoration: 'none' }}>Contact</Link>
        </div>

        {/* Right Nav (Search + Hamburger always visible) */}
        <div id="nav-right" className="news-nav-right">
          <div id="search-inline" className={`news-search-inline ${isSearchOpen ? 'open' : ''}`}>
            <input
              type="text"
              id="search-input"
              className="news-search-input-inline"
              placeholder="Search news..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setIsSearchOpen(false); setSearchQuery(''); } }}
              suppressHydrationWarning
            />
          </div>

          <button 
            className="news-nav-srch" 
            aria-label={isSearchOpen ? "Close Search" : "Search"} 
            id="search-btn" 
            onClick={() => {
              if (isSearchOpen) {
                setIsSearchOpen(false);
                setSearchQuery('');
              } else {
                setIsSearchOpen(true);
                setTimeout(() => document.getElementById('search-input')?.focus(), 180);
              }
            }}
            suppressHydrationWarning
          >
            {isSearchOpen ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="2" x2="11" y2="11" />
                <line x1="11" y1="2" x2="2" y2="11" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5.5" cy="5.5" r="4" />
                <line x1="9" y1="9" x2="12.5" y2="12.5" />
              </svg>
            )}
          </button>

          <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" suppressHydrationWarning>
            <span className="toggle-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
            
          </button>

          <button className="news-hamburger" id="mob-hamburger" aria-label="Menu" suppressHydrationWarning>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY DROPDOWN INTERFACE ── */}
      <div id="mob-dropdown" className="news-dropdown">
        <div className="news-dropdown-inner">
          <div className="news-mob-sub-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link href="/" className="news-mob-sub-btn">Home</Link>
            <Link href="/practice" className="news-mob-sub-btn">Practice</Link>
            <Link href="/projects" className="news-mob-sub-btn">Projects</Link>
            <Link href="/#labs" className="news-mob-sub-btn">Labs</Link>
            <Link href="/news" className="news-mob-sub-btn">News</Link>
            <Link href="/contact" className="news-mob-sub-btn">Contact</Link>
          </div>
        </div>
      </div>

      <main className="news-page-wrapper">
        <div className="news-content-area">

          {/* TITLE SECTION */}
          <div className="news-title-section">
            <h1 className="news-main-heading">News</h1>
          </div>

          {/* NEWS GRID */}
          <div className="news-grid-container">
            {newsList.filter(article => 
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (article.date && article.date.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((article, idx) => (
              <Link
                key={idx}
                href={`/news/${article.slug}`}
                className="news-card-link"
              >
                <div className="news-card-image-wrap">
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="news-card-bg-img"
                    style={{ objectPosition: article.objectPosition || 'center' }}
                  />
                </div>
                <div className="news-card-info">
                  <span className="news-card-title">{article.title}</span>
                  <div className="news-card-date-wrap">
                    <span className="news-card-date">{article.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER (Same as Home Page) */}
      <footer className="site-footer" id="contact">
        <h2 className="footer-cta-text">
          Based in Pune and creating solutions globally.
        </h2>
        <Link href="/contact" className="contact-trigger-link">
          Contact Us ;
        </Link>
        <div className="footer-details-map-container">
          <div className="footer-text-side">
            <div className="studio-address-block">
              <div className="address-box">
                <h3>Office</h3>
                <div className="footer-icon-line">
                  <svg className="footer-icon" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M12 21s-8-6.8-8-12a8 8 0 1116 0c0 5.2-8 12-8 12z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <div>
                    <p>Shilpi Architects and planners<br />
                      K.P.C.S House,Office No.6,Right Bhusari Colony,<br />
                      Above Bank of Maharashtra,Paud Road,Kothrud,Pune-411038.</p>
                  </div>
                </div>
              </div>
              <div className="contact-box">
                <h3>Contact</h3>
                <div className="footer-icon-line">
                  <svg className="footer-icon mail-icon" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M4 7l8 5 8-5M4 17h16V7H4v10z" />
                  </svg>
                  <p>shilpi.arch.plann@gmail.com</p>
                </div>
                <div className="footer-icon-line">
                  <svg className="footer-icon" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <div>
                    <p>+91 9822080730</p>
                    <p>+91 98501 67681</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="map-interactive-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d417.4589!2d73.7955247!3d18.5080785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2be4c5c6361b7%3A0xe077411deb04b9bb!2sShilpi%20Architects%20%26%20Planners!5e0!3m2!1sen!2sin!4v1717900000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', position: 'absolute', top: 0, left: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shilpi Architects — KPCS House, Paud Road, Kothrud, Pune"
            />
          </div>
        </div>
        <div className="footer-utility-row">
          <div className="footer-nav-column">
            <h4>Connect</h4>
            <a href="mailto:shilpi.arch.plann2@gmail.com" className="footer-link">
              <svg className="footer-social-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
              Email
            </a>
            <a href="https://www.instagram.com/shilpi_architects_and_planners?igsh=OXJwanZ4NzkwcjR6&utm_source=qr" className="footer-link" target="_blank" rel="noopener noreferrer">
              <svg className="footer-social-icon" viewBox="0 0 24 24"><path d="M7 2h10c2.76 0 5 2.76 5 5v10c0 2.76-2.24 5-5 5H7c-2.76 0-5-2.24-5-5V7c0-2.76 2.24-5 5-5zm10 2H7c-1.66 0-3 1.34-3 3v10c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3zm-5 3c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm4.75-2.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75.34-.75.75-.75.75.34.75.75z" /></svg>
              Instagram
            </a>
            <a href="https://www.facebook.com/share/1CJRRB16x9/" className="footer-link" target="_blank" rel="noopener noreferrer">
              <svg className="footer-social-icon" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
              Facebook
            </a>
            <a href="https://www.linkedin.com/company/shilpi-architects-&-planners---india/" className="footer-link" target="_blank" rel="noopener noreferrer">
              <svg className="footer-social-icon" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
              Linkedin
            </a>
          </div>
          <NewsletterForm />
        </div>
        <div className="footer-legal-block">
          <div className="legal-row-links">
            <span>© SAP Architecture 2026</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
          <p style={{ color: 'var(--ink-mute)', marginTop: '4px' }}>
            KOTHRUD, PUNE, MAHARASHTRA, INDIA
          </p>
        </div>
      </footer>
    </>
  )
}
