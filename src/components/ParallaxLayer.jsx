import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ParallaxLayer — wraps content in a depth-aware container.
 *
 * Layer speeds:
 *   Layer 1 (atmosphere):     speed = 0.1
 *   Layer 2 (environment):    speed = 0.2
 *   Layer 3 (visual objects): speed = 0.6
 *   Layer 4 (typography):     speed = 0.8
 *   Layer 5 (UI):             speed = 1.0
 */
export default function ParallaxLayer({
  children,
  speed = 0.5,
  className = '',
  style = {},
  as: Tag = 'div',
  zIndex = 0,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const yAmount = (1 - speed) * -200; // Slower layers move less

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: yAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-scene]') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return (
    <Tag
      ref={ref}
      className={`parallax-layer ${className}`}
      style={{
        position: 'relative',
        zIndex,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
