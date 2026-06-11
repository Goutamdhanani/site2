import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    // Don't render on touch devices
    if ('ontouchstart' in window || window.innerWidth < 900) return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      // Dot follows immediately via GSAP
      gsap.to(dot, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    const animate = () => {
      // Ring lags behind for premium feel
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      if (ringEl) {
        ringEl.style.left = ring.current.x + 'px';
        ringEl.style.top = ring.current.y + 'px';
      }
      raf.current = requestAnimationFrame(animate);
    };

    // Hover effects on interactive elements
    const handleHoverIn = () => {
      gsap.to(ringEl, { width: 64, height: 64, opacity: 0.3, duration: 0.3, ease: 'power2.out' });
      gsap.to(dot, { width: 0, height: 0, opacity: 0, duration: 0.2 });
    };

    const handleHoverOut = () => {
      gsap.to(ringEl, { width: 36, height: 36, opacity: 0.6, duration: 0.3 });
      gsap.to(dot, { width: 6, height: 6, opacity: 1, duration: 0.2 });
    };

    // Attach hover listeners to all interactive elements
    const interactables = document.querySelectorAll('a, button, [data-cursor], .service-row, .work-card');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleHoverIn);
      el.addEventListener('mouseleave', handleHoverOut);
    });

    document.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverIn);
        el.removeEventListener('mouseleave', handleHoverOut);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
