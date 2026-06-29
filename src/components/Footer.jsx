import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

export default function Footer({ currentView, onViewChange }) {
  const footerRef = useRef(null);

  useEffect(() => {
    if (isLite) {
      // Force footer elements visible immediately on mobile
      gsap.set('.footer-brand, .footer-tagline, .footer-col, .footer-bottom', {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
      });
      return;
    }

    const ctx = gsap.context(() => {

      // ─── FOOTER: Content emerges from below ───
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      footerTl
        .fromTo('.footer-brand', {
          opacity: 0, x: -40, filter: 'blur(6px)',
        }, {
          opacity: 1, x: 0, filter: 'blur(0px)',
          duration: 0.8, ease: 'power3.out',
        })
        .fromTo('.footer-tagline', {
          opacity: 0, x: 40, filter: 'blur(6px)',
        }, {
          opacity: 1, x: 0, filter: 'blur(0px)',
          duration: 0.8, ease: 'power3.out',
        }, '<')
        .fromTo('.footer-col', {
          opacity: 0, y: 40, scale: 0.95,
        }, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
        }, '-=0.3')
        .fromTo('.footer-bottom', {
          opacity: 0, y: 20,
        }, {
          opacity: 1, y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.2');

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} data-scene="footer">
      {/* Subtle decorative blob */}
      <div className="section__blobs" aria-hidden="true">
        <div className="blob blob--tertiary" data-parallax="0.1" style={{ top: '-20%', right: '-10%', opacity: 0.15 }} />
      </div>

      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="nav-logo-mark">OW</span>
            <span className="nav-logo-word">oddwebs</span>
          </div>
          <p className="footer-tagline">
            A premium web design and development agency helping startups and brands across the US and Canada build custom websites, mobile apps, and AI-powered automation systems that drive real growth.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <p className="footer-col-label">Services</p>
            <ul>
              <li><a href="#services-page" onClick={(e) => { e.preventDefault(); onViewChange('services-page'); }}>All Services</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); onViewChange('home', '#services'); }}>Web Development</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); onViewChange('home', '#services'); }}>Mobile Apps</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); onViewChange('home', '#services'); }}>AI & Automation</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); onViewChange('home', '#services'); }}>SEO & Performance</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-col-label">Company</p>
            <ul>
              <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); onViewChange('portfolio'); }}>Work</a></li>
              <li><a href="#process" onClick={(e) => { e.preventDefault(); onViewChange('home', '#process'); }}>Process</a></li>
              <li><a href="#testimonials" onClick={(e) => { e.preventDefault(); onViewChange('home', '#testimonials'); }}>About</a></li>
              <li><a href="#demo" onClick={(e) => { e.preventDefault(); onViewChange('demo'); }}>Schedule Free Demo</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-col-label">Contact</p>
            <ul>
              <li><a href="mailto:hello@oddwebs.com">hello@oddwebs.com</a></li>
            </ul>

            {/* Social Media Links */}
            <div className="footer-social" style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <a href="https://instagram.com/oddwebs" target="_blank" rel="noopener noreferrer" aria-label="Follow oddwebs on Instagram" title="Instagram" style={{ color: 'var(--text-tertiary)', transition: 'color 0.3s ease' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://linkedin.com/company/oddwebs" target="_blank" rel="noopener noreferrer" aria-label="Connect with oddwebs on LinkedIn" title="LinkedIn" style={{ color: 'var(--text-tertiary)', transition: 'color 0.3s ease' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://twitter.com/oddwebs" target="_blank" rel="noopener noreferrer" aria-label="Follow oddwebs on X (Twitter)" title="X (Twitter)" style={{ color: 'var(--text-tertiary)', transition: 'color 0.3s ease' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://facebook.com/oddwebs" target="_blank" rel="noopener noreferrer" aria-label="Like oddwebs on Facebook" title="Facebook" style={{ color: 'var(--text-tertiary)', transition: 'color 0.3s ease' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://youtube.com/@oddwebs" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to oddwebs on YouTube" title="YouTube" style={{ color: 'var(--text-tertiary)', transition: 'color 0.3s ease' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} oddwebs. All rights reserved. | Web Design Agency serving the US & Canada.</p>
        </div>
      </div>
    </footer>
  );
}
