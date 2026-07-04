import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);
  const trailsRef = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const trailPositions = useRef([]);
  const raf = useRef(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    if (isLite) return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    const trails = trailsRef.current;

    // Initialize trail positions
    for (let i = 0; i < 5; i++) {
      trailPositions.current[i] = { x: 0, y: 0 };
    }

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Fade in cursor on first move
      if (!hasMoved.current) {
        hasMoved.current = true;
        gsap.to(dot, { opacity: 1, duration: 0.3 });
        gsap.to(ringEl, { opacity: 0.6, duration: 0.3 });
        trails.forEach((trail, i) => {
          if (trail) {
            gsap.to(trail, { opacity: 0.3 - i * 0.05, duration: 0.3 });
          }
        });
      }

      // Dot follows with slight physics
      gsap.to(dot, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
      });
    };

    const animate = () => {
      // Ring lags with momentum
      ring.current.x += (mouse.current.x - ring.current.x) * 0.1;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.1;
      if (ringEl) {
        ringEl.style.left = ring.current.x + 'px';
        ringEl.style.top = ring.current.y + 'px';
      }

      // Motion trails — each follows the previous
      trails.forEach((trail, i) => {
        if (!trail) return;
        const prev = i === 0 ? ring.current : trailPositions.current[i - 1];
        const factor = 0.08 - i * 0.012;

        trailPositions.current[i].x += (prev.x - trailPositions.current[i].x) * factor;
        trailPositions.current[i].y += (prev.y - trailPositions.current[i].y) * factor;

        trail.style.left = trailPositions.current[i].x + 'px';
        trail.style.top = trailPositions.current[i].y + 'px';
      });

      raf.current = requestAnimationFrame(animate);
    };

    // ─── HOVER EFFECTS (Event Delegation) ───
    const handleMouseOver = (e) => {
      if (!hasMoved.current) return;
      const target = e.target;
      if (!target) return;

      const isButton = target.closest('a, button, .magnetic, .btn-primary, .btn-ghost, .btn-outline, .nav-cta, .compliance-btn, .nav-burger');
      const isCard = target.closest('.project-card, .testimonial-card, .service-row, .stat-card, .pt-floating-card, .pt-console-btn-secondary');
      const isDrag = target.closest('.cs-card, [data-cursor="drag"], .pt-visual-column');
      const textEl = textRef.current;

      if (isButton) {
        gsap.to(ringEl, { width: 56, height: 56, opacity: 0.4, borderColor: 'var(--accent-ember)', duration: 0.3, overwrite: 'auto' });
        gsap.to(dot, { width: 0, height: 0, opacity: 0, duration: 0.2, overwrite: 'auto' });
        if (textEl) gsap.to(textEl, { opacity: 0, scale: 0.5, duration: 0.2, overwrite: 'auto' });
      } else if (isDrag) {
        gsap.to(ringEl, { width: 72, height: 72, opacity: 0.5, borderColor: 'var(--accent-ember)', duration: 0.3, overwrite: 'auto' });
        gsap.to(dot, { width: 0, height: 0, opacity: 0, duration: 0.2, overwrite: 'auto' });
        if (textEl) gsap.to(textEl, { opacity: 1, scale: 1, duration: 0.3, overwrite: 'auto' });
      } else if (isCard) {
        gsap.to(ringEl, { width: 80, height: 80, opacity: 0.15, duration: 0.4, overwrite: 'auto' });
        gsap.to(dot, { width: 4, height: 4, opacity: 0.8, duration: 0.2, overwrite: 'auto' });
        if (textEl) gsap.to(textEl, { opacity: 0, scale: 0.5, duration: 0.2, overwrite: 'auto' });
      } else {
        // Normal cursor state
        gsap.to(ringEl, { width: 36, height: 36, opacity: 0.6, borderColor: 'rgba(255,255,255,0.3)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(dot, { width: 6, height: 6, opacity: 1, duration: 0.3, overwrite: 'auto' });
        if (textEl) gsap.to(textEl, { opacity: 0, scale: 0.5, duration: 0.2, overwrite: 'auto' });
      }
    };

    // ─── VIEWPORT ENTER / LEAVE DETECTOR ───
    const handleMouseLeaveViewport = () => {
      gsap.to([dot, ringEl], { opacity: 0, duration: 0.25 });
      trails.forEach((trail) => {
        if (trail) gsap.to(trail, { opacity: 0, duration: 0.25 });
      });
    };

    const handleMouseEnterViewport = () => {
      if (!hasMoved.current) return;
      gsap.to(dot, { opacity: 1, duration: 0.25 });
      gsap.to(ringEl, { opacity: 0.6, duration: 0.25 });
      trails.forEach((trail, i) => {
        if (trail) gsap.to(trail, { opacity: 0.3 - i * 0.05, duration: 0.25 });
      });
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveViewport);
    document.addEventListener('mouseenter', handleMouseEnterViewport);
    
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveViewport);
      document.removeEventListener('mouseenter', handleMouseEnterViewport);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (isLite) return null;

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true">
        <span className="cursor-text" ref={textRef}>DRAG</span>
      </div>
      {/* Motion trails */}
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="cursor-trail"
          ref={el => trailsRef.current[i] = el}
          aria-hidden="true"
          style={{
            width: 4 - i * 0.5,
            height: 4 - i * 0.5,
          }}
        />
      ))}
    </>
  );
}
