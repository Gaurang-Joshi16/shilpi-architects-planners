'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import NewsletterForm from '../components/NewsletterForm'
import { NEWS_ARTICLES } from '../lib/newsData'
import { LABS_DATA } from '../lib/labsData'
import { createClient } from '../utils/supabase/client'
import YouTubeVideoCard from '../components/YouTubeVideoCard'

function SVGTraceText({ text }) {
  return (
    <svg className="trace-text-svg" width="100%" height="36px" style={{ overflow: 'visible' }}>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle">
        {text.split('').map((char, index) => (
          <tspan
            key={index}
            className="trace-text-element"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {char}
          </tspan>
        ))}
      </text>
    </svg>
  );
}

let _loaderHasRun = false

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [dynamicLabsData, setDynamicLabsData] = useState(null)
  const [dynamicNewsData, setDynamicNewsData] = useState(null)
  const [loaderVisible, setLoaderVisible] = useState(!_loaderHasRun)

  // Dynamic stats calculation for labs
  const getLabStats = (labId) => {
    const lab = dynamicLabsData ? dynamicLabsData[labId] : LABS_DATA[labId];
    if (!lab) return [];

    const counts = {};
    lab.subs.forEach(sub => counts[sub] = 0);
    lab.projects.forEach(p => {
      counts[p.sub] = (counts[p.sub] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      // Fetch Labs
      const { data: labsData } = await supabase.from('labs').select('*').order('created_at', { ascending: false });
      if (labsData) {
        const grouped = {
          'ai-computation': { title: 'AI & computation', subs: ['Innovation', 'Tools', 'Pedagogy'], projects: [] },
          'civic-reform': { title: 'Civic reform studio', subs: ['Engagements', 'Academia', 'Media', 'Recognition'], projects: [] },
          'urban-futures': { title: 'Urban futures lab', subs: ['Exhibition', 'Research', 'Publications'], projects: [] }
        };
        labsData.forEach(p => {
          if (grouped[p.category]) {
            grouped[p.category].projects.push({
              id: p.slug,
              title: p.title,
              sub: p.subcategory,
              year: p.year,
              texts: p.texts
            });
          }
        });
        setDynamicLabsData(grouped);
      }

      // Fetch News
      const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (newsData && newsData.length > 0) {
        setDynamicNewsData(newsData.map(n => ({
          slug: n.slug,
          title: n.title,
          date: n.date,
          heroImage: n.hero_image
        })));
      }
    }
    fetchData();
  }, []);

  useEffect(() => {

    /* ── MODULE-LEVEL LOADER GUARD ────────────────────────────────────────
       Because Next.js uses client-side routing, the JavaScript environment
       (and thus module-level variables) is preserved when navigating between
       pages. So _loaderHasRun stays true when we go to /projects and back,
       skipping the loader as desired. 
       
       However, a hard refresh (F5/Ctrl+R) completely destroys and recreates
       the JavaScript environment, resetting _loaderHasRun to false and 
       naturally playing the loader exactly when it should. ── */

    if (_loaderHasRun && !loaderVisible) {
      // If we navigate back, we just initialize the DOM stuff
      initCounters()
      generatePerfectMap()
      initHamburger()
      initReveal()
      startClock()
      initCursor()
      initDarkMode()
      playHeroVideo()

      return
    }

    /* ── ALL EXISTING LOADER CODE BELOW — COMPLETELY UNCHANGED ── */

    const loaderLayer = document.getElementById('loader-layer');
    const loaderFlightCapsule = document.getElementById('loader-flight-capsule');
    const morphContainer = document.getElementById('morph-container');
    const loaderLogoImg = document.querySelector('.loader-logo-img');
    const mainContent = document.getElementById('main-content');
    const targetNavbarLogo = document.getElementById('target-navbar-logo');

    /* ── Mark this session as loaded RIGHT NOW, before the animation starts. ── */
    _loaderHasRun = true;

    setTimeout(() => {
      morphContainer.classList.add('is-expanded');
      setTimeout(() => {
        morphContainer.classList.remove('is-expanded');
        setTimeout(() => {
          const destinationRect = targetNavbarLogo.getBoundingClientRect();
          const deltaX = destinationRect.left +
            (destinationRect.width / 2) -
            (window.innerWidth / 2) + 110;
          const deltaY = destinationRect.top +
            (destinationRect.height / 2) -
            (window.innerHeight / 2) + 60;

          morphContainer.style.fontSize = '16px';
          morphContainer.style.fontWeight = '700';
          morphContainer.style.letterSpacing = '0.10em';
          morphContainer.style.transition =
            'font-size 0.95s ease, letter-spacing 0.95s ease';

          if (loaderLogoImg) {
            loaderLogoImg.style.width = '28px';
            loaderLogoImg.style.height = '28px';
            loaderLogoImg.style.transition =
              'width 0.95s ease, height 0.95s ease';
          }

          loaderFlightCapsule.style.transition =
            'transform 0.95s cubic-bezier(0.25,1,0.5,1)';
          loaderFlightCapsule.style.transform =
            `translate(${deltaX}px, ${deltaY}px)`;

          loaderLayer.style.opacity = '0';
          loaderLayer.style.transition = 'opacity 0.8s ease';

          setTimeout(() => {
            setLoaderVisible(false);

            const actualNavText = targetNavbarLogo
              .querySelector('.nav-logo-placeholder');
            if (actualNavText)
              actualNavText.style.opacity = '1';

            const logoImage = document.querySelector('.sap-logo-img');
            if (logoImage) logoImage.style.opacity = '1';

            initCounters();
            generatePerfectMap();
            initHamburger();
            initReveal();
            startClock();
            initCursor();
            initDarkMode();
            playHeroVideo();

          }, 950);
        }, 1000);
      }, 2500);
    }, 1000);


    function startClock() {
      function tick() {
        const d = new Date();
        const opts = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        };
        const t = new Intl.DateTimeFormat('en-GB', opts).format(d);
        const el = document.getElementById('clk');
        if (el) el.textContent = t + ' IST';
      }
      tick();
      setInterval(tick, 15000);
    }

    function initHamburger() {
      const hamburgerMenu = document.getElementById('hamburger-menu');
      const mobileNav = document.getElementById('main-nav');
      if (hamburgerMenu && mobileNav) {
        if (!hamburgerMenu.hasAttribute('data-bound')) {
          hamburgerMenu.setAttribute('data-bound', 'true');
          hamburgerMenu.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
            const header = document.querySelector('.site-header');
            if (header) header.classList.toggle('menu-open');
          });

          const navLinks = mobileNav.querySelectorAll('.nav-link');
          navLinks.forEach(link => {
            link.addEventListener('click', () => {
              mobileNav.classList.remove('active');
              hamburgerMenu.classList.remove('active');
              const header = document.querySelector('.site-header');
              if (header) header.classList.remove('menu-open');
            });
          });
        }
      }
    }

    function initReveal() {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('[data-reveal]')
        .forEach(el => io.observe(el));
    }

    function initCounters() {
      const counterElements = document.querySelectorAll('.metric-number');
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = parseInt(
                entry.target.getAttribute('data-target'), 10);
              animateSingleCounter(entry.target, target);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 }
      );
      counterElements.forEach(el => counterObserver.observe(el));
    }

    function animateSingleCounter(element, target) {
      const suffix = element.getAttribute('data-suffix') || '';
      let startValue = 0;
      const totalDuration = 2000;
      const frameInterval = 1000 / 60;
      const totalSteps = totalDuration / frameInterval;
      const incrementValue = target / totalSteps;
      const counterTimer = setInterval(() => {
        startValue += incrementValue;
        if (startValue >= target) {
          element.innerHTML = target + (suffix ? `<span class="metric-suffix">${suffix}</span>` : '');
          clearInterval(counterTimer);
        } else {
          element.innerHTML = Math.floor(startValue) + (suffix ? `<span class="metric-suffix">${suffix}</span>` : '');
        }
      }, frameInterval);
    }

    function generatePerfectMap() {
      if (typeof window === 'undefined') return
      const container = document.getElementById('live-leaflet-map')
      if (!container) return
      if (container._leaflet_id) {
        container._leaflet_id = null
        container.innerHTML = ''
      }
      const officeCoords = [18.5081511, 73.7960535]
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

    function initCursor() {
      const cur = document.getElementById('cur');
      const ring = document.getElementById('curRing');
      let mx = 0, my = 0, rx = 0, ry = 0;
      let cursorReady = false;

      window.addEventListener('mousemove', e => {
        if (!cursorReady) {
          cursorReady = true;
          cur.style.opacity = '1';
          ring.style.opacity = '1';
        }
        mx = e.clientX;
        my = e.clientY;
        cur.style.left = mx + 'px';
        cur.style.top = my + 'px';
      });

      function cursorLoop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(cursorLoop);
      }
      cursorLoop();

      document.querySelectorAll(
        'a, .lab, .news-card, .category-card, .commission-btn, button'
      ).forEach(el => {
        el.addEventListener('mouseenter', () => {
          ring.classList.add('hover');
          cur.classList.add('hover', 'dot');
        });
        el.addEventListener('mouseleave', () => {
          ring.classList.remove('hover');
          cur.classList.remove('hover', 'dot');
        });
      });
    }

    function initDarkMode() {
      const themeToggle = document.getElementById('themeToggle');
            const toggleIcon = document.querySelector('.toggle-icon');

      /* Always restore the persisted theme class and button labels
         on every mount (important after back navigation). */
      const isDarkSaved = localStorage.getItem('sap-theme') === 'dark';
      if (isDarkSaved) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
            if (toggleIcon) toggleIcon.innerHTML = isDarkSaved ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

      /* Prevent duplicate listeners — only attach once per button lifecycle.
         React re-mounts this component on every back navigation which would
         stack up multiple click handlers, causing the toggle to cancel itself. */
      if (themeToggle && !themeToggle.dataset.dmInit) {
        themeToggle.dataset.dmInit = '1';
        themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-mode');
          const isDark = document.body.classList.contains('dark-mode');
                    if (toggleIcon) toggleIcon.innerHTML = isDark ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
          localStorage.setItem('sap-theme', isDark ? 'dark' : 'light');
        });
      }
    }

    // Video autoPlay & reset logic
    function playHeroVideo() {
      const video = document.getElementById('hero-video');
      if (video) {
        video.currentTime = 0;
        video.play().catch(e => console.log('Video autoplay prevented', e));

        const btn = document.getElementById('hero-video-toggle');
        if (btn) {
          btn.textContent = '❚❚';
          btn.setAttribute('aria-label', 'Pause video');
        }
      }
    }
  }, [])

  return (
    <>
      <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
      <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>
      <div className="vignette" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>
      <div className="sheet-frame" aria-hidden="true"></div>

      {/* LOADER */}
      <div id="loader-layer" className="loader-layer" style={{ display: loaderVisible ? 'flex' : 'none' }}>
        <div
          id="loader-flight-capsule"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}
        >
          <div className="loader-logo-wrap">
            <img src="/logo.png" alt="Shilpi" className="loader-logo-img" />
          </div>
          <div id="morph-container" className="morph-container">
            <div className="word-block">
              <span className="root-letter">S</span>
              <span className="suffix-letters">hilpi</span>
            </div>
            <div className="word-block">
              <span className="root-letter">A</span>
              <span className="suffix-letters">rchitects</span>
            </div>
            <div className="ampersand-block" id="loader-amp">
              &nbsp;&amp;&nbsp;
            </div>
            <div className="word-block">
              <span className="root-letter">P</span>
              <span className="suffix-letters">lanners</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div id="main-content" className={`main-content ${loaderVisible ? 'hidden' : 'visible'}`}>

        <header className="site-header">
          <div
            className="logo-box-destination"
            id="target-navbar-logo"
            onClick={() => window.location.href = '/'}
            style={{ cursor: 'pointer' }}
          >
            <img src="/logo.png" alt="Shilpi Architects & Planners" className="sap-logo-img" style={{ opacity: loaderVisible ? 0 : 1 }} />
            <div className="nav-logo-placeholder" style={{ opacity: loaderVisible ? 0 : 1 }}>
              SHILPI ARCHITECTS &amp;&nbsp;PLANNERS
            </div>
          </div>
          <nav className="main-nav" id="main-nav">
            <Link href="/practice" className="nav-link">
              <span className="n"></span> Practice
            </Link>
            <Link href="/projects" className="nav-link">
              <span className="n"></span> Projects
            </Link>
            <div className="labs-dropdown-wrapper">
              <Link href="/#labs" className="nav-link">
                <span className="n"></span> Labs
              </Link>
              <div className="labs-dropdown-menu">
                <Link href="/labs/ai-computation">AI & Computation</Link>
                <Link href="/labs/civic-reform">Civic Reform Studio</Link>
                <Link href="/labs/urban-futures">Urban Futures Lab</Link>
              </div>
            </div>
            <Link href="/news" className="nav-link">
              <span className="n"></span> News
            </Link>
            <Link href="/contact" className="nav-link">
              <span className="n"></span> Contact
            </Link>
          </nav>
          <div className="right-nav-group">
            <span className="live-indicator" id="clk">
              — : —&nbsp;IST
            </span>
            <button
              className="theme-toggle"
              id="themeToggle"
              aria-label="Toggle dark mode"
            >
              <span className="toggle-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
              
            </button>
            <div className="hamburger-menu" id="hamburger-menu">
              <span></span><span></span><span></span>
            </div>
          </div>
        </header>

        <main>

          {/* HERO SECTION */}
          <section className="hero-reel-section">
            <div className="video-container-box">
              <video
                id="hero-video"
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              >
                <source src="/homepage.mp4" type="video/mp4" />
              </video>
              <button
                id="hero-video-toggle"
                className="hero-video-toggle"
                aria-label="Pause video"
                onClick={() => {
                  const vid = document.getElementById('hero-video');
                  const btn = document.getElementById('hero-video-toggle');
                  if (vid.paused) { vid.play(); btn.textContent = '❚❚'; btn.setAttribute('aria-label', 'Pause video'); }
                  else { vid.pause(); btn.textContent = '▶'; btn.setAttribute('aria-label', 'Play video'); }
                }}
              >
                ❚❚
              </button>
            </div>
          </section>

          {/* STATEMENT 1 */}
          <section className="statement-section" data-reveal="">
            <h2 className="statement-text">
              Shilpi Architects &amp; Planners is a practice that
              designs for a resilient world. We believe that great
              environments are not imposed; they emerge from the
              intelligent relationship between people, movement,
              economy, and place.
            </h2>
          </section>



          <section style={{ padding: "0 var(--pad) 60px" }}>
            <div className="category-matrix-grid">
              <Link className="category-card" data-reveal="" href="/projects?cat=architecture" style={{ backgroundImage: 'url(/architecture.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundOrigin: 'content-box', backgroundClip: 'content-box', padding: '48px', position: 'relative' }}>
                <div className="category-card-badge">
                  Architecture
                </div>
              </Link>
              <Link className="category-card" data-reveal="" href="/projects?cat=interiors" style={{ backgroundImage: 'url(/interior.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundOrigin: 'content-box', backgroundClip: 'content-box', padding: '48px', position: 'relative' }}>
                <div className="category-card-badge">
                  Interior
                </div>
              </Link>
              <Link className="category-card" data-reveal="" href="/projects?cat=landscape" style={{ backgroundImage: 'url(/landscape.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundOrigin: 'content-box', backgroundClip: 'content-box', padding: '48px', position: 'relative' }}>
                <div className="category-card-badge">
                  Landscape
                </div>
              </Link>
              <Link className="category-card" data-reveal="" href="/projects?cat=urbanism" style={{ backgroundImage: 'url(/urbanism.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundOrigin: 'content-box', backgroundClip: 'content-box', padding: '48px', position: 'relative' }}>
                <div className="category-card-badge">
                  Urbanism
                </div>
              </Link>
              <Link className="category-card" data-reveal="" href="/projects?cat=art" style={{ backgroundImage: 'url(/art.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundOrigin: 'content-box', backgroundClip: 'content-box', padding: '48px', position: 'relative' }}>
                <div className="category-card-badge">
                  Art
                </div>
              </Link>
            </div>
          </section>

          {/* STATEMENT 2 */}
          <section
            className="statement-section"
            data-reveal=""
            style={{ paddingTop: '40px', paddingBottom: '20px' }}
          >
            <h2
              className="statement-text"
              style={{ textAlign: 'right', marginLeft: 'auto' }}
            >
              Our methodology for space arrangement <br />
              initiates with a highly calculated, inclusive mindset.
            </h2>
          </section>

          {/* METRICS SECTION */}
          <section className="metrics-section" id="about">
            <div className="metrics-grid-row">
              <div className="metric-block">
                <span className="metric-number" data-target="30">
                  0
                </span>
                <span className="metric-label">
                  Years Of Practice
                </span>
              </div>
              <div className="metric-block">
                <span className="metric-number" data-suffix="+" data-target="200">
                  0
                </span>
                <span className="metric-label">
                  Urban Public Interventions
                </span>
              </div>
              <div className="metric-block">
                <span className="metric-number" data-suffix="+" data-target="55">
                  0
                </span>
                <span className="metric-label">
                  Million Sq.ft Built
                </span>
              </div>
            </div>
            <h3 className="metrics-sub-heading">
              Shilpi Architects and Planners introduces calculated structural paradigms to
              advance community environments across a global
              layout framework.
            </h3>
          </section>

          {/* LABS SECTION */}
          <section className="labs-section" id="labs">
            <div className="section-head" data-reveal="">
              <h2>The Three <em>Labs</em>.</h2>
              <div className="meta">
                <strong>ONE STUDIO · THREE ARMS</strong><br />
                PUNE
              </div>
            </div>

            <div className="lab-diagram" data-reveal="">
              <svg viewBox="0 0 500 420" preserveAspectRatio="xMidYMid meet">
                <line x1="250" y1="60" x2="80" y2="350"
                  stroke="#163B5E" strokeWidth="1.5"
                  strokeDasharray="4 6" opacity="0.7" />
                <line x1="250" y1="60" x2="420" y2="350"
                  stroke="#163B5E" strokeWidth="1.5"
                  strokeDasharray="4 6" opacity="0.7" />
                <line x1="80" y1="350" x2="420" y2="350"
                  stroke="#163B5E" strokeWidth="1.5"
                  strokeDasharray="4 6" opacity="0.7" />
                <circle cx="250" cy="60" r="10"
                  fill="#FFFFFF" stroke="#45A8A1" strokeWidth="1.5" />
                <circle cx="80" cy="350" r="10"
                  fill="#FFFFFF" stroke="#45A8A1" strokeWidth="1.5" />
                <circle cx="420" cy="350" r="10"
                  fill="#FFFFFF" stroke="#45A8A1" strokeWidth="1.5" />
                <circle cx="250" cy="253" r="16"
                  fill="#C87D30" stroke="#163B5E" strokeWidth="1" />
                <text x="250" y="285" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9" fontWeight="bold" letterSpacing="0.14em"
                  fill="#163B5E">SAP</text>
                <text x="250" y="38" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9" fontWeight="bold" letterSpacing="0.14em"
                  fill="#163B5E">AI · COMPUTATION</text>
                <text x="250" y="25" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="8" fontWeight="bold" letterSpacing="0.14em"
                  fill="#45A8A1">01</text>
                <text x="80" y="382" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9" fontWeight="bold" letterSpacing="0.14em"
                  fill="#163B5E">CIVIC REFORM</text>
                <text x="80" y="397" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="8" fontWeight="bold" letterSpacing="0.14em"
                  fill="#45A8A1">02</text>
                <text x="420" y="382" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9" fontWeight="bold" letterSpacing="0.14em"
                  fill="#163B5E">URBAN FUTURES</text>
                <text x="420" y="397" textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="8" fontWeight="bold" letterSpacing="0.14em"
                  fill="#45A8A1">03</text>
              </svg>
            </div>

            <div className="lab-grid">

              {/* LAB 01 — AI & Computation */}
              <article className="lab" data-reveal="">
                <div className="lab-head">
                  <div>
                    <div className="id">SAP · 01</div>
                    <h3>AI &amp;{' '}
                      <em>Computation</em>
                    </h3>
                  </div>
                  {/* <span className="badge active">▌ Active · 5</span> */}
                </div>
                <p className="desc">Generative design, ML-aided
                  masterplanning, computational typology. We build
                  internal tools that learn from regional vernaculars
                  and reason about land, climate, and policy together.
                </p>
                <div className="stats">
                  {getLabStats('ai-computation').map((stat, idx) => (
                    <div key={idx}>
                      <span className="v">{stat.count.toString().padStart(2, '0')}</span>
                      <span className="l">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="recent">
                  <span className="h">▌ Recent</span>
                  <ul>
                    {(dynamicLabsData ? dynamicLabsData['ai-computation'] : LABS_DATA['ai-computation']).projects.slice(0, 3).map((p, idx) => (
                      <li key={idx}>
                        {p.title.length > 35 ? p.title.substring(0, 35) + '...' : p.title}{' '}
                        <em>/ {p.sub}</em>
                        <span>{p.year}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/labs/ai-computation" className="enter">
                  Enter Lab
                </Link>
                <div className="corner-glyph">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="30" />
                    <circle cx="50" cy="50" r="18" />
                    <line x1="20" y1="50" x2="80" y2="50" />
                    <line x1="50" y1="20" x2="50" y2="80" />
                    <circle cx="50" cy="50" r="3" />
                  </svg>
                </div>
              </article>

              {/* LAB 02 — Civic Reform Studio */}
              <article className="lab" data-reveal="">
                <div className="lab-head">
                  <div>
                    <div className="id">SAP · 02</div>
                    <h3>Civic <em>Reform</em> Studio</h3>
                  </div>
                  {/* <span className="badge active">▌ Active · 9</span> */}
                </div>
                <p className="desc">Embedded engagements with
                  municipalities and planning authorities. We design
                  instruments — TDR frameworks, FSI bonuses, reform
                  pilots — and teach the cadres who use them.
                </p>
                <div className="stats">
                  {getLabStats('civic-reform').map((stat, idx) => (
                    <div key={idx}>
                      <span className="v">{stat.count.toString().padStart(2, '0')}</span>
                      <span className="l">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="recent">
                  <span className="h">▌ Recent</span>
                  <ul>
                    {(dynamicLabsData ? dynamicLabsData['civic-reform'] : LABS_DATA['civic-reform']).projects.slice(0, 3).map((p, idx) => (
                      <li key={idx}>
                        {p.title.length > 35 ? p.title.substring(0, 35) + '...' : p.title}{' '}
                        <em>/ {p.sub}</em>
                        <span>{p.year}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/labs/civic-reform" className="enter">
                  Enter Studio
                </Link>
                <div className="corner-glyph">
                  <svg viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="60" />
                    <line x1="20" y1="40" x2="80" y2="40" />
                    <line x1="20" y1="60" x2="80" y2="60" />
                    <line x1="40" y1="20" x2="40" y2="80" />
                    <line x1="60" y1="20" x2="60" y2="80" />
                    <rect x="40" y="40" width="20" height="20"
                      fill="rgba(69,168,161,0.25)" />
                  </svg>
                </div>
              </article>

              {/* LAB 03 — Urban Futures Lab */}
              <article className="lab" data-reveal="">
                <div className="lab-head">
                  <div>
                    <div className="id">SAP · 03</div>
                    <h3>Urban <em>Futures</em> Lab</h3>
                  </div>
                  {/* <span className="badge active">▌ Active · 7</span> */}
                </div>
                <p className="desc">A speculative research arm
                  studying the Indian city in transition — corridor
                  urbanism, climate adaptation, heritage futures.
                  Outputs: atlases, exhibitions, white papers,
                  occasional buildings.
                </p>
                <div className="stats">
                  {getLabStats('urban-futures').map((stat, idx) => (
                    <div key={idx}>
                      <span className="v">{stat.count.toString().padStart(2, '0')}</span>
                      <span className="l">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="recent">
                  <span className="h">✦ Recent</span>
                  <ul>
                    {(dynamicLabsData ? dynamicLabsData['urban-futures'] : LABS_DATA['urban-futures']).projects.slice(0, 3).map((p, idx) => (
                      <li key={idx}>
                        {p.title.length > 35 ? p.title.substring(0, 35) + '...' : p.title}{' '}
                        <em>/ {p.sub}</em>
                        <span>{p.year}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/labs/urban-futures" className="enter">
                  Enter Lab
                </Link>
                <div className="corner-glyph">
                  <svg viewBox="0 0 100 100">
                    <polyline
                      points="15,80 35,55 55,65 75,30 90,45" />
                    <circle cx="35" cy="55" r="2.5" />
                    <circle cx="75" cy="30" r="2.5" />
                    <circle cx="55" cy="65" r="2.5" />
                    <line x1="10" y1="85" x2="95" y2="85" />
                    <line x1="15" y1="15" x2="15" y2="85" />
                  </svg>
                </div>
              </article>

            </div>
          </section>

          {/* NEWS SECTION */}
          <section id="news">
            <div className="news-header-row">
              <h2 className="news-section-title">
                STUDIO <em>Chronicle</em>.
              </h2>
              <Link href="/news" className="view-all-link">
                View All ↗
              </Link>
            </div>
            <div className="news-matrix-carousel">
              {(dynamicNewsData || NEWS_ARTICLES).slice(0, 4).map((article, idx) => (
                <Link key={idx} href={`/news/${article.slug}`} className="news-card" data-reveal="" style={{ textDecoration: 'none' }}>
                  <div className="news-img-frame">
                    <img src={article.heroImage} alt={article.title} loading="lazy" />
                  </div>
                  <div className="news-info-meta">
                    <p className="news-headline">{article.title}</p>
                    <span className="news-date">{article.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* VIDEOS SECTION */}
          <section className="videos-section" id="videos">
            <div
              className="news-header-row"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <h2 className="news-section-title">
                ACOUSTIC <em>blueprints</em>.
              </h2>
              <a
                href="https://www.youtube.com/@ParasNetragaonkar"
                target="_blank"
                className="view-all-link"
              >
                View Channel ↗
              </a>
            </div>
            <div className="videos-grid">
              <YouTubeVideoCard
                url="https://youtu.be/ev0YKCMommE"
                tag="EP 01"
                defaultTitle="Aalap Garden | An Inclusive Musical Garden | Wakad, Pune | Shilpi Architects and Planners"
                date="MAY 2026"
                duration="04:15"
              />
              <YouTubeVideoCard
                url="https://youtu.be/-AW-KNb1Zxo"
                tag=" EP 02"
                defaultTitle="Badhekar Horizon | Mixed-Use Development | Karve Road, Pune | Shilpi Architects and Planners"
                date="APR 2026"
                duration="03:22"
              />
              <YouTubeVideoCard
                url="https://youtu.be/qsuv0L5aKhE"
                tag="EP 03"
                defaultTitle="Shaheed Ashok Kamte Udyan | Landscape Architecture | Pimple Nilakh | Shilpi Architects and Planners"
                date="MAR 2026"
                duration="02:50"
              />
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="site-footer" id="contact">
          <h2 className="footer-cta-text">
            Based in Pune and creating solutions globally.
          </h2>
          <a href="/contact" className="contact-trigger-link">
            Contact Us ;
          </a>
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

      </div>
    </>
  )
}
