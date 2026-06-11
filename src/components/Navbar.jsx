import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Nav entrance
    const ctx = gsap.context(() => {
      gsap.fromTo('.nav-logo', { opacity: 0, x: -15 }, {
        opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05
      });
      gsap.fromTo('.nav-link', { opacity: 0, y: -8 }, {
        opacity: 1, y: 0, duration: 0.4, stagger: 0.05,
        ease: 'power2.out', delay: 0.15
      });
      gsap.fromTo('.nav-cta', { opacity: 0, scale: 0.92 }, {
        opacity: 1, scale: 1, duration: 0.4,
        ease: 'back.out(1.7)', delay: 0.35
      });
    }, navRef);

    return () => {
      window.removeEventListener('scroll', onScroll);
      ctx.revert();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav id="navbar" ref={navRef} className={scrolled ? 'scrolled' : ''} data-hero-nav>
        <div className="nav-container">
          <a href="/" className="nav-logo">
            <span className="nav-logo-mark">OW</span>
            <span className="nav-logo-word">oddwebs</span>
          </a>

          <ul className="nav-links">
            <li><a href="#work" className="nav-link">Work</a></li>
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#process" className="nav-link">Process</a></li>
            <li><a href="#testimonials" className="nav-link">Insights</a></li>
          </ul>

          <a href="#contact" className="nav-cta magnetic">
            Book a Call <span className="nav-cta-arrow">↗</span>
          </a>

          <button
            className="nav-burger"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={menuOpen ? { transform: 'rotate(45deg) translate(3px, 3px)' } : {}} />
            <span style={menuOpen ? { transform: 'rotate(-45deg) translate(3px, -3px)' } : {}} />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <a href="#work" onClick={closeMenu}>Work</a>
        <a href="#services" onClick={closeMenu}>Services</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#process" onClick={closeMenu}>Process</a>
        <a href="#testimonials" onClick={closeMenu}>Insights</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
      </div>
    </>
  );
}
