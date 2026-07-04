'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { DATA } from '../../lib/projectsData'
import './projects.css'

export default function Projects() {
  useEffect(() => {

    /* ── DARK MODE INIT ── */
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

    /* ── DATA ── */
    /* DATA moved to lib/projectsData */

    /* ── PALETTE ── */
    const PH = [
      'rgba(22,59,94,0.06)', 'rgba(69,168,161,0.08)',
      'rgba(200,125,48,0.07)', 'rgba(22,59,94,0.10)',
      'rgba(69,168,161,0.12)', 'rgba(22,59,94,0.08)',
      'rgba(200,125,48,0.09)', 'rgba(69,168,161,0.06)'
    ]

    let activeCat = 'architecture'
    let activeSub = 'all'
    let openId = null

    // ── PRE-SELECT CATEGORY FROM URL QUERY PARAM ──────────────────
    // e.g. /projects?cat=interiors → opens Interiors tab directly
    const _urlCat = new URLSearchParams(window.location.search).get('cat')
    if (_urlCat && DATA[_urlCat]) activeCat = _urlCat
    // ───────────────────────────────────────────────────────────────

    /* ── HELPERS ── */
    function mk(tag, cls, txt) {
      const el = document.createElement(tag)
      el.className = cls
      if (txt) el.textContent = txt
      return el
    }

    function mkImg(src, alt, cls) {
      const img = document.createElement('img')
      img.src = src
      img.alt = alt
      img.className = cls
      img.onerror = () => { img.style.opacity = '0' }
      return img
    }

    function addPh(el, idx) {
      const ph = document.createElement('div')
      ph.className = 'thumb-ph'
      ph.style.background = PH[idx % PH.length]
      el.appendChild(ph)
    }

    /* ── BUILD SUBNAV ── */
    function buildSubnav() {
      const sn = document.getElementById('subnav')
      if (!sn) return
      if (!DATA[activeCat]) return
      sn.innerHTML = ''
      DATA[activeCat].subs.forEach(s => {
        const b = document.createElement('button')
        b.className = 'stab' + (activeSub === s ? ' active' : '')
        b.textContent = s
        b.onclick = () => {
          activeSub = s
          openId = null
          document.querySelectorAll('.stab')
            .forEach(x => x.classList.remove('active'))
          b.classList.add('active')
          isIsolatedMode = true
          buildList()
          
          const targetSec = document.getElementById('section-' + activeCat)
          if (targetSec) {
            const navH = window.innerWidth <= 980 ? 56 : 64
            const subH = window.innerWidth <= 980 ? 0 : 40
            const top = targetSec.getBoundingClientRect().top + window.scrollY - navH - subH - 40
            window.scrollTo({ top, behavior: 'auto' })
          }
        }
        sn.appendChild(b)
      })
    }

    let observer = null;
    function setupObserver() {
      if (observer) observer.disconnect();
      const options = { root: null, rootMargin: '-40% 0px -60% 0px', threshold: 0 };
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cat = entry.target.dataset.cat;
            if (activeCat !== cat) {
              activeCat = cat;
              activeSub = 'all';
              updateActiveTabUI(cat);
              buildSubnav();
            }
          }
        });
      }, options);
      document.querySelectorAll('.cat-section').forEach(sec => observer.observe(sec));
    }

    function updateActiveTabUI(cat) {
      document.querySelectorAll('.ntab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll(`.ntab[data-cat="${cat}"]`).forEach(x => x.classList.add('active'));
      document.querySelectorAll('.mob-cat-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll(`.mob-cat-btn[data-cat="${cat}"]`).forEach(x => x.classList.add('active'));
    }

    /* ── BUILD LIST WITH INFINITE SCROLL ── */
    let renderedCats = []
    let isIsolatedMode = false;
    
    function buildList() {
      const main = document.getElementById('proj-main')
      if (!main) return
      main.innerHTML = ''
      
      setupObserver()
      
      renderedCats = [activeCat]
      appendCategory(activeCat)
      
      if (!isIsolatedMode) {
        appendSentinel()
      } else {
        const sentinel = document.getElementById('infinite-sentinel')
        if (sentinel) sentinel.remove()
        if (sentinelObserver) sentinelObserver.disconnect()
      }
    }
    
    function appendCategory(cat) {
      const main = document.getElementById('proj-main')
      if (!main) return
      
      const catSection = document.createElement('div')
      catSection.className = 'cat-section'
      catSection.id = 'section-' + cat
      catSection.dataset.cat = cat

      const projs = DATA[cat].projects.filter(
        p => {
           if (cat === activeCat && activeSub !== 'all') {
             return p.sub === activeSub;
           }
           return true;
        }
      )
      projs.forEach((p, i) => catSection.appendChild(makeBlock(p, i)))
      main.appendChild(catSection)
      
      if (observer) observer.observe(catSection);
    }
    
    let sentinelObserver = null;
    function appendSentinel() {
      const main = document.getElementById('proj-main')
      if (!main) return
      
      let sentinel = document.getElementById('infinite-sentinel')
      if (sentinel) sentinel.remove()
      
      sentinel = document.createElement('div')
      sentinel.id = 'infinite-sentinel'
      sentinel.style.height = '10px'
      main.appendChild(sentinel)
      
      if (!sentinelObserver) {
        sentinelObserver = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            loadNextCategory();
          }
        }, { rootMargin: '500px' })
      }
      sentinelObserver.disconnect();
      sentinelObserver.observe(sentinel);
    }
    
    function loadNextCategory() {
      const allCats = Object.keys(DATA);
      const lastCat = renderedCats[renderedCats.length - 1];
      const nextIdx = allCats.indexOf(lastCat) + 1;
      
      if (nextIdx < allCats.length) {
        const nextCat = allCats[nextIdx];
        renderedCats.push(nextCat);
        
        const sentinel = document.getElementById('infinite-sentinel')
        if (sentinel) sentinel.remove()
        
        appendCategory(nextCat);
        appendSentinel();
      }
    }

    function makeBlock(p, idx) {
      const block = document.createElement('div')
      block.className = 'pblock'
      block.id = 'block-' + p.id
      block.appendChild(makeCollapsedRow(p, idx))
      return block
    }

    function makeCollapsedRow(p, idx) {
      const row = document.createElement('div')
      row.className = 'prow'
      row.id = 'row-' + p.id

      const left = document.createElement('div')
      left.className = 'row-left'
      const ic = mkImg(p.icon, p.title, 'row-icon')
      ic.style.background = 'none'
      ic.style.padding = '0'
      const tt = mk('div', 'row-title', p.title)
      const ll = mk('div', 'row-loc', p.loc.toUpperCase())
      left.appendChild(ic)
      left.appendChild(tt)
      left.appendChild(ll)

      const right = document.createElement('div')
      right.className = 'row-right'
      const tw = document.createElement('div')
      tw.className = 'thumb-wrap'
      tw.id = 'tw-' + p.id
      if (p.imgs[0]) {
        const img = mkImg(p.imgs[0], p.title, 'thumb-img')
        img.loading = 'lazy'
        img.onerror = () => { tw.innerHTML = ''; addPh(tw, idx) }
        tw.appendChild(img)
      } else { addPh(tw, idx) }
      right.appendChild(tw)

      row.appendChild(left)
      row.appendChild(right)
      row.addEventListener('click', () => {
        if (row.classList.contains('open')) return
        openProject(p, idx, row)
      })
      return row
    }

    function openProject(p, idx, row) {
      if (openId && openId !== p.id) closeProject(openId)
      openId = p.id

      const isMobile = window.innerWidth <= 980
      const H = isMobile ? 460 : 590

      /* Step 1: Brief zoom on the thumbnail before expand */
      row.classList.add('zooming')

      setTimeout(() => {
        row.classList.remove('zooming')
        row.innerHTML = ''
        row.classList.add('open')

        /* Animate height from 0 to H */
        row.style.height = '0px'
        row.style.overflow = 'hidden'
        row.style.transition =
          'height 0.50s cubic-bezier(0.22,1,0.36,1)'

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            row.style.height = H + 'px'
          })
        })

        /* Build the single scrollable strip */
        const strip = document.createElement('div')
        strip.className = 'exp-full-strip'
        strip.style.height = H + 'px'

        /* ── SIDEBAR inside the strip ── */
        const sb = document.createElement('div')
        sb.className = 'exp-sidebar'
        sb.style.height = H + 'px'

        const sbIcon = document.createElement('img')
        sbIcon.className = 'exp-icon'
        sbIcon.src = p.icon
        sbIcon.alt = p.title
        sbIcon.style.background = 'none'
        sbIcon.style.padding = '0'
        sbIcon.onerror = () => { sbIcon.style.opacity = '0' }
        sb.appendChild(sbIcon)

        sb.appendChild(mk('div', 'exp-title', p.title))
        sb.appendChild(mk('div', 'exp-loc',
          p.loc.toUpperCase()))

        if (p.year)
          sb.appendChild(mk('div', 'exp-year', p.year))

        if (p.client) {
          const m = document.createElement('div')
          m.className = 'exp-meta'
          m.innerHTML = `
            <div class="exp-meta-lbl">Client</div>
            <div class="exp-meta-val">
              ${p.client.toUpperCase()}
            </div>`
          sb.appendChild(m)
        }

        const mTyp = document.createElement('div')
        mTyp.className = 'exp-meta'
        mTyp.innerHTML = `
          <div class="exp-meta-lbl">Typology</div>
          <div class="exp-meta-val">
            ${(p.typology || p.sub).toUpperCase()}
          </div>`
        sb.appendChild(mTyp)

        if (p.size) {
          const mSz = document.createElement('div')
          mSz.className = 'exp-meta'
          mSz.innerHTML = `
            <div class="exp-meta-lbl">Size M2/FT2</div>
            <div class="exp-meta-val">${p.size}</div>`
          sb.appendChild(mSz)
        }

        const mSt = document.createElement('div')
        mSt.className = 'exp-meta'
        mSt.innerHTML = `
          <div class="exp-meta-lbl">Status</div>
          <div class="exp-meta-val">
            ${p.status.toUpperCase()}
          </div>`
        sb.appendChild(mSt)

        const shareLbl = mk('div', 'exp-share-lbl', 'Share')
        const shareRow = document.createElement('div')
        shareRow.className = 'exp-share'
        shareRow.innerHTML = `
          <a href="#">✉</a>
          <a href="#">f</a>
          <a href="#">in</a>
          <a href="#">𝕏</a>`
        sb.appendChild(shareLbl)
        sb.appendChild(shareRow)

        /* Close button — always visible */
        const closeBtn = document.createElement('button')
        closeBtn.textContent = '✕ Close'
        closeBtn.style.cssText = `
          margin-top: auto;
          padding: 10px 0;
          background: none;
          border: 1px solid rgba(22,59,94,0.20);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #163B5E; cursor: pointer;
          width: 100%;
        `
        closeBtn.addEventListener('click', e => {
          e.stopPropagation()
          closeProject(p.id)
        })
        sb.appendChild(closeBtn)

        strip.appendChild(sb)

        const imgs = p.imgs || []
        const texts = p.texts || []
        const videos = p.videos || []          // ← ADD THIS LINE
        const count = Math.max(imgs.length, texts.length, 1)

        /* ── DYNAMIC IMAGE/TEXT MOUNT ENGINE ── */
        for (let i = 0; i < count; i++) {
          const ip = document.createElement('div')
          ip.className = 'ep-img loading-frame' // Base loading style token class
          ip.style.height = H + 'px'
          ip.style.flexShrink = '0'

          if (imgs[i]) {
            const img = document.createElement('img')
            img.src = imgs[i]
            img.alt = p.title
            img.style.height = '100%'
            img.style.display = 'block'

            // AUTOMATIC ASPECT RATIO TRACKER FOR PORTRAIT & LANDSCAPE
            img.onload = () => {
              const naturalWidth = img.naturalWidth;
              const naturalHeight = img.naturalHeight;

              // Natively maps width against the current viewport height constraint (H)
              const dynamicWidth = Math.round(H * (naturalWidth / naturalHeight));

              ip.style.width = dynamicWidth + 'px';
              ip.classList.remove('loading-frame');
            };

            img.onerror = () => {
              ip.innerHTML = ''
              ip.style.width = Math.round(H * 1.44) + 'px' // Landscape fallback standard sizing
              const ph = document.createElement('div')
              ph.style.cssText =
                `width:100%;height:100%;background:${PH[(idx + i) % PH.length]}`
              ip.appendChild(ph)
            }
            ip.appendChild(img)
          } else {
            ip.style.width = Math.round(H * 1.44) + 'px'
            const ph = document.createElement('div')
            ph.style.cssText =
              `width:100%;height:100%;background:${PH[(idx + i) % PH.length]}`
            ip.appendChild(ph)
          }
          strip.appendChild(ip)

          if (texts[i]) {
            const tp = document.createElement('div')
            tp.className = 'ep-txt'
            tp.style.height = H + 'px'
            tp.style.flexShrink = '0'
            texts[i].split('\n').forEach(t => {
              const para = document.createElement('p')
              para.textContent = t
              tp.appendChild(para)
            })
            strip.appendChild(tp)
          }
        }

        // ── VIDEO PANELS (appended after all image panels) ──────────────
        videos.forEach((src, vi) => {
          const vw = Math.round(H * 1.78)   // 16:9
          const vp = document.createElement('div')
          vp.style.cssText =
            `width:${vw}px;height:${H}px;flex-shrink:0;
     overflow:hidden;position:relative;background:#000;cursor:auto!important;`

          const video = document.createElement('video')
          // Ensure the path is absolute from the root
          let absoluteSrc = src.startsWith('/') ? src : '/' + src;
          video.src = absoluteSrc;
          video.setAttribute('playsinline', 'playsinline');
          video.setAttribute('preload', 'auto');
          if (imgs[0] || p.icon) {
            video.setAttribute('poster', imgs[0] || p.icon);
          }
          video.style.cssText =
            `width:100%;height:100%;object-fit:contain;display:block;cursor:pointer;background:#000;`
          video.load();

          // Custom Play Button Overlay
          const playBtn = document.createElement('div')
          playBtn.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>`
          playBtn.style.cssText =
            `position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);
             width:80px;height:80px;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);
             border-radius:50%;display:flex;align-items:center;justify-content:center;
             cursor:pointer;transition:opacity 0.3s ease;pointer-events:none;`
          
          // Toggle play/pause on click
          const togglePlay = (e) => {
            e.stopPropagation()
            if (video.paused) {
              const playPromise = video.play()
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  playBtn.style.opacity = '0'
                }).catch(error => {
                  console.error("Video play error:", error)
                  // If it fails to play (e.g. source not found), keep the play button visible
                  playBtn.style.opacity = '1'
                })
              }
            } else {
              video.pause()
              playBtn.style.opacity = '1'
            }
          }

          video.addEventListener('click', togglePlay)
          video.addEventListener('mousedown', e => e.stopPropagation())
          video.addEventListener('touchstart', e => e.stopPropagation(), { passive: true })
          video.addEventListener('touchmove', e => e.stopPropagation(), { passive: true })
          
          video.addEventListener('ended', () => {
            playBtn.style.opacity = '1'
          })

          vp.appendChild(video)
          vp.appendChild(playBtn)
          strip.appendChild(vp)
        })
        // ────────────────────────────────────────────────────────────────

        row.appendChild(strip)

        /* Trigger visible animation after append */
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            strip.classList.add('visible')
          })
        })

        /* ── DRAG SCROLL on the full strip ── */
        /* Cursor controlled by CSS — no JS cursor manipulation */
        let drag = false, sx = 0, sl = 0
        strip.addEventListener('mousedown', e => {
          drag = true
          sx = e.clientX
          sl = strip.scrollLeft
          strip.style.userSelect = 'none'
        })
        document.addEventListener('mouseup', () => {
          drag = false
          strip.style.userSelect = ''
        })
        strip.addEventListener('mousemove', e => {
          if (!drag) return
          e.preventDefault()
          strip.scrollLeft = sl - (e.clientX - sx) * 1.1
        })

        /* Touch scroll */
        let touchStartX = 0, touchScrollLeft = 0
        strip.addEventListener('touchstart', e => {
          touchStartX = e.touches[0].clientX
          touchScrollLeft = strip.scrollLeft
        }, { passive: true })
        strip.addEventListener('touchmove', e => {
          const diff = touchStartX - e.touches[0].clientX
          strip.scrollLeft = touchScrollLeft + diff
        }, { passive: true })

        /* Scroll into view */
        setTimeout(() => {
          const navH = window.innerWidth <= 980 ? 56 : 64
          const subH = window.innerWidth <= 980 ? 0 : 40
          const rowTop =
            row.getBoundingClientRect().top +
            window.scrollY - navH - subH - 8
          window.scrollTo({ top: rowTop, behavior: 'smooth' })
        }, 60)

        /* Remove height constraint after animation */
        setTimeout(() => {
          row.style.overflow = ''
          row.style.transition = ''
        }, 520)

      }, 200) /* 200ms zoom delay before expanding */
    }

    function closeProject(id) {
      const row = document.getElementById('row-' + id)
      if (!row || !row.classList.contains('open')) return
      row.style.height = ''
      row.style.overflow = ''
      row.style.transition = ''
      row.style.opacity = ''
      row.style.transform = ''
      row.style.flexDirection = ''
      row.classList.remove('open')
      row.innerHTML = ''
      
      let p = null, idx = -1;
      Object.keys(DATA).forEach(cat => {
        const catProjs = DATA[cat].projects;
        const _idx = catProjs.findIndex(x => x.id === id);
        if (_idx >= 0) { p = catProjs[_idx]; idx = _idx; }
      });
      if (!p) { if (openId === id) openId = null; return; }

      const left = document.createElement('div')
      left.className = 'row-left'
      const ic = mkImg(p.icon, p.title, 'row-icon')
      ic.style.background = 'none'
      ic.style.padding = '0'
      const tt = mk('div', 'row-title', p.title)
      const ll = mk('div', 'row-loc', p.loc.toUpperCase())
      left.appendChild(ic)
      left.appendChild(tt)
      left.appendChild(ll)

      const right = document.createElement('div')
      right.className = 'row-right'
      const tw = document.createElement('div')
      tw.className = 'thumb-wrap'
      if (p.imgs[0]) {
        const img = mkImg(p.imgs[0], p.title, 'thumb-img')
        img.loading = 'lazy'
        img.onerror = () => { tw.innerHTML = ''; addPh(tw, idx) }
        tw.appendChild(img)
      } else addPh(tw, idx)
      right.appendChild(tw)

      row.appendChild(left)
      row.appendChild(right)
      row.addEventListener('click', () => {
        if (row.classList.contains('open')) return
        openProject(p, idx, row)
      })
      if (openId === id) openId = null
    }

    /* ── NAV TAB CLICKS ── */
    function handleTabClick(cat) {
      if (!DATA[cat]) return
      activeCat = cat
      activeSub = 'all'
      openId = null
      updateActiveTabUI(cat)
      buildSubnav()
      buildMobSubTabs()
      isIsolatedMode = true
      buildList()
      window.scrollTo({ top: 0, behavior: 'auto' })
      
      const dd = document.getElementById('mob-dropdown')
      const hb = document.getElementById('mob-hamburger')
      if (dd) dd.classList.remove('open')
      if (hb) hb.classList.remove('open')
    }

    document.querySelectorAll('.ntab').forEach(b => {
      b.addEventListener('click', () => handleTabClick(b.dataset.cat))
    })

    /* ── MOBILE DROPDOWN ── */
    function buildMobSubTabs() {
      const subContainer = document.getElementById('mob-sub-tabs')
      if (!subContainer) return
      subContainer.innerHTML = ''

      const allBtn = document.createElement('button')
      allBtn.className = 'mob-sub-btn' + (activeSub === 'all' ? ' active' : '')
      allBtn.textContent = 'All'
      allBtn.addEventListener('click', () => {
        activeSub = 'all'
        openId = null
        document.querySelectorAll('.mob-sub-btn')
          .forEach(b => b.classList.remove('active'))
        allBtn.classList.add('active')
        isIsolatedMode = true
        buildList()
        const targetSec = document.getElementById('section-' + activeCat)
        if (targetSec) {
          const navH = window.innerWidth <= 980 ? 56 : 64
          const subH = window.innerWidth <= 980 ? 0 : 40
          const top = targetSec.getBoundingClientRect().top + window.scrollY - navH - subH - 40
          window.scrollTo({ top, behavior: 'auto' })
        }
      })
      subContainer.appendChild(allBtn)

      DATA[activeCat].subs.forEach(s => {
        const btn = document.createElement('button')
        btn.className = 'mob-sub-btn' + (activeSub === s ? ' active' : '')
        btn.textContent = s
        btn.addEventListener('click', () => {
          activeSub = s
          openId = null
          document.querySelectorAll('.mob-sub-btn')
            .forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          isIsolatedMode = true
          buildList()
          const targetSec = document.getElementById('section-' + activeCat)
          if (targetSec) {
            const navH = window.innerWidth <= 980 ? 56 : 64
            const subH = window.innerWidth <= 980 ? 0 : 40
            const top = targetSec.getBoundingClientRect().top + window.scrollY - navH - subH - 40
            window.scrollTo({ top, behavior: 'auto' })
          }
        })
        subContainer.appendChild(btn)
      })
    }

    function buildMobDropdown() {
      const catContainer = document.getElementById('mob-cat-tabs')
      const subContainer = document.getElementById('mob-sub-tabs')
      if (!catContainer || !subContainer) return
      catContainer.innerHTML = ''
      subContainer.innerHTML = ''

      Object.keys(DATA).forEach(cat => {
        const btn = document.createElement('button')
        btn.className = 'mob-cat-btn' + (cat === activeCat ? ' active' : '')
        btn.dataset.cat = cat
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1)
        btn.addEventListener('click', () => {
          activeCat = cat
          activeSub = 'all'
          openId = null
          updateActiveTabUI(cat)
          buildSubnav()
          buildMobSubTabs()
          isIsolatedMode = true
          buildList()
          window.scrollTo({ top: 0, behavior: 'auto' })
          
          const dd = document.getElementById('mob-dropdown')
          const hb = document.getElementById('mob-hamburger')
          if (dd) dd.classList.remove('open')
          if (hb) hb.classList.remove('open')
        })
        catContainer.appendChild(btn)
      })
      buildMobSubTabs()
    }

    const hamburger = document.getElementById('mob-hamburger')
    const dropdown = document.getElementById('mob-dropdown')
    const onHamburgerClick = (e) => {
      e.stopPropagation()
      const isOpen = dropdown.classList.contains('open')
      if (isOpen) {
        dropdown.classList.remove('open')
        hamburger.classList.remove('open')
      } else {
        buildMobDropdown()
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

    /* ── SEARCH ── */
    let searchActive = false
    let searchQuery = ''
    const searchBtn = document.getElementById('search-btn')
    const searchOverlay = document.getElementById('search-overlay')
    const searchInput = document.getElementById('search-input')
    const searchCloseBtn = document.getElementById('search-close')

    function openSearch() {
      if (!searchInput) return
      searchActive = true
      const searchInline = document.getElementById('search-inline')
      const navWord = document.getElementById('nav-word')
      const themeToggleBtn = document.getElementById('themeToggle')
      if (searchInline) searchInline.classList.add('open')
      if (navWord) navWord.style.cssText = 'opacity:0;pointer-events:none;width:0;overflow:hidden'
      if (themeToggleBtn) themeToggleBtn.style.cssText = 'opacity:0;pointer-events:none;width:0;overflow:hidden;padding:0;border:none'
      setTimeout(() => searchInput.focus(), 180)
    }

    function closeSearch() {
      if (!searchInput) return
      searchActive = false
      searchQuery = ''
      searchInput.value = ''
      const searchInline = document.getElementById('search-inline')
      const navWord = document.getElementById('nav-word')
      const themeToggleBtn = document.getElementById('themeToggle')
      if (searchInline) searchInline.classList.remove('open')
      if (navWord) navWord.style.cssText = ''
      if (themeToggleBtn) themeToggleBtn.style.cssText = ''
      buildList()
    }

    function filterBySearch(query) {
      const main = document.getElementById('proj-main')
      if (!main) return
      main.innerHTML = ''
      const q = query.toLowerCase().trim()
      if (!q) { buildList(); return }
      const allProjects = []
      Object.values(DATA).forEach(cat => {
        cat.projects.forEach(p => allProjects.push(p))
      })
      const results = allProjects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.loc.toLowerCase().includes(q) ||
        (p.typology && p.typology.toLowerCase().includes(q)) ||
        p.sub.toLowerCase().includes(q) ||
        (p.client && p.client.toLowerCase().includes(q))
      )
      if (results.length === 0) {
        const msg = document.createElement('div')
        msg.className = 'search-no-results'
        msg.textContent = `No projects found for "​${query}"`
        main.appendChild(msg)
        return
      }
      results.forEach((p, i) => main.appendChild(makeBlock(p, i)))
    }

    const onSearchBtnClick = () => {
      searchActive ? closeSearch() : openSearch()
    }
    const onSearchCloseBtnClick = closeSearch
    const onSearchInput = (e) => {
      searchQuery = e.target.value
      filterBySearch(searchQuery)
    }
    const onSearchKeydown = (e) => {
      if (e.key === 'Escape') closeSearch()
    }

    if (searchBtn) searchBtn.addEventListener('click', onSearchBtnClick)
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', onSearchCloseBtnClick)
    if (searchInput) {
      searchInput.addEventListener('input', onSearchInput)
      searchInput.addEventListener('keydown', onSearchKeydown)
    }

    /* ── ESCAPE KEY ── */
    const onDocumentKeydown = (e) => {
      if (e.key === 'Escape' && openId) closeProject(openId)
    }
    document.addEventListener('keydown', onDocumentKeydown)

    /* ── RESIZE ── */
    function handleResize() { buildSubnav() }
    window.addEventListener('resize', handleResize)

    buildSubnav()
    buildList()
    buildMobDropdown()

    /* ── BRAND CUSTOM MAGNETIC CURSOR INTERACTION ENGINE ── */
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

      // Monitors elements to apply tracking ring expansions automatically
      const refreshHoverTargets = () => {
        document.querySelectorAll(
          'a, .prow, .stab, .ntab, .exp-full-strip, .exp-share a, button, .prow *'
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

      // Initialize instantly on base structural frameworks
      refreshHoverTargets();

      // Mutation Observer hooks onto project blocks when users expand/close items dynamically
      const observer = new MutationObserver(refreshHoverTargets);
      const projMain = document.getElementById('proj-main');
      if (projMain) {
        observer.observe(projMain, { childList: true, subtree: true });
      }

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animationFrameId);
        observer.disconnect();
      };
    };

    const cleanupCursor = initProjectsCursor();
    /* ─────────────────────────────────────────────────── */

    // Sync nav tab highlight to the resolved activeCat
    document.querySelectorAll('.ntab').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === activeCat)
    })

    return () => {
      window.removeEventListener('resize', handleResize);
      if (themeToggle) themeToggle.removeEventListener('click', onThemeToggle);
      if (hamburger) hamburger.removeEventListener('click', onHamburgerClick);
      document.removeEventListener('click', onDocumentClick);

      if (searchBtn) searchBtn.removeEventListener('click', onSearchBtnClick);
      if (searchCloseBtn) searchCloseBtn.removeEventListener('click', onSearchCloseBtnClick);
      if (searchInput) {
        searchInput.removeEventListener('input', onSearchInput);
        searchInput.removeEventListener('keydown', onSearchKeydown);
      }
      document.removeEventListener('keydown', onDocumentKeydown);

      if (cleanupCursor) cleanupCursor(); // Safely teardown event targets to block memory leaks
    }

  }, [])

  return (
    <>
      {/* ── GLOBAL BRAND INTERACTIVE MAGNETIC CUSTOM CURSOR ELEMENTS ── */}
      <div className="cursor" id="cur" style={{ opacity: 0 }}></div>
      <div className="cursor ring" id="curRing" style={{ opacity: 0 }}></div>

      {/* ── MAIN NAVIGATION HEADER ── */}
      <nav id="nav">
        {/* Logo Link */}
        <Link className="nav-logo-area" href="/">
          <img src="/logo.png" alt="SAP" />
          <div className="nav-logo-text">
            SHILPI
            <small>ARCHITECTS &amp;&nbsp;PLANNERS</small>
          </div>
        </Link>

        {/* Category Tabs */}
        <div id="nav-tabs">
          <button className="ntab active" data-cat="architecture">
            Architecture
          </button>
          <button className="ntab" data-cat="interiors">
            Interiors
          </button>
          <button className="ntab" data-cat="landscape">
            Landscape
          </button>
          <button className="ntab" data-cat="urbanism">
            Urbanism
          </button>
          <button className="ntab" data-cat="art">
            Art
          </button>
        </div>

        {/* Right-Aligned Navigation Elements */}
        <div id="nav-right">
          <button className="nav-srch" aria-label="Search" id="search-btn">
            <svg width="13" height="13" viewBox="0 0 13 13"
              fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="5.5" cy="5.5" r="4" />
              <line x1="9" y1="9" x2="12.5" y2="12.5" />
            </svg>
          </button>

          {/* Inline Search Expansion Drawer Container */}
          <div id="search-inline" className="nav-search-inline">
            <input
              type="text"
              id="search-input"
              className="search-input-inline"
              placeholder="Search projects..."
              autoComplete="off"
            />
            <button id="search-close" className="search-close-inline" aria-label="Close">
              ✕
            </button>
          </div>
          <span id="nav-word">India</span>
          <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
            <span className="toggle-icon">◑</span>
            <span className="toggle-label" id="toggleLabel">DARK</span>
          </button>
          <button className="mob-hamburger" id="mob-hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY DROPDOWN INTERFACE ── */}
      <div id="mob-dropdown" className="mob-dropdown">
        <div className="mob-dropdown-inner">
          <div className="mob-cat-tabs" id="mob-cat-tabs"></div>
          <div className="mob-sub-tabs" id="mob-sub-tabs"></div>
        </div>
      </div>

      {/* ── RENDER ROOT ARCHITECTURE CORES ── */}
      <div id="subnav"></div>
      <div id="proj-main"></div>
    </>
  )
}
