import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const links = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#case-studies' },
  { label: 'Process', href: '#process' },
  { label: 'About', href: '#metrics' },
  { label: 'Insights', href: '#testimonials' },
  { label: 'Contact', href: '#cta' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="scroll-progress" style={{ width: `${progress}%` }} />
        <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <Logo size={28} />
          <span className="nav-wordmark">
            <span className="odd">odd</span>
            <span className="webs">webs</span>
          </span>
        </a>
        <div className="nav-links">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>{l.label}</a>
          ))}
        </div>
        <a href="#cta" className="nav-cta magnetic" onClick={(e) => scrollTo(e, '#cta')}>
          Start Your Project →
        </a>
        <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map(l => (
          <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>{l.label}</a>
        ))}
      </div>
    </>
  );
}
