import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const items = [
  'Websites', 'Mobile Apps', 'AI Systems', 'Automation', 'Design Systems', 'Growth'
];

export default function Marquee() {
  const stripRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── ENTRANCE: Marquee materializes from blur ───
      gsap.fromTo('.marquee-strip', {
        opacity: 0,
        filter: 'blur(12px)',
        scaleY: 0.3,
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        scaleY: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.marquee-strip',
          start: 'top 95%',
          once: true,
        },
      });

      // Infinite horizontal scroll
      const track = document.querySelector('.marquee-track');
      if (track) {
        const w = track.scrollWidth / 3;
        gsap.to(track, {
          x: -w,
          duration: 25,
          ease: 'none',
          repeat: -1,
        });
      }

      // ─── SCROLL: Marquee skews and distorts as camera passes ───
      gsap.to('.marquee-strip', {
        skewX: -6,
        scaleX: 1.1,
        filter: 'blur(2px)',
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: '.marquee-strip',
          start: 'top 60%',
          end: 'bottom 20%',
          scrub: 1.5,
        },
      });

      // Individual items drift at different speeds for depth
      gsap.utils.toArray('.marquee-track span:not(.marquee-dot)').forEach((span, i) => {
        gsap.to(span, {
          y: (i % 2 === 0 ? -1 : 1) * 20,
          ease: 'none',
          scrollTrigger: {
            trigger: '.marquee-strip',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

    }, stripRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="marquee-strip" ref={stripRef} data-scene="marquee">
      <div className="marquee-track marquee-track--gsap">
        {[...items, ...items, ...items].map((item, i) => (
          <React.Fragment key={i}>
            <span>{item}</span>
            <span className="marquee-dot">/</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
