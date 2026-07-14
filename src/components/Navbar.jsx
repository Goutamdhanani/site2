import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';
import { trackCTA } from '../utils/analytics';

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
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              trackCTA('nav_logo', 'click');
              onViewChange('home');
            }}
            className="nav-logo"
          >
            <img
              src="/logo.png"
              alt="oddwebs"
              className="nav-logo-img"
              width="110"
              height="36"
              style={{ display: 'block', objectFit: 'contain', height: '36px', width: 'auto', maxWidth: '120px' }}
            />
          </a>

          <ul className="nav-links">
            <li>
              <a 
                href="#portfolio" 
                className={`nav-link ${currentView === 'portfolio' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  trackCTA('nav_portfolio', 'click');
                  onViewChange('portfolio');
                }}
              >
                Our Work
              </a>
            </li>
            <li>
              <a
                href="#services-page"
                className={`nav-link ${currentView === 'services-page' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  trackCTA('nav_services', 'click');
                  onViewChange('services-page');
                }}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#process"
                className={`nav-link ${currentView === 'process' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  trackCTA('nav_process', 'click');
                  onViewChange('process');
                }}
              >
                Process
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`nav-link ${currentView === 'about' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  trackCTA('nav_about', 'click');
                  onViewChange('about');
                }}
              >
                About
              </a>
            </li>
          </ul>

          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              trackCTA('nav_demo', 'click');
              onViewChange('demo');
            }}
            onMouseEnter={() => trackCTA('nav_demo', 'hover')}
            className="nav-cta magnetic"
          >
            Schedule Free Demo <span className="nav-cta-arrow">↗</span>
          </a>

          <button
            className={`nav-burger ${menuOpen ? 'open' : ''}`}
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-glow" aria-hidden="true" />
        
        <div className="mobile-menu-links">
          <a href="#portfolio" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('portfolio'); }} className="mobile-menu-item">
            <span className="menu-item-num">01</span>
            <span className="menu-item-label">Our Work</span>
            <span className="menu-item-desc">Selected Case Studies</span>
          </a>
          <a href="#services-page" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('services-page'); }} className="mobile-menu-item">
            <span className="menu-item-num">02</span>
            <span className="menu-item-label">Services</span>
            <span className="menu-item-desc">Premium Growth Solutions</span>
          </a>
          <a href="#process" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('process'); }} className="mobile-menu-item">
            <span className="menu-item-num">03</span>
            <span className="menu-item-label">Process</span>
            <span className="menu-item-desc">12-Phase Growth System</span>
          </a>
          <a href="#about" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('about'); }} className="mobile-menu-item">
            <span className="menu-item-num">04</span>
            <span className="menu-item-label">About</span>
            <span className="menu-item-desc">Visual Love & Impact</span>
          </a>
          <a href="#demo" onClick={(e) => { e.preventDefault(); closeMenu(); onViewChange('demo'); }} className="mobile-menu-item highlight">
            <span className="menu-item-num">05</span>
            <span className="menu-item-label">Schedule Demo</span>
            <span className="menu-item-desc">Claim Free Growth Session ↗</span>
          </a>
        </div>
        
        <div className="mobile-menu-footer">
          <span className="footer-secured">// SSL SECURED</span>
          <span className="footer-copyright">&copy; {new Date().getFullYear()} oddwebs</span>
        </div>
      </div>
    </>
  );
}
