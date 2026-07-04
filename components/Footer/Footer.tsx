"use client";

import dynamic from "next/dynamic";

// Leaflet must be loaded client-side only — no SSR
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <h2 className="footer-cta-text">
        Based in Pune and creating solutions globally.
      </h2>
      <a href="#contact-us" className="contact-trigger-link">
        Contact Us;
      </a>

      {/* Address + Map */}
      <div className="footer-details-map-container">
        <div className="footer-text-side">
          <div className="studio-address-block">
            <div className="address-box">
              <h3>Regional Branch Office</h3>
              <p>
                Office No. - 6, K.P.C.S House,
                <br />
                Paud Road, Right Bhusari Colony,
                <br />
                Kothrud, Pune, MH 411038
              </p>
              <p className="address-note">(Above Bank of Maharashtra ATM)</p>
            </div>
            <div className="contact-box">
              <h3>Contact</h3>
              <p>E: shilpi.arch.plann@gmail.com</p>
              <p>T: +91 98501 67681</p>
              <p>T: +91 92842 33161</p>
            </div>
          </div>
        </div>

        <div className="map-interactive-wrapper">
          <LeafletMap />
        </div>
      </div>

      {/* Utility Row */}
      <div className="footer-utility-row">
        <div className="footer-nav-column">
          <h4>Connect</h4>
          <a href="#email" className="footer-link">Email</a>
          {/* <a href="#vimeo" className="footer-link">Vimeo</a> */}
          <a href="#instagram" className="footer-link">Instagram</a>
          <a href="#youtube" className="footer-link">Youtube</a>
          <a href="#linkedin" className="footer-link">Linkedin</a>
        </div>

        <div className="newsletter-signup-box">
          <p className="newsletter-label">
            Stay up to date with our latest projects and news
          </p>
          <div className="input-inline-row">
            <input type="email" placeholder="Email Address" />
            <button className="submit-btn">Submit</button>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="footer-legal-block">
        <div className="legal-row-links">
          <span>© SAP Architecture 2026</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
        <p className="legal-address">KOTHRUD, PUNE, MAHARASHTRA, INDIA</p>
      </div>
    </footer>
  );
}
