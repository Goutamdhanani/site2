import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ThreeScene = lazy(() => import('./ThreeScene'));

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Gradient background pulse in
      tl.fromTo('.hero-gradient-bg', {
        opacity: 0, scale: 1.2
      }, {
        opacity: 1, scale: 1,
        duration: 2, ease: 'power2.out'
      });

      // Eyebrow
      tl.fromTo('.hero-eyebrow', {
        opacity: 0, y: 20
      }, {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power3.out'
      }, '-=1.5');

      // Headline words — staggered reveal
      const words = document.querySelectorAll('.hero-word');
      tl.fromTo(words, {
        y: '110%', opacity: 0, rotateX: 40
      }, {
        y: '0%', opacity: 1, rotateX: 0,
        duration: 1, stagger: 0.08,
        ease: 'power4.out'
      }, '-=1');

      // Subtitle
      tl.fromTo('.hero-sub', {
        opacity: 0, y: 30
      }, {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power3.out'
      }, '-=0.5');

      // Buttons
      tl.fromTo('.hero-actions', {
        opacity: 0, y: 20
      }, {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power2.out'
      }, '-=0.4');

      // Scroll-driven parallax on hero content
      gsap.to('.hero-content', {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      // 3D scene parallax
      gsap.to('.hero-3d-wrap', {
        y: -60,
        scale: 0.95,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });

      // Logo strip reveal
      tl.fromTo('.hero-logos', {
        opacity: 0, y: 20
      }, {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power2.out'
      }, '-=0.3');

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const headlineWords = ['We', 'build', 'digital', 'powerhouses.'];

  return (
    <section id="hero" ref={sectionRef}>
      {/* Animated mesh gradient background */}
      <div className="hero-gradient-bg" aria-hidden="true">
        <div className="hero-gradient-orb hero-gradient-orb--1" />
        <div className="hero-gradient-orb hero-gradient-orb--2" />
        <div className="hero-gradient-orb hero-gradient-orb--3" />
        <div className="hero-gradient-orb hero-gradient-orb--4" />
        <div className="hero-noise-overlay" />
      </div>

      {/* Three.js 3D scene (reliable, no external dependency) */}
      <div className="hero-3d-wrap" aria-hidden="true">
        <Suspense fallback={null}>
          <ThreeScene />
        </Suspense>
      </div>

      {/* Grid lines overlay */}
      <div className="hero-grid-lines" aria-hidden="true" />

      {/* Hero text content */}
      <div className="hero-content-overlay">
        <div className="hero-content">
          <p className="hero-eyebrow">
            Digital Experiences That Perform
          </p>

          <h1 className="hero-headline">
            {headlineWords.map((word, i) => (
              <span className="hero-word-wrap" key={i}>
                <span className="hero-word">{word}</span>
              </span>
            ))}
          </h1>

          <p className="hero-sub">
            Websites, mobile apps and digital products<br />
            designed to attract, engage and convert.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="btn-primary magnetic">
              Start a Project <span className="btn-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </a>
            <a href="#work" className="btn-ghost magnetic">
              <span>View Our Work</span>
            </a>
          </div>
        </div>
      </div>

      {/* Trusted by strip */}
      <div className="hero-logos">
        <div className="logo-strip">
          <div className="logo-strip-label">Trusted by</div>
          <div className="logo-divider" />
          <div className="logo-item">Mercury</div>
          <div className="logo-divider" />
          <div className="logo-item">Ramp</div>
          <div className="logo-divider" />
          <div className="logo-item logo-bold">HEX</div>
          <div className="logo-divider" />
          <div className="logo-item">Vercel</div>
          <div className="logo-divider" />
          <div className="logo-item">Descript</div>
          <div className="logo-divider" />
          <div className="logo-item">Cash App</div>
          <div className="logo-divider" />
          <div className="logo-item">Runway</div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
