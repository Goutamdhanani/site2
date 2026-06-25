import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

export default function SplitHeading({ text, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const chars = ref.current.querySelectorAll('.split-char');
    
    if (prefersReducedMotion() || isLite) {
      gsap.set(chars, { opacity: 1, y: 0, rotateX: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(chars,
        { opacity: 0, y: '110%', rotateX: -40 },
        {
          opacity: 1,
          y: '0%',
          rotateX: 0,
          duration: 0.7,
          ease: EASE.out,
          stagger: 0.03,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          }
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [text]);

  return (
    <h2 ref={ref} className={className} style={{ perspective: '600px' }}>
      {text.split('').map((char, i) => (
        <span key={i} className="split-char" style={{
          display: 'inline-block',
          overflow: 'hidden',
          lineHeight: 1.1,
        }}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </h2>
  );
}
