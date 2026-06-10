import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const items = [
  'Websites', 'Mobile Apps', 'AI Systems', 'Automation', 'Design Systems', 'Growth'
];

export default function Marquee() {
  const stripRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance
      gsap.fromTo('.marquee-strip', {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.marquee-strip',
          start: 'top 95%',
          once: true
        }
      });

      // Simple CSS-based infinite scroll via GSAP
      const track = document.querySelector('.marquee-track');
      if (track) {
        const w = track.scrollWidth / 3;
        gsap.to(track, {
          x: -w,
          duration: 30,
          ease: 'none',
          repeat: -1
        });
      }
    }, stripRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="marquee-strip" ref={stripRef}>
      <div className="marquee-track marquee-track--gsap">
        {[...items, ...items, ...items].map((item, i) => (
          <React.Fragment key={i}>
            <span>{item}</span>
            <span className="marquee-dot">◆</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
