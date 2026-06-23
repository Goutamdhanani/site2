import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

/*  ──────────────────────────────────────────────────────────
    ATMOSPHERIC CANVAS — Pure CSS + GSAP animated background
    Lite mode: static gradient only, no loops, no particles.
    ────────────────────────────────────────────────────────── */

export default function AtmosphericCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    // In lite mode skip all GSAP — the static CSS gradient is enough
    if (isLite) return;

    const ctx = gsap.context(() => {
      // ─── GRADIENT BLOBS: Slow organic drift ───
      gsap.utils.toArray('.atmos-grad-blob').forEach((blob, i) => {
        // Continuous floating animation
        gsap.to(blob, {
          x: `random(-80, 80)`,
          y: `random(-60, 60)`,
          scale: `random(0.8, 1.3)`,
          duration: 10 + i * 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Scroll-driven drift
        gsap.to(blob, {
          yPercent: -50 - i * 15,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8 + i * 0.3,
          },
        });
      });

      // ─── AURORA STREAKS: Rotate and shift on scroll ───
      gsap.utils.toArray('.atmos-aurora').forEach((streak, i) => {
        gsap.to(streak, {
          rotation: i % 2 === 0 ? 15 : -15,
          xPercent: i % 2 === 0 ? 20 : -20,
          opacity: 0.03,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        });

        // Continuous shimmer
        gsap.to(streak, {
          opacity: `random(0.04, 0.12)`,
          scaleX: `random(0.8, 1.4)`,
          duration: 6 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // ─── VIGNETTE: Darkens as user scrolls ───
      gsap.to('.atmos-vignette-layer', {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ─── LITE MODE: static gradient, no particles, no aurora ───
  if (isLite) {
    return (
      <div ref={containerRef} className="atmospheric-container" aria-hidden="true">
        <div className="atmos-space-base" />
        {/* Only 2 static blobs for ambient color — no animation */}
        <div className="atmos-grad-blob atmos-grad-blob--ember" style={{ opacity: 0.5 }} />
        <div className="atmos-grad-blob atmos-grad-blob--amber" style={{ opacity: 0.4 }} />
        <div className="atmos-vignette-layer" style={{ opacity: 0.7 }} />
      </div>
    );
  }

  // ─── FULL MODE: all blobs, aurora, 35 particles ───
  const particles = Array.from({ length: 35 }, (_, i) => ({
    left: ((i * 37 + 13) % 100),
    size: 1.5 + (i % 4) * 0.8,
    delay: (i * 0.7) % 8,
    dur: 12 + (i % 5) * 4,
    opacity: 0.08 + (i % 6) * 0.05,
  }));

  return (
    <div ref={containerRef} className="atmospheric-container" aria-hidden="true">
      {/* Deep warm base */}
      <div className="atmos-space-base" />

      {/* Gradient mesh blobs — organic drifting colors */}
      <div className="atmos-grad-blob atmos-grad-blob--ember" />
      <div className="atmos-grad-blob atmos-grad-blob--amber" />
      <div className="atmos-grad-blob atmos-grad-blob--lacquer" />
      <div className="atmos-grad-blob atmos-grad-blob--gold" />
      <div className="atmos-grad-blob atmos-grad-blob--deep" />

      {/* Aurora light streaks */}
      <div className="atmos-aurora atmos-aurora--1" />
      <div className="atmos-aurora atmos-aurora--2" />
      <div className="atmos-aurora atmos-aurora--3" />

      {/* Floating particles — drift upward */}
      <div className="atmos-particles">
        {particles.map((p, i) => (
          <span
            key={i}
            className="atmos-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette that deepens on scroll */}
      <div className="atmos-vignette-layer" />
    </div>
  );
}
