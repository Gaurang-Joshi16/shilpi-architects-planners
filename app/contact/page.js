'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './contact.css'

// ─── FORM DEFINITIONS ────────────────────────────────────────────────────────

const CATEGORIES = [
  'NEW CLIENTS / PROJECTS',
  'VENDORS',
  'APPLY FOR INTERNSHIP',
  'APPLY FOR JOB',
  'FOR MEDIA',
]

const TYPOLOGY_OPTIONS = [
  'Commercial', 'Mixed Use', 'Group Housing', 'Redevelopment',
  'Institutional', 'Health Care', 'Industrial', 'Landscape & Garden',
  'Resort', 'Residential Bungalow', 'Interiors',
]

const VENDOR_CATEGORY_OPTIONS = [
  'Architecture', 'Structural Engineering', 'Mechanical Engineering',
  'Electrical Engineering', 'Plumbing (PHE)', 'HVAC', 'ELV Systems',
  'Interiors', 'Acoustics', 'Landscape Design', 'Facade Engineering',
  'Lighting Design', 'Fire Safety Systems', 'Building Automation', 'Others',
]

// ─── INDIVIDUAL FORM COMPONENTS ───────────────────────────────────────────────

function FormNewClients({ onSuccess }) {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.target)
    fd.append('category', 'NEW CLIENTS / PROJECTS')
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) { setStatus('success'); e.target.reset() }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p className="contact-form-desc">
        For potential clients or those who want to reach out regarding projects
      </p>
      <div className="contact-form-grid">
        <input className="contact-input" name="name" type="text" placeholder="NAME" required />
        <input className="contact-input" name="designation" type="text" placeholder="DESIGNATION" />
        <input className="contact-input" name="email" type="email" placeholder="EMAIL" required />
        <input className="contact-input" name="phone" type="tel" placeholder="PHONE" />
        <select className="contact-input" name="typology" defaultValue="">
          <option value="" disabled>— TYPOLOGY / SELECT CATEGORY —</option>
          {TYPOLOGY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input className="contact-input" name="sitePlotLandArea" type="text" placeholder="SITE / PLOT / LAND AREA" />
        <input className="contact-input" name="permissibleFarFsi" type="text" placeholder="PERMISSIBLE FAR / FSI" />
        <input className="contact-input" name="projectLocation" type="text" placeholder="PROJECT LOCATION" />
      </div>
      <textarea className="contact-input contact-textarea" name="shortDescription"
        placeholder="SHORT DESCRIPTION OF PROJECT — YOUR ASPIRATIONS FOR THE PROJECT..." />
      <SubmitButton status={status} />
      <FormStatus status={status} />
    </form>
  )
}

function FormVendors({ onSuccess }) {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.target)
    fd.append('category', 'VENDORS')
    // File size check
    const catalogue = e.target.catalogue?.files?.[0]
    if (catalogue && catalogue.size > 10 * 1024 * 1024) {
      alert('Catalogue file must be under 10MB.'); setStatus('idle'); return
    }
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) { setStatus('success'); e.target.reset() }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p className="contact-form-desc">Vendors that are reaching out</p>
      <div className="contact-form-grid">
        <input className="contact-input" name="companyName" type="text" placeholder="COMPANY NAME" required />
        <input className="contact-input" name="contactPerson" type="text" placeholder="CONTACT PERSON" required />
        <input className="contact-input" name="designation" type="text" placeholder="DESIGNATION" />
        <input className="contact-input" name="contactNumber" type="tel" placeholder="CONTACT NUMBER" required />
        <input className="contact-input" name="email" type="email" placeholder="EMAIL ADDRESS" required />
        <input className="contact-input" name="projectLocation" type="text" placeholder="PROJECT LOCATION" />
        <select className="contact-input" name="vendorCategory" defaultValue="">
          <option value="" disabled>— SELECT CATEGORY —</option>
          {VENDOR_CATEGORY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <label className="contact-input contact-file-label">
          <span className="file-label-text">ATTACH CATALOGUE (PDF, MAX 10MB)</span>
          <input type="file" name="catalogue" accept=".pdf" className="contact-file-input" />
        </label>
      </div>
      <textarea className="contact-input contact-textarea" name="additionalNotes"
        placeholder="ANY ADDITIONAL NOTES (OPTIONAL) — e.g., We specialize in acoustic panels..." />
      <SubmitButton status={status} />
      <FormStatus status={status} />
    </form>
  )
}

