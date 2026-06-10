import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Preloader({ onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    // Lock scroll during preloader only
    const html = document.documentElement;
    html.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        html.style.overflow = '';
        document.body.style.overflow = '';
        if (ref.current) ref.current.style.display = 'none';
        if (onComplete) onComplete();
      }
    });

    // FAST preloader — total ~1.6s, no blocking
    tl
      .fromTo('.preloader-logo', {
        opacity: 0, y: 12, scale: 0.92
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5, ease: 'power3.out'
      }, 0.1)
      .to('.preloader-line', {
        width: 100, duration: 0.6, ease: 'power4.inOut'
      }, 0.3)
      .fromTo('.preloader-counter', { opacity: 0 }, {
        opacity: 1, duration: 0.2
      }, 0.4)
      .to('.preloader-counter-num', {
        innerText: 100,
        duration: 0.7,
        ease: 'power2.inOut',
        snap: { innerText: 1 },
        onUpdate() {
          const el = document.querySelector('.preloader-counter-num');
          if (el) el.textContent = Math.round(gsap.getProperty(el, 'innerText'));
        }
      }, 0.5)
      // Wipe out
      .to('.preloader-inner', {
        opacity: 0, scale: 0.96,
        duration: 0.25, ease: 'power2.in'
      }, 1.3)
      .to('.preloader-top-half', {
        yPercent: -100, duration: 0.5, ease: 'power4.inOut'
      }, 1.45)
      .to('.preloader-bottom-half', {
        yPercent: 100, duration: 0.5, ease: 'power4.inOut'
      }, '<');

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div id="preloader" ref={ref}>
      <div className="preloader-top-half" />
      <div className="preloader-bottom-half" />
      <div className="preloader-inner">
        <div className="preloader-logo">OW</div>
        <div className="preloader-line" />
        <div className="preloader-counter">
          <span className="preloader-counter-num">0</span>
          <span className="preloader-counter-pct">%</span>
        </div>
      </div>
    </div>
  );
}
