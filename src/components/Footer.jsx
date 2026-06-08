import React from 'react';
import Logo from './Logo';

const serviceLinks = ['Web Development', 'Mobile Development', 'AI & Automation', 'UI/UX Design', 'Dashboards', 'Growth & SEO'];
const companyLinks = ['About', 'Our Work', 'Process', 'Insights', 'Careers', 'Contact'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Logo size={44} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20 }}>
              <span style={{ fontWeight: 800, color: '#F0EEFF' }}>odd</span>
              <span style={{ fontWeight: 400, color: '#7B3FE4' }}>webs</span>
            </span>
          </div>
          <p className="footer-brand-text">
            Building digital powerhouses for founders and brands worldwide.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13 }}>
            <a href="https://instagram.com/oddwebs" target="_blank" rel="noopener noreferrer" style={{ color: '#5A5280' }}>
              IG @oddwebs
            </a>
            <a href="https://www.oddwebs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#5A5280' }}>
              www.oddwebs.com
            </a>
          </div>
          <p style={{ color: '#5A5280', fontSize: 12, marginTop: 16 }}>
            © 2025 oddwebs. All rights reserved.
          </p>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {serviceLinks.map(l => (
              <li key={l}><a href="#services">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            {companyLinks.map(l => (
              <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`}>{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Get In Touch</h4>
          <a href="mailto:hello@oddwebs.com" className="footer-email">hello@oddwebs.com</a>
          <a href="#cta" className="footer-btn">Book a Free Call →</a>
          <p className="footer-reply">Reply within 2 hours</p>
          <div className="footer-socials">
            {/* Instagram */}
            <a href="https://instagram.com/oddwebs" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com/company/oddwebs" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            {/* X / Twitter */}
            <a href="https://twitter.com/oddwebs" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Twitter">
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-bottom-text">
          Made with ❤️ by oddwebs — the odd ones who build powerhouses.
        </span>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}
