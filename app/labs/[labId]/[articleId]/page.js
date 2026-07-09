'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { getLabArticleById } from '../../../../lib/labsData'
import { createClient } from '../../../../utils/supabase/client'
import '../../../news/news.css'
import '../../../news/[slug]/newsArticle.css'

export default function LabArticle({ params }) {
  const resolvedParams = use(params)
  const labId = resolvedParams?.labId
  const articleId = resolvedParams?.articleId
  const [article, setArticle] = useState(getLabArticleById(labId, articleId))
  const [lightboxImg, setLightboxImg] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadDynamicArticle() {
      if (!articleId) return;
      const supabase = createClient();
      const { data } = await supabase.from('labs').select('*').eq('slug', articleId).single();
      
      if (data) {
        setArticle({
          id: data.slug,
          title: data.title,
          sub: data.subcategory,
          year: data.year,
          texts: data.texts,
          imgs: data.images,
          videos: data.videos,
          heroImage: data.hero_image,
          loc: data.location,
          client: data.client,
          typology: data.typology,
          size: data.size,
          status: data.status,
          icon: data.icon_url,
          isCertificates: data.is_certificates
        });
      }
    }
    loadDynamicArticle();
  }, [articleId]);

  useEffect(() => {
    if (!article) return

    // ── DARK MODE INIT ──
    const themeToggle = document.getElementById('themeToggle')
    const toggleIcon = document.querySelector('.toggle-icon')

    const isDarkSaved = localStorage.getItem('sap-theme') === 'dark'
    if (isDarkSaved) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    if (toggleIcon) toggleIcon.innerHTML = isDarkSaved ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`

    const onThemeToggle = () => {
      document.body.classList.toggle('dark-mode')
      const isDark = document.body.classList.contains('dark-mode')
      if (toggleIcon) toggleIcon.innerHTML = isDark ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      localStorage.setItem('sap-theme', isDark ? 'dark' : 'light')
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', onThemeToggle)
    }

    // ── SEARCH ──
    const searchBtn = document.getElementById('search-btn')
    const searchInput = document.getElementById('search-input')
    const searchCloseBtn = document.getElementById('search-close')
    const searchInline = document.getElementById('search-inline')
    const navWord = document.getElementById('nav-word')
    let searchActive = false

    function openSearch() {
      if (!searchInput) return
      searchActive = true
      if (searchInline) searchInline.classList.add('open')
      if (navWord) navWord.style.cssText = 'opacity:0;pointer-events:none;width:0;overflow:hidden'
      setTimeout(() => searchInput.focus(), 180)
    }

    function closeSearch() {
      if (!searchInput) return
      searchActive = false
      searchInput.value = ''
      if (searchInline) searchInline.classList.remove('open')
      if (navWord) navWord.style.cssText = ''
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        searchActive ? closeSearch() : openSearch()
      })
    }
    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', closeSearch)
    }
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSearch()
      })
    }

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
    const initCursor = () => {
      const cur = document.getElementById('cur')
      const ring = document.getElementById('curRing')
      if (!cur || !ring) return

      let mx = 0, my = 0, rx = 0, ry = 0
      let cursorReady = false

      const onMouseMove = (e) => {
        if (!cursorReady) {
          cursorReady = true
          cur.style.opacity = '1'
          ring.style.opacity = '1'
        }
        mx = e.clientX
        my = e.clientY
        cur.style.left = mx + 'px'
        cur.style.top = my + 'px'
      }

      window.addEventListener('mousemove', onMouseMove)

      let animationFrameId
      const cursorLoop = () => {
        rx += (mx - rx) * 0.18
        ry += (my - ry) * 0.18
        ring.style.left = rx + 'px'
        ring.style.top = ry + 'px'
        animationFrameId = requestAnimationFrame(cursorLoop)
      }
      cursorLoop()

      const refreshHoverTargets = () => {
        document.querySelectorAll(
          'a, button, .ntab, .news-ntab, .mob-sub-btn, .news-mob-sub-btn, .footer-link, .article-share-btn, .article-gallery-item'
        ).forEach(el => {
          el.removeEventListener('mouseenter', onMouseEnter)
          el.removeEventListener('mouseleave', onMouseLeave)
          el.addEventListener('mouseenter', onMouseEnter)
          el.addEventListener('mouseleave', onMouseLeave)
        })
      }

      function onMouseEnter() {
        ring.classList.add('hover')
        cur.classList.add('hover', 'dot')
      }

      function onMouseLeave() {
        ring.classList.remove('hover')
        cur.classList.remove('hover', 'dot')
      }

      refreshHoverTargets()

      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        cancelAnimationFrame(animationFrameId)
      }
    }

    const cleanupCursor = initCursor()

    // ── ESC to close lightbox ──
    const handleEsc = (e) => {
      if (e.key === 'Escape') setLightboxImg(null)
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      if (themeToggle) themeToggle.removeEventListener('click', onThemeToggle)
      if (hamburger) hamburger.removeEventListener('click', onHamburgerClick)
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('keydown', handleEsc)
      if (cleanupCursor) cleanupCursor()
    }
  }, [article])

  // ── Share handlers ──
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = article?.title || ''

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)
    let shareLink = ''

    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        break
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        return
      default:
        return
    }

    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  // ── 404 state ──
  if (!article) {
    return (
      <>
        <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
        <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>

        <nav id="nav" className="news-nav">
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
            <Link href="/practice" className="news-ntab" style={{ textDecoration: 'none' }}>Practice</Link>
            <Link href="/projects" className="news-ntab" style={{ textDecoration: 'none' }}>Projects</Link>
            <div className="labs-dropdown-wrapper">
              <Link href="/#labs" className="news-ntab active" style={{ textDecoration: 'none' }}>Labs</Link>
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
            <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
              <span className="toggle-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
            </button>
          </div>
        </nav>

        <main className="article-page-wrapper">
          <div className="article-content-area" style={{ textAlign: 'center', paddingTop: '200px' }}>
            <h1 className="article-headline">Article not found</h1>
            <Link href={`/labs/${labId}`} className="article-back-link" style={{ justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Labs
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
      <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>

      {/* ── NAVBAR (Same as news page) ── */}
      <nav id="nav" className="news-nav">
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
          <Link href="/practice" className="news-ntab" style={{ textDecoration: 'none' }}>Practice</Link>
          <Link href="/projects" className="news-ntab" style={{ textDecoration: 'none' }}>Projects</Link>
          <div className="labs-dropdown-wrapper">
            <Link href="/#labs" className="news-ntab active" style={{ textDecoration: 'none' }}>Labs</Link>
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
          <div id="search-inline" className="news-search-inline">
            <input
              type="text"
              id="search-input"
              className="news-search-input-inline"
              placeholder="Search labs..."
              autoComplete="off"
            />
            <button id="search-close" className="news-search-close-inline" aria-label="Close">
              ✕
            </button>
          </div>

          <button className="news-nav-srch" aria-label="Search" id="search-btn">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="5.5" cy="5.5" r="4" />
              <line x1="9" y1="9" x2="12.5" y2="12.5" />
            </svg>
          </button>

          <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
            <span className="toggle-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
          </button>

          <button className="news-hamburger" id="mob-hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
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

      {/* ── ARTICLE CONTENT (NO FOOTER) ── */}
      <main className="article-page-wrapper">
        <div className="article-content-area">

          {/* Back link */}
          <Link href={`/labs/${labId}`} className="article-back-link">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Labs
          </Link>

          {/* Hero Image */}
          <div className="article-hero-section" style={article.isCertificates ? { textAlign: 'center', background: '#f4f4f4', padding: '40px 20px' } : {}}>
            <img
              src={article.heroImage || article.imgs?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'}
              alt={article.title}
              className="article-hero-img"
              style={article.isCertificates ? { width: '100%', maxWidth: '500px', height: 'auto', aspectRatio: '1 / 1.414', objectFit: 'contain', margin: '0 auto', display: 'block', border: '1px solid #ddd', background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' } : {}}
            />
          </div>

          {/* Meta row */}
          <div className="article-meta-row">
            <span className="article-meta-tag">{article.sub}</span>
            <span className="article-meta-date">{article.year}</span>
          </div>

          {/* Headline */}
          <h1 className="article-headline">{article.title}</h1>

          {/* Divider */}
          <hr className="article-divider" />

          {/* Share buttons */}
          <div className="article-share-row">
            <span className="article-share-label">Share</span>

            {/* WhatsApp */}
            <button
              className="article-share-btn"
              aria-label="Share on WhatsApp"
              title="Share on WhatsApp"
              onClick={() => handleShare('whatsapp')}
            >
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>

            {/* Facebook */}
            <button
              className="article-share-btn"
              aria-label="Share on Facebook"
              title="Share on Facebook"
              onClick={() => handleShare('facebook')}
            >
              <svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            </button>

            {/* Twitter / X */}
            <button
              className="article-share-btn"
              aria-label="Share on X"
              title="Share on X"
              onClick={() => handleShare('twitter')}
            >
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>

            {/* LinkedIn */}
            <button
              className="article-share-btn"
              aria-label="Share on LinkedIn"
              title="Share on LinkedIn"
              onClick={() => handleShare('linkedin')}
            >
              <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            </button>

            {/* Copy Link */}
            <button
              className={`article-share-btn${copied ? ' copied' : ''}`}
              aria-label="Copy link"
              title={copied ? 'Copied!' : 'Copy link'}
              onClick={() => handleShare('copy')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                  <path d="M20 6L9 17l-5-5"/>
                ) : (
                  <>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Body Text & Images */}
          <div className="article-body">
            {article.isCertificates ? (
              <>
                {article.texts && article.texts.map((text, i) => (
                  <p key={`text-${i}`}>{text}</p>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '50px' }}>
                  {article.imgs && article.imgs.map((img, i) => {
                    // skip the hero image if it's already displayed
                    if (img === article.heroImage) return null;
                    return (
                      <div 
                        key={`cert-${i}`} 
                        onClick={() => setLightboxImg(img)}
                        style={{ cursor: 'zoom-in', textAlign: 'center' }}
                      >
                        <div style={{ padding: '15px', background: '#fff', border: '1px solid #eaeaea', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                          <img 
                            src={img} 
                            alt={`Certificate of Recognition ${i + 1}`} 
                            style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1.414', objectFit: 'contain' }} 
                          />
                        </div>
                        <h4 style={{ marginTop: '20px', fontSize: '1.1rem', fontWeight: '500', color: 'var(--ink-base, #333)' }}>
                          Certificate of Recognition
                        </h4>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (labId === 'ai-computation' || labId === 'civic-reform') ? (
              <>
                {Array.from({ length: Math.max(article.texts?.length || 0, (article.imgs?.filter(img => img !== article.heroImage) || []).length) }).map((_, i) => {
                  const filteredImgs = article.imgs ? article.imgs.filter(img => img !== article.heroImage) : [];
                  const text = article.texts?.[i];
                  const img = filteredImgs[i];
                  return (
                    <div key={`mixed-${i}`}>
                      {text && <p>{text}</p>}
                      {img && (
                        <div 
                          className="article-inline-image" 
                          onClick={() => setLightboxImg(img)}
                          style={{ cursor: 'zoom-in' }}
                        >
                          <img src={img} alt={`${article.title} — gallery ${i + 1}`} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <>
                {article.texts && article.texts.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
                
                {article.imgs && article.imgs.map((img, i) => {
                  if (img === article.heroImage) return null;
                  return (
                    <div 
                      key={`img-${i}`} 
                      className="article-inline-image" 
                      onClick={() => setLightboxImg(img)}
                      style={{ cursor: 'zoom-in' }}
                    >
                      <img src={img} alt={`${article.title} — gallery ${i + 1}`} />
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── LIGHTBOX ── */}
      {lightboxImg && (
        <div className="article-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="article-lightbox-close" onClick={() => setLightboxImg(null)} aria-label="Close">✕</button>
          <img src={lightboxImg} alt="Gallery full view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
