"use client";

import { useEffect, useState } from "react";
import { useClock } from "@/lib/hooks/useClock";
import { useDarkMode } from "@/lib/hooks/useDarkMode";

export default function Navbar() {
  const time = useClock();
  const { isDark, toggle } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const header = document.querySelector('.site-header') as HTMLElement;
    if (!header) return;
    const handleScroll = () => {
      if (window.scrollY > 40) {
        header.style.background = document.body.classList.contains('dark-mode')
          ? 'rgba(7, 7, 10, 0.92)'
          : 'rgba(242, 238, 227, 0.88)';
      } else {
        header.style.background = document.body.classList.contains('dark-mode')
          ? 'rgba(7, 7, 10, 0.78)'
          : 'rgba(242, 238, 227, 0.72)';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="site-header">
      {/* LEFT: Logo */}
      <div className="logo-box-destination" id="target-navbar-logo">
        <img
          src="/logo.png"
          alt="SAP"
          className="sap-logo-img"
        />
        <div className="nav-logo-placeholder">
          SAP
          <small>ARCHITECTS / PLANNERS</small>
        </div>
      </div>

      {/* CENTRE: Nav links */}
      <nav
        className={`main-nav${menuOpen ? " active" : ""}`}
        id="main-nav"
      >
        <a href="#practice" className="nav-link">
          <span className="n">01</span> Practice
        </a>
        <a href="/projects" className="nav-link">
          <span className="n">02</span> Projects
        </a>
        <a href="/labs" className="nav-link">
          <span className="n">03</span> Labs
        </a>
        <a href="#news" className="nav-link">
          <span className="n">04</span> News
        </a>
        <a href="#contact" className="nav-link">
          <span className="n">05</span> Contact
        </a>
      </nav>

      {/* RIGHT: Util */}
      <div className="right-nav-group">
        <span className="live-indicator" id="clk">
          {time}
        </span>
        <button
          className="theme-toggle"
          id="themeToggle"
          aria-label="Toggle dark mode"
          onClick={toggle}
        >
          <span className="toggle-icon">{isDark ? "○" : "◑"}</span>
          <span id="toggleLabel">
            {isDark ? "LIGHT" : "DARK"}
          </span>
        </button>
        <div
          className="hamburger-menu"
          id="hamburger-menu"
          onClick={() => setMenuOpen((v) => !v)}
          role="button"
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </header>
  );
}
