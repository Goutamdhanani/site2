import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function Navbar({ currentView, onViewChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const threshold = isLite ? window.innerHeight * 0.8 : window.innerHeight * 2.8;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Nav entrance — subtle, doesn't compete with preloader
    const ctx = gsap.context(() => {
      gsap.fromTo('.nav-logo', { opacity: 0, x: -20, filter: 'blur(4px)' }, {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: 0.7, ease: 'power3.out', delay: 0.1,
      });
      gsap.fromTo('.nav-link', { opacity: 0, y: -10 }, {
        opacity: 1, y: 0,
        duration: 0.5, stagger: 0.1,
        ease: 'power2.out', delay: 0.2,
      });
      gsap.fromTo('.nav-cta', { opacity: 0, scale: 0.88, filter: 'blur(4px)' }, {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.5, ease: 'back.out(1.7)', delay: 0.4,
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
          <a href="#home" onClick={(e) => { e.preventDefault(); onViewChange('home'); }} className="nav-logo">
            <span className="nav-logo-mark">OW</span>
            <span className="nav-logo-word">oddwebs</span>
          </a>

          <ul className="nav-links">
            <li>
              <a 
                href="#portfolio" 
                className={`nav-link ${currentView === 'portfolio' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); onViewChange('portfolio'); }}
              >
                Our Work
              </a>
            </li>
            <li><a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); onViewChange('home', '#services'); }}>Services</a></li>
            <li><a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); onViewChange('home', '#about'); }}>Results</a></li>
            <li><a href="#process" className="nav-link" onClick={(e) => { e.preventDefault(); onViewChange('home', '#process'); }}>Process</a></li>
            <li><a href="#testimonials" className="nav-link" onClick={(e) => { e.preventDefault(); onViewChange('home', '#testimonials'); }}>About</a></li>
          </ul>

          <a href="#demo" onClick={(e) => { e.preventDefault(); onViewChange('demo'); }} className="nav-cta magnetic">
            Schedule Free Demo <span className="nav-cta-arrow">↗</span>
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
        <a href="#portfolio" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('portfolio'); }}>Our Work</a>
        <a href="#services" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('home', '#services'); }}>Services</a>
        <a href="#about" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('home', '#about'); }}>Results</a>
        <a href="#process" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('home', '#process'); }}>Process</a>
        <a href="#testimonials" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('home', '#testimonials'); }}>About</a>
        <a href="#demo" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('demo'); }}>Schedule Free Demo</a>
      </div>
    </>
  );
}