function FormInternship({ onSuccess }) {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.target)
    fd.append('category', 'APPLY FOR INTERNSHIP')
    const portfolio = e.target.portfolio?.files?.[0]
    const cv = e.target.cv?.files?.[0]
    if ((portfolio && portfolio.size > 10 * 1024 * 1024) || (cv && cv.size > 10 * 1024 * 1024)) {
      alert('Portfolio and CV must each be under 10MB.'); setStatus('idle'); return
    }
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) { setStatus('success'); e.target.reset() }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p className="contact-form-desc">Students that want to pursue internships</p>
      <div className="contact-form-grid">
        <input className="contact-input" name="name" type="text" placeholder="NAME" required />
        <input className="contact-input" name="email" type="email" placeholder="EMAIL" required />
        <input className="contact-input" name="institute" type="text" placeholder="INSTITUTE" required />
        <input className="contact-input contact-date" name="startDate" type="date"
          placeholder="INTERNSHIP START DATE (DD-MM-YYYY)" required />
        <input className="contact-input contact-date" name="endDate" type="date"
          placeholder="INTERNSHIP END DATE (DD-MM-YYYY)" required />
        <label className="contact-input contact-file-label">
          <span className="file-label-text">ATTACH PORTFOLIO (PDF, MAX 10MB)</span>
          <input type="file" name="portfolio" accept=".pdf" className="contact-file-input" />
        </label>
      </div>
      <label className="contact-input contact-file-label contact-file-full">
        <span className="file-label-text">ATTACH CV (PDF, MAX 10MB)</span>
        <input type="file" name="cv" accept=".pdf" className="contact-file-input" />
      </label>
      <SubmitButton status={status} />
      <FormStatus status={status} />
    </form>
  )
}

function FormJob({ onSuccess }) {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.target)
    fd.append('category', 'APPLY FOR JOB')
    const portfolio = e.target.portfolio?.files?.[0]
    const cv = e.target.cv?.files?.[0]
    if ((portfolio && portfolio.size > 10 * 1024 * 1024) || (cv && cv.size > 10 * 1024 * 1024)) {
      alert('Portfolio and CV must each be under 10MB.'); setStatus('idle'); return
    }
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) { setStatus('success'); e.target.reset() }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p className="contact-form-desc">Professionals that want to pursue a career at Shilpi Architects</p>
      <div className="contact-form-grid">
        <input className="contact-input" name="name" type="text" placeholder="NAME" required />
        <input className="contact-input" name="education" type="text" placeholder="EDUCATION" required />
        <input className="contact-input" name="email" type="email" placeholder="EMAIL" required />
        <input className="contact-input" name="currentCtc" type="text" placeholder="CURRENT CTC" />
        <input className="contact-input" name="expectedCtc" type="text" placeholder="EXPECTED CTC" />
        <label className="contact-input contact-file-label">
          <span className="file-label-text">ATTACH PORTFOLIO (PDF, MAX 10MB)</span>
          <input type="file" name="portfolio" accept=".pdf" className="contact-file-input" />
        </label>
      </div>
      <label className="contact-input contact-file-label contact-file-full">
        <span className="file-label-text">ATTACH CV (PDF, MAX 10MB)</span>
        <input type="file" name="cv" accept=".pdf" className="contact-file-input" />
      </label>
      <SubmitButton status={status} />
      <FormStatus status={status} />
    </form>
  )
}

