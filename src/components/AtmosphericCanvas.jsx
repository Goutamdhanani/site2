import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function AtmosphericCanvas() {
  const containerRef = useRef(null);
  const nebulaRef = useRef(null);
  const glowRef = useRef(null);
  const debrisFarRef = useRef(null);
  const debrisCloseRef = useRef(null);
  const lightStreak1Ref = useRef(null);
  const lightStreak2Ref = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    // Ensure ScrollTrigger is registered
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Nebula background: slow parallax & subtle scaling
      gsap.fromTo(
        nebulaRef.current,
        { yPercent: 0, scale: 1.05 },
        {
          yPercent: -10,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        }
      );

      // 2. Glow background: opposite parallax and subtle scale down
      gsap.fromTo(
        glowRef.current,
        { yPercent: 2, scale: 1.1 },
        {
          yPercent: -18,
          scale: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        }
      );

      // 3. Debris far: slow parallax, rotates slowly on scroll
      gsap.fromTo(
        debrisFarRef.current,
        { yPercent: 0, rotation: 0 },
        {
          yPercent: -35,
          rotation: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        }
      );

      // 4. Debris close: fast parallax, rotates opposite way on scroll
      gsap.fromTo(
        debrisCloseRef.current,
        { yPercent: 15, rotation: 0 },
        {
          yPercent: -65,
          rotation: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        }
      );

      // 5. Volumetric light streaks: drift laterally and rotate on scroll
      gsap.fromTo(
        lightStreak1Ref.current,
        { yPercent: -15, xPercent: -10, rotation: -18, opacity: 0.15 },
        {
          yPercent: 25,
          xPercent: 10,
          rotation: -8,
          opacity: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        }
      );

      gsap.fromTo(
        lightStreak2Ref.current,
        { yPercent: 15, xPercent: 15, rotation: 28, opacity: 0.12 },
        {
          yPercent: -35,
          xPercent: -15,
          rotation: 12,
          opacity: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.8,
          },
        }
      );

      // 6. Volumetric glow blobs: continuous subtle hover-float & parallax
      gsap.to(blob1Ref.current, {
        x: '+=40',
        y: '+=60',
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(blob2Ref.current, {
        x: '-=50',
        y: '-=40',
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.fromTo(
        blob1Ref.current,
        { yPercent: 0 },
        {
          yPercent: -45,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        blob2Ref.current,
        { yPercent: 0 },
        {
          yPercent: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="atmospheric-container" aria-hidden="true">
      {/* Deep Space Base */}
      <div className="atmos-space-base" />

      {/* Layer 1: Nebula deep background */}
      <div
        ref={nebulaRef}
        className="atmos-layer atmos-nebula"
        style={{ backgroundImage: `url('/assets/atmosphere/nebula_atmosphere.png')` }}
      />

      {/* Layer 2: Glow middle background */}
      <div
        ref={glowRef}
        className="atmos-layer atmos-glow"
        style={{ backgroundImage: `url('/assets/atmosphere/glow_atmosphere.png')` }}
      />

      {/* Volumetric Haze/Blobs */}
      <div ref={blob1Ref} className="atmos-blob atmos-blob-1" />
      <div ref={blob2Ref} className="atmos-blob atmos-blob-2" />

      {/* Volumetric Light Streaks */}
      <div ref={lightStreak1Ref} className="atmos-streak atmos-streak-1" />
      <div ref={lightStreak2Ref} className="atmos-streak atmos-streak-2" />

      {/* Layer 3: Debris layers (parallaxed) */}
      <div
        ref={debrisFarRef}
        className="atmos-layer atmos-debris atmos-debris-far"
        style={{ backgroundImage: `url('/assets/atmosphere/geometric_debris.png')` }}
      />
      <div
        ref={debrisCloseRef}
        className="atmos-layer atmos-debris atmos-debris-close"
        style={{ backgroundImage: `url('/assets/atmosphere/geometric_debris.png')` }}
      />

      {/* Atmospheric overlays (vignette) */}
      <div className="atmos-overlay-vignette" />
    </div>
  );
}
