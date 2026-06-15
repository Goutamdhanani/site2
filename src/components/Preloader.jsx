import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Preloader({ onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        html.style.overflow = '';
        document.body.style.overflow = '';
        if (ref.current) ref.current.style.display = 'none';
        if (onComplete) onComplete();
      },
    });

    // ─── Cinematic preloader sequence ───
    // Phase 1: Particles materialize into logo
    tl
      // Background particles fade in
      .fromTo('.preloader-particles', {
        opacity: 0,
      }, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }, 0)

      // Glow ring pulses in
      .fromTo('.preloader-glow-ring', {
        scale: 0.2,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 0.6,
        duration: 0.8,
        ease: 'power2.out',
      }, 0.1)

      // Logo assembles with elastic overshoot
      .fromTo('.preloader-logo', {
        opacity: 0,
        scale: 0.2,
        rotateY: 90,
        filter: 'blur(20px)',
      }, {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'elastic.out(1, 0.6)',
      }, 0.2)

      // Loading line sweeps with glow
      .fromTo('.preloader-line', {
        width: 0,
        boxShadow: '0 0 0px rgba(139, 92, 246, 0)',
      }, {
        width: 120,
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
        duration: 0.8,
        ease: 'power4.inOut',
      }, 0.6)

      // Counter counts up
      .fromTo('.preloader-counter', { opacity: 0 }, {
        opacity: 1,
        duration: 0.15,
      }, 0.7)

      .to('.preloader-counter-num', {
        innerText: 100,
        duration: 0.8,
        ease: 'power2.inOut',
        snap: { innerText: 1 },
        onUpdate() {
          const el = document.querySelector('.preloader-counter-num');
          if (el) el.textContent = Math.round(gsap.getProperty(el, 'innerText'));
        },
      }, 0.7)

      // Glow ring pulses out
      .to('.preloader-glow-ring', {
        scale: 2.5,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
      }, 1.4)

      // Inner content fades with depth
      .to('.preloader-inner', {
        opacity: 0,
        scale: 0.85,
        filter: 'blur(12px)',
        duration: 0.3,
        ease: 'power2.in',
      }, 1.5)

      // Circular mask wipe — reveals site
      .to('.preloader-mask-circle', {
        scale: 50,
        duration: 0.9,
        ease: 'power4.inOut',
      }, 1.7)

      .to('.preloader-overlay', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, 2.2);

    return () => tl.kill();
  }, [onComplete]);

  // Generate particle positions
  const particles = Array.from({ length: 40 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div id="preloader" ref={ref}>
      <div className="preloader-overlay">
        {/* Background particles */}
        <div className="preloader-particles" aria-hidden="true">
          {particles.map((p, i) => (
            <span
              key={i}
              className="preloader-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Glow ring */}
        <div className="preloader-glow-ring" aria-hidden="true" />

        {/* Content */}
        <div className="preloader-inner">
          <div className="preloader-logo">OW</div>
          <div className="preloader-line" />
          <div className="preloader-counter">
            <span className="preloader-counter-num">0</span>
            <span className="preloader-counter-pct">%</span>
          </div>
        </div>

        {/* Mask circle for reveal transition */}
        <div className="preloader-mask-circle" aria-hidden="true" />
      </div>
    </div>
  );
}
