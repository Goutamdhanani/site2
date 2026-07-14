import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function Preloader({ onComplete }) {
  const ref = useRef(null);
  const completedRef = useRef(false);
  const [statusText, setStatusText] = useState('LOADING SYSTEM...');

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const html = document.documentElement;
    html.style.overflow = '';
    document.body.style.overflow = '';
    if (ref.current) ref.current.style.display = 'none';
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;
    html.style.overflow = 'hidden';

    if (prefersReducedMotion) {
      finish();
      return;
    }

    // Safety fallback
    const fallbackTimer = setTimeout(() => {
      console.warn('Preloader fallback complete');
      finish();
    }, isLite ? 1500 : 4500);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimer);
          finish();
        },
      });

      if (isLite) {
        tl.timeScale(3.2); // Speed up timeline on mobile for instant feel
      }

      // ─── TEXT TIMELINE ───
      const messages = [
        'LOADING SECURE SYSTEM...',
        'OPTIMIZING PERFORMANCE...',
        'PREPARING APPLICATION...'
      ];

      messages.forEach((msg, idx) => {
        tl.add(() => {
          setStatusText(msg);
          // Simple flicker reveal effect on text change
          gsap.fromTo('.preloader-status-text', 
            { opacity: 0.3, filter: 'blur(2px)' }, 
            { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }
          );
        }, 0.6 + idx * 0.6);
      });

      // ─── VISUAL TIMELINE ───
      tl
        // 1. Initial fade in of background nebula & scanner
        .fromTo('.preloader-scenic-nebula', {
          opacity: 0,
          scale: 0.8,
        }, {
          opacity: 0.3,
          scale: 1,
          duration: 1.2,
          ease: 'power2.out',
        }, 0)

        // 2. Fade in the geometric portal crest
        .fromTo('.preloader-logo-wrapper', {
          opacity: 0,
          scale: 0.8,
          filter: 'blur(10px)',
        }, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
        }, 0.1)

      // 3. Keep the triangles rotating independently of the timeline so it can finish
      gsap.fromTo('.crest-triangle-1', {
        transformOrigin: '50% 50%',
        rotate: 0
      }, {
        rotate: 360,
        duration: 3.5,
        ease: 'none',
        repeat: -1
      });
      gsap.fromTo('.crest-triangle-2', {
        transformOrigin: '50% 50%',
        rotate: 0
      }, {
        rotate: -360,
        duration: 4.5,
        ease: 'none',
        repeat: -1
      });

      // 4. Progress rail reveal
      tl.fromTo('.preloader-progress-bar', {
        width: '0%',
      }, {
        width: '100%',
        duration: 2.2,
        ease: 'power1.inOut',
      }, 0.2)

      // 5. Expand the core and start reveal mask
      .to('.preloader-scenic-nebula', {
        scale: 1.5,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
      }, 2.1)

      .to('.preloader-logo-wrapper', {
        scale: 1.3,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.4,
        ease: 'power2.in',
      }, 2.2)

      .to('.preloader-status-feed, .preloader-progress-rail', {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.in',
      }, 2.2)

      // Stargate portals reveal expand
      .to('.preloader-mask-circle', {
        scale: 55,
        duration: 0.9,
        ease: 'power4.inOut',
      }, 2.3)

      // Fade overlay
      .to('.preloader-overlay', {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
        }, 2.8);

    }, ref);

    return () => {
      clearTimeout(fallbackTimer);
      ctx.revert();
      // If effect is cleaned up (HMR, StrictMode, etc.) before timeline finishes,
      // force-complete so the site never gets stuck invisible
      finish();
    };
  }, [finish]);

  return (
    <div id="preloader" ref={ref}>
      <div className="preloader-overlay">
        {/* Scenic Nebula Core Glow */}
        <div className="preloader-scenic-nebula" aria-hidden="true" />

        {/* Visual scan scanner line */}
        <div className="preloader-scanline" aria-hidden="true" />

        <div className="preloader-logo-wrapper">
          <img
            src="/logo.png"
            alt="oddwebs"
            className="preloader-logo-img"
            style={{
              width: '120px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(100, 60, 200, 0.6))',
            }}
          />
        </div>

        {/* Status Messages Telemetry */}
        <div className="preloader-status-feed">
          <span className="status-dot-blink" />
          <span className="preloader-status-text">{statusText}</span>
        </div>

        {/* Horizontal Optical Progress Bar */}
        <div className="preloader-progress-rail">
          <div className="preloader-progress-bar" />
        </div>

        {/* Transition reveal mask */}
        <div className="preloader-mask-circle" aria-hidden="true" />
      </div>
    </div>
  );
}
