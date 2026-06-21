import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

export default function Preloader({ onComplete }) {
  const ref = useRef(null);
  const completedRef = useRef(false);

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

    // Safety fallback — if animations stall, force-complete after 4s
    const fallbackTimer = setTimeout(() => {
      console.warn('Preloader fallback: force completing after 4s');
      finish();
    }, 4000);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimer);
          finish();
        },
      });

      tl
        .fromTo('.preloader-particles', {
          opacity: 0,
        }, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        }, 0)

        .fromTo('.preloader-glow-ring', {
          scale: 0.2,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 0.6,
          duration: 0.8,
          ease: 'power2.out',
        }, 0.1)

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

        .fromTo('.preloader-line', {
          width: 0,
          boxShadow: '0 0 0px var(--glow-ember)',
        }, {
          width: 120,
          boxShadow: '0 0 20px var(--glow-ember)',
          duration: 0.8,
          ease: 'power4.inOut',
        }, 0.6)

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

        .to('.preloader-glow-ring', {
          scale: 2.5,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        }, 1.4)

        .to('.preloader-inner', {
          opacity: 0,
          scale: 0.85,
          filter: 'blur(12px)',
          duration: 0.3,
          ease: 'power2.in',
        }, 1.5)

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
    }, ref);

    return () => {
      clearTimeout(fallbackTimer);
      ctx.revert();
    };
  }, [finish]);

  return (
    <div id="preloader" ref={ref}>
      <div className="preloader-overlay">
        {/* Background particles */}
        <div className="preloader-particles" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => (
            <span
              key={i}
              className="preloader-particle"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7 + 13) % 100}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                animationDelay: `${(i * 0.15) % 2}s`,
                animationDuration: `${2 + (i % 3)}s`,
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