function FormMedia({ onSuccess }) {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.target)
    fd.append('category', 'FOR MEDIA')
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) { setStatus('success'); e.target.reset() }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p className="contact-form-desc">Media & press inquiries</p>
      <div className="contact-form-grid">
        <input className="contact-input" name="name" type="text" placeholder="NAME" required />
        <input className="contact-input" name="organisation" type="text" placeholder="ORGANISATION" required />
        <input className="contact-input" name="email" type="email" placeholder="EMAIL" required />
        <input className="contact-input" name="phone" type="tel" placeholder="PHONE" />
      </div>
      <input className="contact-input" name="natureOfInquiry" type="text" placeholder="NATURE OF INQUIRY" required />
      <textarea className="contact-input contact-textarea" name="message" placeholder="MESSAGE" required />
      <SubmitButton status={status} />
      <FormStatus status={status} />
    </form>
  )
}

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

function SubmitButton({ status }) {
  return (
    <button className="contact-submit" type="submit" disabled={status === 'sending'}>
      {status === 'sending' ? 'SENDING...' : 'SUBMIT ▶'}
    </button>
  )
}

function FormStatus({ status }) {
  if (status === 'success') return (
    <p className="form-status form-status--success">
      ✓ Thank you — your message has been submitted successfully.
    </p>
  )
  if (status === 'error') return (
    <p className="form-status form-status--error">
      Something went wrong. Please email us directly at shilpi.arch.plann@gmail.com
    </p>
  )
  return null
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Contact() {
  const [activeCategory, setActiveCategory] = useState(0)

  useEffect(() => {
    // ── DARK MODE INIT ──
    const themeToggle = document.getElementById('themeToggle')
    const toggleIcon = document.querySelector('.toggle-icon')

    const isDarkSaved = localStorage.getItem('sap-theme') === 'dark'
    if (isDarkSaved) document.body.classList.add('dark-mode')
    else document.body.classList.remove('dark-mode')
    if (toggleIcon) toggleIcon.innerHTML = isDarkSaved ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`

    const onThemeToggle = () => {
      document.body.classList.toggle('dark-mode')
      const isDark = document.body.classList.contains('dark-mode')
      if (toggleIcon) toggleIcon.innerHTML = isDark ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      localStorage.setItem('sap-theme', isDark ? 'dark' : 'light')
    }
    if (themeToggle) themeToggle.addEventListener('click', onThemeToggle)

    const hamburger = document.getElementById('mob-hamburger')
    const dropdown = document.getElementById('mob-dropdown')

    const onHamburgerClick = (e) => {
      e.stopPropagation()
      const isOpen = dropdown.classList.contains('open')
      if (isOpen) { dropdown.classList.remove('open'); hamburger.classList.remove('open') }
      else { dropdown.classList.add('open'); hamburger.classList.add('open') }
    }

    const onDocumentClick = (e) => {
      if (dropdown && hamburger) {
        if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
          dropdown.classList.remove('open')
          hamburger.classList.remove('open')
        }
      }
    }

    if (hamburger && dropdown) hamburger.addEventListener('click', onHamburgerClick)
    document.addEventListener('click', onDocumentClick)

    const mobLinks = document.querySelectorAll('.mob-sub-btn')
    mobLinks.forEach(l => l.addEventListener('click', () => {
      if (hamburger) hamburger.classList.remove('open')
      if (dropdown) dropdown.classList.remove('open')
    }))

    // ── CUSTOM CURSOR ──
    const cur = document.getElementById('cur')
    const ring = document.getElementById('curRing')
    let mx = 0, my = 0, rx = 0, ry = 0
    let cursorReady = false
    let animFrameId

    const onMouseMove = (e) => {
      if (!cursorReady) {
        cursorReady = true
        if (cur) cur.style.opacity = '1'
        if (ring) ring.style.opacity = '1'
      }
      mx = e.clientX
      my = e.clientY
      if (cur) {
        cur.style.left = mx + 'px'
        cur.style.top = my + 'px'
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    function cursorLoop() {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (ring) {
        ring.style.left = rx + 'px'
        ring.style.top = ry + 'px'
      }
      animFrameId = requestAnimationFrame(cursorLoop)
    }
    cursorLoop()

    document.querySelectorAll(
      'a, button, .contact-cat-btn, .contact-submit, .contact-social-link'
    ).forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (ring) ring.classList.add('hover')
        if (cur) cur.classList.add('hover', 'dot')
      })
      el.addEventListener('mouseleave', () => {
        if (ring) ring.classList.remove('hover')
        if (cur) cur.classList.remove('hover', 'dot')
      })
    })

    return () => {
      if (themeToggle) themeToggle.removeEventListener('click', onThemeToggle)
      if (hamburger) hamburger.removeEventListener('click', onHamburgerClick)
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('mousemove', onMouseMove)
      if (animFrameId) cancelAnimationFrame(animFrameId)
    }
  }, [])

  const forms = [
    <FormNewClients key="clients" />,
    <FormVendors key="vendors" />,
    <FormInternship key="internship" />,
    <FormJob key="job" />,
    <FormMedia key="media" />,
  ]

  return (
    <>
      {/* CUSTOM CURSOR */}
      <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
      <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>

      {/* GLOBAL NAVBAR */}
      <nav id="nav">
        <Link className="nav-logo-area" href="/">
          <img src="/logo.png" alt="Shilpi Architects" />
          <div className="nav-logo-text">
            SHILPI
            <small>ARCHITECTS &amp;&nbsp;PLANNERS</small>
          </div>
        </Link>
        <div id="nav-tabs">
          <Link href="/practice" className="ntab" style={{ textDecoration: 'none' }}>Practice</Link>
          <Link href="/projects" className="ntab" style={{ textDecoration: 'none' }}>Projects</Link>
          <div className="labs-dropdown-wrapper">
            <Link href="/#labs" className="ntab" style={{ textDecoration: 'none' }}>Labs</Link>
            <div className="labs-dropdown-menu">
              <Link href="/labs/ai-computation">AI & Computation</Link>
              <Link href="/labs/civic-reform">Civic Reform Studio</Link>
              <Link href="/labs/urban-futures">Urban Futures Lab</Link>
            </div>
          </div>
          <Link href="/news" className="ntab" style={{ textDecoration: 'none' }}>News</Link>
          <Link href="/contact" className="ntab active" style={{ textDecoration: 'none' }}>Contact</Link>
        </div>
        <div id="nav-right">
          <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
            <span className="toggle-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
          </button>
          <button className="mob-hamburger" id="mob-hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      <div id="mob-dropdown" className="mob-dropdown">
        <div className="mob-dropdown-inner">
          <div className="mob-sub-tabs">
            <Link href="/" className="mob-sub-btn">Home</Link>
            <Link href="/practice" className="mob-sub-btn">Practice</Link>
            <Link href="/projects" className="mob-sub-btn">Projects</Link>
            <Link href="/#labs" className="mob-sub-btn">Labs</Link>
            <Link href="/news" className="mob-sub-btn">News</Link>
            <Link href="/contact" className="mob-sub-btn">Contact</Link>
          </div>
        </div>
      </div>

      {/* MAIN CONTACT CONTENT */}
      <main className="contact-main">

        {/* BRAND DIRECTORY — unchanged */}
        <section className="contact-brand-section">
          <img src="/logo.png" alt="Shilpi Architects" className="contact-brand-logo" />
          <h1 className="contact-brand-title">
            SHILPI ARCHITECTS & PLANNERS
          </h1>
          <div className="contact-info-grid">
            <div className="contact-address">
              <h3>Office</h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '14px', height: '14px', marginTop: '4px', flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div>
                  <p>Shilpi Architects and planners</p>
                  <p>K.P.C.S House,Office No.6,Right Bhusari Colony,</p>
                  <p>Above Bank of Maharashtra,Paud Road,Kothrud,Pune-411038.</p>
                </div>
              </div>
            </div>
            <div className="contact-phone">
              <h3>Contact</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" style={{ width: '14px', height: '14px' }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                +91 9822080730
              </p>
              <p style={{ marginTop: '6px', paddingRight: '0px' }}>+91 9850167681</p>
            </div>
          </div>
          <div className="contact-directory">
            <div className="contact-dir-item">
              <span className="contact-dir-label">Office E-mail:</span>
              <div className="contact-dir-dots"></div>
              <a href="mailto:shilpi.arch.plann@gmail.com" className="contact-dir-link">shilpi.arch.plann@gmail.com</a>
            </div>
            <div className="contact-dir-item">
              <span className="contact-dir-label">Personal E-mail:</span>
              <div className="contact-dir-dots"></div>
              <a href="mailto:shilpiarchplann@gmail.com" className="contact-dir-link">pshilpiarchplann@gmail.com</a>
            </div>
            {/* <div className="contact-dir-item">
              <span className="contact-dir-label">Careers:</span>
              <div className="contact-dir-dots"></div>
              <a href="mailto:careers.shilpi@gmail.com" className="contact-dir-link">careers.shilpi@gmail.com</a>
            </div> */}
          </div>
          <div className="contact-socials">
            <a href="mailto:shilpi.arch.plann@gmail.com" className="contact-social-link" aria-label="Email">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
            </a>
            <a href="https://www.instagram.com/shilpi_architects_and_planners?igsh=OXJwanZ4NzkwcjR6&utm_source=qr" className="contact-social-link" aria-label="Instagram Profile" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M7 2h10c2.76 0 5 2.76 5 5v10c0 2.76-2.24 5-5 5H7c-2.76 0-5-2.24-5-5V7c0-2.76 2.24-5 5-5zm10 2H7c-1.66 0-3 1.34-3 3v10c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3zm-5 3c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm4.75-2.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75.34-.75.75-.75.75.34.75.75z" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/shilpi-architects-&-planners---india/" className="contact-social-link" aria-label="LinkedIn Company Page" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
            </a>
            <a href="https://www.facebook.com/share/1CJRRB16x9/" className="contact-social-link" aria-label="Facebook Page" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
            </a>
          </div>
        </section>

        {/* DYNAMIC ENQUIRY FORMS */}
        <section className="contact-enquiry-section">
          <h2 className="contact-enquiry-h2">Get In Touch</h2>

          {/* Category Selector Tabs */}
          <div className="contact-category-tabs">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                className={`contact-cat-btn${activeCategory === i ? ' active' : ''}`}
                onClick={() => setActiveCategory(i)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Render active form */}
          <div className="contact-form-wrapper">
            {forms[activeCategory]}
          </div>
        </section>
      </main>

      {/* MAP SECTION — with margins */}
      <section className="contact-map-section">
        <div className="contact-map-wrapper">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d417.4589!2d73.7955247!3d18.5080785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2be4c5c6361b7%3A0xe077411deb04b9bb!2sShilpi%20Architects%20%26%20Planners!5e0!3m2!1sen!2sin!4v1717900000000!5m2!1sen!2sin"
            width="100%"
            height="440"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Shilpi Architects — Pune Studio Location"
          />
        </div>
      </section>

      {/* BOTTOM STRIP */}
      <footer className="contact-bottom-strip">
        <div className="contact-strip-left">
          <span className="contact-strip-firm">© SHILPI ARCHITECTS &amp; PLANNERS 2026</span>
          <span className="contact-strip-divider">·</span>
          <a href="#terms" className="contact-strip-link">TERMS</a>
          <a href="#privacy" className="contact-strip-link">PRIVACY</a>
        </div>
        <div className="contact-strip-right">
          <span className="contact-strip-quote">— &ldquo;We look forward to shaping meaningful spaces together.&rdquo;</span>
        </div>
      </footer>
    </>
  )
}
