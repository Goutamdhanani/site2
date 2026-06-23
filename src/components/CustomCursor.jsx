import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function CustomCursor() {
  if (isLite) return null;

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailsRef = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const trailPositions = useRef([]);
  const raf = useRef(null);

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

    // ─── HOVER EFFECTS ───
    const handleHoverIn = (e) => {
      const isButton = e.target.closest('a, button, .magnetic');
      const isCard = e.target.closest('.project-card, .testimonial-card, .service-row, .stat-card');

      if (isButton) {
         gsap.to(ringEl, { width: 56, height: 56, opacity: 0.4, borderColor: 'var(--accent-ember)', duration: 0.3 });
        gsap.to(dot, { width: 0, height: 0, opacity: 0, duration: 0.2 });
      } else if (isCard) {
        gsap.to(ringEl, { width: 80, height: 80, opacity: 0.15, duration: 0.4 });
        gsap.to(dot, { width: 4, height: 4, opacity: 0.8, duration: 0.2 });
      }
    };

    const handleHoverOut = () => {
      gsap.to(ringEl, { width: 36, height: 36, opacity: 0.5, borderColor: 'rgba(255,255,255,0.3)', duration: 0.4, ease: 'elastic.out(1, 0.6)' });
      gsap.to(dot, { width: 6, height: 6, opacity: 1, duration: 0.3 });
    };

    // Attach to interactive elements
    let interactables = [];
    const attachListeners = () => {
      interactables = Array.from(document.querySelectorAll('a, button, [data-cursor], .service-row, .project-card, .testimonial-card, .stat-card'));
      interactables.forEach(el => {
        el.addEventListener('mouseenter', handleHoverIn);
        el.addEventListener('mouseleave', handleHoverOut);
      });
    };

    // Delayed attach for DOM readiness
    const timer = setTimeout(() => {
      attachListeners();
    }, 1000);

    document.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      // Clean up hover listeners
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
      {/* Motion trails */}
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="cursor-trail"
          ref={el => trailsRef.current[i] = el}
          aria-hidden="true"
          style={{
            opacity: 0.3 - i * 0.05,
            width: 4 - i * 0.5,
            height: 4 - i * 0.5,
          }}
        />
      ))}
    </>
  );
}
