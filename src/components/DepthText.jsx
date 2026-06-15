import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * DepthText — cinematic text that assembles, reveals, or emerges from depth.
 *
 * Modes:
 *   'assemble'  — characters scatter from random positions and assemble
 *   'unmask'    — text revealed through expanding clip-path mask
 *   'emerge'    — text slides through z-depth (scale + blur)
 *   'stretch'   — characters stretch from compressed to normal
 *   'stagger'   — word-by-word staggered reveal with overshoot
 */
export default function DepthText({
  children,
  as: Tag = 'h2',
  mode = 'stagger',
  className = '',
  style = {},
  splitBy = 'word', // 'word' or 'char'
  staggerAmount = 0.06,
  duration = 1.2,
  scrub = false,
  triggerStart = 'top 80%',
  delay = 0,
}) {
  const ref = useRef(null);
  const text = typeof children === 'string' ? children : '';

  const elements = useMemo(() => {
    if (!text) return [];
    if (splitBy === 'char') {
      return text.split('').map((char, i) => ({
        char: char === ' ' ? '\u00A0' : char,
        key: i,
        isSpace: char === ' ',
      }));
    }
    return text.split(/\s+/).map((word, i) => ({
      char: word,
      key: i,
      isSpace: false,
    }));
  }, [text, splitBy]);

  useEffect(() => {
    if (!ref.current || !text) return;

    const targets = ref.current.querySelectorAll('.dt-unit');
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      const animConfig = getAnimConfig(mode, targets, {
        staggerAmount,
        duration,
        delay,
      });

      if (scrub) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: triggerStart,
            end: 'top 20%',
            scrub: 1.5,
          },
        });
        tl.fromTo(targets, animConfig.from, animConfig.to);
      } else {
        gsap.fromTo(targets, animConfig.from, {
          ...animConfig.to,
          scrollTrigger: {
            trigger: ref.current,
            start: triggerStart,
            once: true,
          },
        });
      }
    }, ref);

    return () => ctx.revert();
  }, [text, mode, splitBy, staggerAmount, duration, scrub, triggerStart, delay]);

  if (!text) {
    return <Tag className={className} style={style}>{children}</Tag>;
  }

  return (
    <Tag ref={ref} className={`depth-text depth-text--${mode} ${className}`} style={{ ...style, perspective: '1000px' }}>
      {elements.map((el) => (
        <span
          key={el.key}
          className="dt-wrap"
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
          }}
        >
          <span
            className="dt-unit"
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity, filter',
            }}
          >
            {el.char}
          </span>
          {splitBy === 'word' && el.key < elements.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  );
}

function getAnimConfig(mode, targets, { staggerAmount, duration, delay }) {
  switch (mode) {
    case 'assemble':
      return {
        from: {
          y: () => gsap.utils.random(-120, 120),
          x: () => gsap.utils.random(-80, 80),
          rotation: () => gsap.utils.random(-25, 25),
          opacity: 0,
          scale: 0.3,
        },
        to: {
          y: 0, x: 0, rotation: 0, opacity: 1, scale: 1,
          duration,
          stagger: staggerAmount,
          ease: 'elastic.out(1, 0.6)',
          delay,
        },
      };

    case 'unmask':
      return {
        from: {
          clipPath: 'inset(0 100% 0 0)',
          opacity: 0,
        },
        to: {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: duration * 0.8,
          stagger: staggerAmount * 0.5,
          ease: 'power4.inOut',
          delay,
        },
      };

    case 'emerge':
      return {
        from: {
          scale: 0.4,
          opacity: 0,
          filter: 'blur(20px)',
          z: -200,
        },
        to: {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          z: 0,
          duration,
          stagger: staggerAmount,
          ease: 'power3.out',
          delay,
        },
      };

    case 'stretch':
      return {
        from: {
          scaleY: 3,
          scaleX: 0.3,
          opacity: 0,
          y: 60,
        },
        to: {
          scaleY: 1,
          scaleX: 1,
          opacity: 1,
          y: 0,
          duration,
          stagger: staggerAmount,
          ease: 'power4.out',
          delay,
        },
      };

    case 'stagger':
    default:
      return {
        from: {
          y: '110%',
          opacity: 0,
          rotateX: 40,
        },
        to: {
          y: '0%',
          opacity: 1,
          rotateX: 0,
          duration: duration * 0.7,
          stagger: staggerAmount,
          ease: 'power4.out',
          delay,
        },
      };
  }
}
