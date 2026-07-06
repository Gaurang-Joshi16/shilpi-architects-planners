'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import NewsletterForm from '../../components/NewsletterForm'
import '../news/news.css'
import './practice.css'

import { createClient } from '../../utils/supabase/client'

function buildMarqueeGrid(members) {
  if (!members || members.length === 0) return [];
  // Duplicate the array to populate the 24-slot marquee block
  const TEAM_MEMBERS = [...members, ...members, ...members].slice(0, 24);

  // 12 columns, 24 slots. Repeats the 6-column visual pattern exactly twice per group block.
  const pattern = [
    [false, true, true],
    [true, false, true],
    [false, true, true],
    [true, true, false],
    [true, true, false],
    [true, false, true],
    [false, true, true],
    [true, false, true],
    [false, true, true],
    [true, true, false],
    [true, true, false],
    [true, false, true]
  ]
  const cells = []
  let mi = 0
  for (let col = 0; col < pattern.length; col++) {
    for (let row = 0; row < 3; row++) {
      if (pattern[col][row] && mi < TEAM_MEMBERS.length) {
        cells.push({ ...TEAM_MEMBERS[mi], key: `member-${mi}` })
        mi++
      } else {
        cells.push({ blank: true, key: `blank-${col}-${row}` })
      }
    }
  }
  return cells
}


