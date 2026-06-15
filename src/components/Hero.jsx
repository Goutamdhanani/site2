import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── ENTRANCE TIMELINE ───
      const tl = gsap.timeline({ delay: 0.2 });

      // Gradient background materializes
      tl.fromTo('.hero-gradient-bg', {
        opacity: 0,
        scale: 1.3,
      }, {
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: 'power2.out',
      });

      // Eyebrow assembles from left
      tl.fromTo('.hero-eyebrow', {
        opacity: 0,
        x: -40,
        filter: 'blur(8px)',
      }, {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
      }, '-=1.5');

      // Words assemble from scattered 3D positions — the showpiece
      const words = document.querySelectorAll('.hero-word');
      words.forEach((word, i) => {
        const xOffset = (Math.random() - 0.5) * 200;
        const yOffset = 150 + Math.random() * 80;
        const rotX = 30 + Math.random() * 30;
        const rotY = (Math.random() - 0.5) * 40;

        tl.fromTo(word, {
          y: yOffset,
          x: xOffset,
          opacity: 0,
          rotateX: rotX,
          rotateY: rotY,
          scale: 0.5,
          filter: 'blur(12px)',
        }, {
          y: 0,
          x: 0,
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'elastic.out(1, 0.65)',
        }, `-=${i === 0 ? 1 : 1.05}`);
      });

      // Subtitle emerges from depth
      tl.fromTo('.hero-sub', {
        opacity: 0,
        y: 40,
        scale: 0.9,
        filter: 'blur(6px)',
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.5');

      // Buttons slide up with overshoot
      tl.fromTo('.hero-actions', {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'back.out(1.7)',
      }, '-=0.3');

      // Logo strip reveals
      tl.fromTo('.hero-logos', {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.2');

      // ─── SCROLL-DRIVEN CAMERA MOVEMENT ───
      // Hero content drifts back as camera pushes forward
      gsap.to('.hero-content', {
        y: -200,
        z: -300,
        opacity: 0,
        scale: 0.85,
        filter: 'blur(8px)',
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '80% top',
          scrub: 1.5,
        },
      });

      // Eyebrow drifts at different speed (Layer 4 — typography)
      gsap.to('.hero-eyebrow', {
        y: -120,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '60% top',
          scrub: 1,
        },
      });

      // Gradient orbs drift at atmosphere speed (Layer 1)
      gsap.to('.hero-gradient-bg', {
        y: -40,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
        },
      });

      // Grid lines drift at environment speed (Layer 2)
      gsap.to('.hero-grid-lines', {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '70% top',
          scrub: 1.5,
        },
      });

      // Logo strip transforms — it becomes the doorway to next scene
      gsap.to('.hero-logos', {
        y: -160,
        opacity: 0,
        scale: 0.9,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: '30% top',
          end: '80% top',
          scrub: 1,
        },
      });

      // Scroll indicator fades early
      gsap.to('.hero-scroll-indicator', {
        opacity: 0,
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '20% top',
          scrub: 0.5,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const headlineWords = ['We', 'build', 'digital', 'powerhouses.'];

  return (
    <section id="hero" ref={sectionRef} data-scene="hero" style={{ perspective: '1200px' }}>
      {/* Layer 1: Atmospheric gradient background */}
      <div className="hero-gradient-bg" aria-hidden="true">
        <div className="hero-gradient-orb hero-gradient-orb--1" />
        <div className="hero-gradient-orb hero-gradient-orb--2" />
        <div className="hero-gradient-orb hero-gradient-orb--3" />
        <div className="hero-gradient-orb hero-gradient-orb--4" />
        <div className="hero-noise-overlay" />
      </div>

      {/* Layer 2: Grid environment */}
      <div className="hero-grid-lines" aria-hidden="true" />

      {/* Layer 4: Typography content */}
      <div className="hero-content-overlay">
        <div className="hero-content" style={{ transformStyle: 'preserve-3d' }}>
          <p className="hero-eyebrow">
            Digital Experiences That Perform
          </p>

          <h1 className="hero-headline" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
            {headlineWords.map((word, i) => (
              <span className="hero-word-wrap" key={i}>
                <span className="hero-word" style={{ transformStyle: 'preserve-3d' }}>{word}</span>
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
