import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.15 });

      // Eyebrow clip-path reveal
      heroTl.fromTo('.hero-eyebrow', {
        opacity: 0, y: 16, clipPath: 'inset(100% 0 0 0)'
      }, {
        opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
        duration: 0.7, ease: 'power3.out'
      }, 0);

      // H1 lines — clip reveal from bottom
      heroTl.fromTo('.hero-line-inner', {
        y: '110%'
      }, {
        y: '0%',
        duration: 1,
        stagger: 0.12,
        ease: 'power4.out'
      }, 0.2);

      // Subtitle — blur dissolve
      heroTl.fromTo('.hero-sub', {
        opacity: 0, y: 20, filter: 'blur(3px)'
      }, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.7, ease: 'power2.out'
      }, 0.8);

      // CTA buttons
      heroTl.fromTo('.hero-actions', {
        opacity: 0, y: 20
      }, {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power2.out'
      }, 1.0);

      // Moon image — scale + fade
      heroTl.fromTo('.hero-image', {
        scale: 1.1, opacity: 0
      }, {
        scale: 1, opacity: 1,
        duration: 1.4, ease: 'power3.out'
      }, 0.1);

      // Moon parallax on scroll
      gsap.to('.hero-image', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      // Content parallax — depth effect
      gsap.to('.hero-content', {
        yPercent: 12,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      });

      // Logo strip stagger
      gsap.fromTo('.logo-item', {
        opacity: 0, y: 10
      }, {
        opacity: 0.55, y: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power2.out',
        delay: 1.3
      });

      gsap.fromTo('.logo-divider', {
        scaleY: 0
      }, {
        scaleY: 1,
        stagger: 0.05,
        duration: 0.3,
        ease: 'power2.out',
        delay: 1.4
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef}>
      {/* Moon visual — behind content */}
      <div className="hero-visual">
        <img
          src="/assets/hero-moon.png"
          alt="3D disintegrating moon"
          className="hero-image"
          loading="eager"
        />
      </div>

      {/* Texture overlay */}
      <div className="hero-texture-overlay" />

      <div className="hero-layout">
        <div className="hero-content">
          <p className="hero-eyebrow">Digital Experiences That Perform</p>

          <h1 className="hero-headline">
            <span className="hero-line">
              <span className="hero-line-inner">We build digital</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner">powerhouses.</span>
            </span>
          </h1>

          <p className="hero-sub">
            Websites, mobile apps and digital products<br />
            designed to attract, engage and convert.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="btn-primary magnetic">
              Start a Project <span className="btn-arrow">↗</span>
            </a>
            <a href="#work" className="btn-ghost magnetic">
              <span>View Our Work</span>
              <span className="btn-play">▶</span>
            </a>
          </div>
        </div>
      </div>

      {/* Static client logos — NOT a marquee */}
      <div className="hero-logos">
        <div className="logo-strip">
          <div className="logo-item"><span>⊕</span> Mercury</div>
          <div className="logo-divider" />
          <div className="logo-item">ramp <span style={{ fontSize: '16px' }}>↗</span></div>
          <div className="logo-divider" />
          <div className="logo-item logo-bold">HEX</div>
          <div className="logo-divider" />
          <div className="logo-item"><span>▲</span> Vercel</div>
          <div className="logo-divider" />
          <div className="logo-item">≡ descript</div>
          <div className="logo-divider" />
          <div className="logo-item"><span className="logo-dollar">$</span> Cash App</div>
          <div className="logo-divider" />
          <div className="logo-item logo-stacked">FIVE<br />ONE<br />FOUR</div>
          <div className="logo-divider" />
          <div className="logo-item">ℛ runway</div>
        </div>
      </div>
    </section>
  );
}