export default function Practice() {
  const supabase = createClient()
  const [modalData, setModalData] = useState(null)
  const [activeBubble, setActiveBubble] = useState(null)
  const scrollerRef = useRef(null)

  // Supabase Data State
  const [directors, setDirectors] = useState([])
  const [staff, setStaff] = useState([])
  const [settings, setSettings] = useState({
    title: 'Our Practice.',
    subtitle: 'Architects, urbanists, thinkers, facilitators and resource strategists.',
    introHeading: 'At SAP, We don\'t just design spaces; we design the future relationships between people, place, and possibility. We see every project as a thread in a much larger urban tapestry. By connecting human aspirations with the dynamics of cities, landscapes, and economies, we create places that contribute not just to skylines, but to the future of society itself.',
    introParagraph: 'Led by Principal Architect Paras Netragaonkar, our team brings together architects, urban planners, engineers, technicians, facilitators, resource strategists, and AI artisans. Together, we connect ideas, people, technology, and resources to shape places that perform at every scale— from buildings to cities.',
    mainImage: '/Teams/main team image.jpeg',
    portraitImage: '/Teams/principal architects.jpeg',
    slideshow: ['/Teams/slideshow/1.jpeg', '/Teams/slideshow/2.jpeg', '/Teams/slideshow/3.jpeg', '/Teams/slideshow/4.jpeg']
  })

  useEffect(() => {
    async function fetchData() {
      const { data: dData } = await supabase.from('team_members').select('*').eq('type', 'director').order('order_index');
      if (dData) setDirectors(dData);

      const { data: sData } = await supabase.from('team_members').select('*').eq('type', 'staff').order('order_index');
      if (sData) setStaff(sData);

      const { data: setts } = await supabase.from('site_settings').select('value').eq('key', 'practice_page').single();
      if (setts?.value) setSettings(prev => ({ ...prev, ...setts.value }));
    }
    fetchData();
  }, [])

  function openDirectorModal(director) {
    setModalData(director)
    document.body.style.overflow = 'hidden'
  }

  function closeDirectorModal() {
    setModalData(null)
    document.body.style.overflow = ''
  }

  function toggleSpotlight(member, cellId) {
    if (activeBubble === cellId) {
      clearSpotlight()
      return
    }
    setActiveBubble(cellId)
    if (scrollerRef.current) {
      scrollerRef.current.classList.add('paused', 'spotlight-active')
    }
  }

  function clearSpotlight() {
    setActiveBubble(null)
    if (scrollerRef.current) {
      scrollerRef.current.classList.remove('paused', 'spotlight-active')
    }
  }

  useEffect(() => {
    const handleOutsideClick = () => {
      if (activeBubble) {
        clearSpotlight();
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeBubble]);

  useEffect(() => {
    // ── DARK MODE INIT ──
    const themeToggle = document.getElementById('themeToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const toggleIcon = document.querySelector('.toggle-icon');

    const isDarkSaved = localStorage.getItem('sap-theme') === 'dark';
    if (isDarkSaved) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    if (toggleLabel) toggleLabel.textContent = isDarkSaved ? 'LIGHT' : 'DARK';
    if (toggleIcon) toggleIcon.textContent = isDarkSaved ? '○' : '◑';

    const onThemeToggle = () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      if (toggleLabel) toggleLabel.textContent = isDark ? 'LIGHT' : 'DARK';
      if (toggleIcon) toggleIcon.textContent = isDark ? '○' : '◑';
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

      const hoverSelectors = 'a, button, .news-ntab, .news-mob-sub-btn, .footer-link, .prac-director-card, .prac-matrix-cell:not(.blank-node)';

      const onMouseOver = (e) => {
        if (e.target.closest(hoverSelectors)) {
          ring.classList.add('hover');
          cur.classList.add('hover', 'dot');
        }
      };

      const onMouseOut = (e) => {
        if (e.target.closest(hoverSelectors)) {
          ring.classList.remove('hover');
          cur.classList.remove('hover', 'dot');
        }
      };

      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('mouseout', onMouseOut);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener('mouseover', onMouseOver);
        document.removeEventListener('mouseout', onMouseOut);
      };
    };

    const cleanupCursor = initProjectsCursor();

    // ── GRID CURSOR TRACKER ──
    const gridCursor = document.getElementById('prac-grid-cursor');
    const scrollerEl = document.getElementById('prac-marquee-viewport');
    let gridCursorActive = false;

    function onGridMouseMove(e) {
      if (gridCursor) {
        gridCursor.style.left = e.clientX + 'px';
        gridCursor.style.top = e.clientY + 'px';
      }
    }

    function onGridEnter() {
      gridCursorActive = true;
      if (gridCursor) gridCursor.classList.add('visible');
      // Hide the main cursor dots inside the grid
      const cur = document.getElementById('cur');
      const ring = document.getElementById('curRing');
      if (cur) cur.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    }

    function onGridLeave() {
      gridCursorActive = false;
      if (gridCursor) gridCursor.classList.remove('visible');
      const cur = document.getElementById('cur');
      const ring = document.getElementById('curRing');
      if (cur) cur.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
    }

    if (scrollerEl) {
      scrollerEl.addEventListener('mousemove', onGridMouseMove);
      scrollerEl.addEventListener('mouseenter', onGridEnter);
      scrollerEl.addEventListener('mouseleave', onGridLeave);
    }

    return () => {
      if (themeToggle) themeToggle.removeEventListener('click', onThemeToggle);
      if (cleanupCursor) cleanupCursor();
      if (hamburger) hamburger.removeEventListener('click', onHamburgerClick);
      document.removeEventListener('click', onDocumentClick);
      if (scrollerEl) {
        scrollerEl.removeEventListener('mousemove', onGridMouseMove);
        scrollerEl.removeEventListener('mouseenter', onGridEnter);
        scrollerEl.removeEventListener('mouseleave', onGridLeave);
      }
    }
  }, []);

  const marqueeGridCells = buildMarqueeGrid(staff)

  return (
    <>
      <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
      <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>

      {/* ── NAVBAR (news-nav with prac-nav wrapper) ── */}
      <nav id="nav" className="news-nav prac-nav">
        <div className="prac-nav-inner">
          <div className="news-logo-wrapper">
            <Link className="news-logo-area" href="/">
              <img src="/logo.png" alt="SAP" />
              <div className="news-logo-text">
                SHILPI
                <small>ARCHITECTS &amp;&nbsp;PLANNERS</small>
              </div>
            </Link>
          </div>

          <div id="nav-tabs" className="news-nav-tabs">
            <Link href="/practice" className="news-ntab active" style={{ textDecoration: 'none' }}>Practice</Link>
            <Link href="/projects" className="news-ntab" style={{ textDecoration: 'none' }}>Projects</Link>
            <div className="labs-dropdown-wrapper">
              <Link href="/#labs" className="news-ntab" style={{ textDecoration: 'none' }}>Labs</Link>
              <div className="labs-dropdown-menu">
                <Link href="/labs/ai-computation">AI & Computation</Link>
                <Link href="/labs/civic-reform">Civic Reform Studio</Link>
                <Link href="/labs/urban-futures">Urban Futures Lab</Link>
              </div>
            </div>
            <Link href="/news" className="news-ntab" style={{ textDecoration: 'none' }}>News</Link>
            <Link href="/contact" className="news-ntab" style={{ textDecoration: 'none' }}>Contact</Link>
          </div>

          <div id="nav-right" className="news-nav-right">
            <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" suppressHydrationWarning>
              <span className="toggle-icon">◑</span>
              <span className="toggle-label" id="toggleLabel">DARK</span>
            </button>
            <button className="news-hamburger" id="mob-hamburger" aria-label="Menu" suppressHydrationWarning>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY DROPDOWN ── */}
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

      <main className="prac-page-wrapper">

        {/* ── INTRO HEADER ── */}
        <div className="prac-intro-header">
          <h1 className="prac-title">{settings.title}</h1>
          <div className="prac-subtitle">
            {settings.subtitle}
          </div>
        </div>
        <div className="prac-divider"></div>

        <div className="prac-content-area">

          {/* ── INTRO SECTION: TEXT + IMAGE ── */}
          <section className="prac-asymmetric-row">
            <div className="prac-text-pane">
              <h2 className="prac-intro-subheading">
                {settings.introHeading}
              </h2>
              <p className="prac-narrative">
                {settings.introParagraph}
              </p>
            </div>
            <div className="prac-media-pane prac-hide-on-mobile">
            </div>
          </section>

          {/* ── FULL WIDTH GALLERY ── */}
          <section className="prac-full-width-gallery">
            <div className="prac-img-wrapper" style={{ aspectRatio: 'auto', maxHeight: 'none' }}>
              <img
                src={settings.mainImage}
                alt="SAP Studio Team"
              />
            </div>
          </section>

          {/* ── SECOND ASYMMETRIC ROW (both images same height) ── */}
          <section className="prac-asymmetric-row reversed prac-equal-height-row">
            <div className="prac-text-pane">
              <div className="prac-img-wrapper prac-stretch-img">
                <img
                  src={settings.portraitImage}
                  alt="Principal Architects"
                  style={{ objectFit: 'cover', objectPosition: 'top center', backgroundColor: 'var(--paper)' }}
                />
              </div>
            </div>
            <div className="prac-media-pane">
              <div className="prac-img-wrapper prac-stretch-img prac-slideshow">
                {settings.slideshow.map((img, idx) => (
                  <img key={idx} src={img} alt={`Slideshow Image ${idx+1}`} />
                ))}
              </div>
            </div>
          </section>

          {/* ── LEADERSHIP / DIRECTORS ── */}
          <section className="prac-leadership">
            <div className="prac-leadership-title">Team.</div>
            <div className="prac-directors-grid">
              {directors.map((d, i) => (
                <div
                  key={i}
                  className="prac-director-card"
                  onClick={() => openDirectorModal(d)}
                >
                  <div className="prac-img-wrapper">
                    <img src={d.image_url} alt={d.name} />
                  </div>
                  <div className="prac-profile-name">{d.name}</div>
                  <div className="prac-profile-role">
                    {d.role}
                  </div>
                  <div className="prac-card-socials" style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                    {d.email && (
                      <a href={`mailto:${d.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--ink)' }} title="Email">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </a>
                    )}
                    {d.linkedin && (
                      <a href={d.linkedin} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)' }} title="LinkedIn">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SPACER ── */}
          <div className="prac-spacer"></div>
        </div>

        {/* ── INFINITE MARQUEE TEAM SCROLLER ── */}
        <section
          className="prac-scroller-window"
          id="prac-marquee-viewport"
          ref={scrollerRef}
        >
          <div className="prac-marquee-track">
            {/* Group 1 */}
            <div className="prac-marquee-group">
              <div className="prac-matrix-block">
                {marqueeGridCells.map((cell, idx) => (
                  <div
                    key={`g1-${cell.key}`}
                    className={`prac-matrix-cell${cell.blank ? ' blank-node' : ''}${activeBubble === `g1-${cell.key}` ? ' active-focused' : ''}`}
                    onClick={!cell.blank ? (e) => { e.stopPropagation(); toggleSpotlight(cell, `g1-${cell.key}`); } : undefined}
                  >
                    {!cell.blank && (
                      <>
                        <div className="prac-img-wrapper">
                          <img src={cell.image_url} alt={cell.name} />
                        </div>
                        {activeBubble === `g1-${cell.key}` && (
                          <div className="prac-popup-bubble active">
                            <button
                              className="prac-popup-close"
                              onClick={(e) => { e.stopPropagation(); clearSpotlight(); }}
                            >×</button>
                            <div className="prac-popup-title-line">
                              <div className="prac-popup-name">{cell.name}</div>
                              <div className="prac-popup-role">{cell.role}</div>
                            </div>
                            <p className="prac-popup-quote">&quot;{cell.quote}&quot;</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Group 2 (duplicate for seamless loop) */}
            <div className="prac-marquee-group">
              <div className="prac-matrix-block">
                {marqueeGridCells.map((cell, idx) => (
                  <div
                    key={`g2-${cell.key}`}
                    className={`prac-matrix-cell${cell.blank ? ' blank-node' : ''}${activeBubble === `g2-${cell.key}` ? ' active-focused' : ''}`}
                    onClick={!cell.blank ? (e) => { e.stopPropagation(); toggleSpotlight(cell, `g2-${cell.key}`); } : undefined}
                  >
                    {!cell.blank && (
                      <>
                        <div className="prac-img-wrapper">
                          <img src={cell.image_url} alt={cell.name} />
                        </div>
                        {activeBubble === `g2-${cell.key}` && (
                          <div className="prac-popup-bubble active">
                            <button
                              className="prac-popup-close"
                              onClick={(e) => { e.stopPropagation(); clearSpotlight(); }}
                            >×</button>
                            <div className="prac-popup-title-line">
                              <div className="prac-popup-name">{cell.name}</div>
                              <div className="prac-popup-role">{cell.role}</div>
                            </div>
                            <p className="prac-popup-quote">&quot;{cell.quote}&quot;</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Custom grid navigation cursor */}
        <div className="prac-grid-cursor" id="prac-grid-cursor">
          <span className="gc-arrow">‹</span>
          <span className="gc-square"></span>
          <span className="gc-arrow">›</span>
        </div>


      </main>

      {/* ── DIRECTOR LIGHTBOX MODAL ── */}
      <div
        className={`prac-lightbox-backdrop${modalData ? ' active' : ''}`}
        onClick={closeDirectorModal}
      >
        {modalData && (
          <div className="prac-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button className="prac-lightbox-close" onClick={closeDirectorModal}>×</button>
            <div className="prac-lightbox-img">
              <img src={modalData.image_url} alt={modalData.name} />
            </div>
            <div className="prac-lightbox-info">
              <div className="prac-lightbox-info-inner">
                <h2 className="prac-lightbox-name">{modalData.name}</h2>
                <div className="prac-lightbox-role">{modalData.role}</div>
                <p className="prac-lightbox-bio">{modalData.bio}</p>
                <div className="prac-lightbox-socials">
                  {modalData.email && (
                    <a href={`mailto:${modalData.email}`} className="prac-social-link" title="Email">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </a>
                  )}
                  {modalData.linkedin && (
                    <a href={modalData.linkedin} target="_blank" rel="noopener noreferrer" className="prac-social-link" title="LinkedIn">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER (IDENTICAL TO NEWS/HOME) ── */}
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
