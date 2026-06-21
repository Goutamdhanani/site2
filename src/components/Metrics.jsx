import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 150, suffix: '+', label: 'Projects Delivered', color: 'var(--accent-ember)' },
  { value: 98, suffix: '%', label: 'Client Satisfaction', color: 'var(--accent-amber)' },
  { value: 4.2, suffix: 'x', label: 'Average ROI', decimals: 1, color: 'var(--accent-gold)' },
  { value: 24, suffix: '/7', label: 'Support & Uptime', color: 'var(--accent-lacquer)' },
];

export default function Metrics() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {

      // Skip animations if reduced motion preferred
      if (prefersReducedMotion) {
        // Set final values immediately
      const stats = document.querySelectorAll('.stat-value');
      stats.forEach((el) => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const decimals = parseInt(el.dataset.decimals) || 0;
          el.textContent = target.toFixed(decimals) + suffix;
        });
        return;
      }

      // ─── STAT CARDS: Emerge from deep behind camera ───
      gsap.utils.toArray('.stat-card').forEach((card, i) => {
        // Each card emerges from a unique 3D position
        gsap.fromTo(card, {
          y: 150,
          opacity: 0,
          scale: 0.5,
          rotateX: 30,
          rotateY: (i % 2 === 0 ? -1 : 1) * 15,
          filter: 'blur(10px)',
          transformPerspective: 1200,
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            once: true,
          },
          stagger: 0.1,
        });

        // Parallax depth — front cards move more
        gsap.to(card, {
          y: -20 * (i + 1) * 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });

      // ─── PARALLAX DEPTH & COUNTER ANIMATIONS ───
      const numbers = gsap.utils.toArray('.stat-value');
      const labels = gsap.utils.toArray('.stat-label');

      numbers.forEach((el, i) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals) || 0;

        // 1. Parallax scroll effect (numbers move faster)
        gsap.fromTo(el,
          { y: 60 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );

        // 2. Count up with elastic overshoot
        gsap.fromTo({ val: 0 }, { val: 0 }, {
          val: target,
          duration: 2.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent = this.targets()[0].val.toFixed(decimals) + suffix;
          },
        });
        
        // 3. Stretch reveal
        gsap.fromTo(el, {
          scaleY: 2,
          opacity: 0,
          filter: 'blur(4px)',
        }, {
          scaleY: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        });
      });

      labels.forEach((label) => {
        // Parallax scroll effect (labels move slower)
        gsap.fromTo(label,
          { y: 20 },
          {
            y: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} data-scene="metrics" style={{ perspective: '1200px' }}>
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container">
        <div className="metrics-header">
          <p className="eyebrow">The Numbers</p>
          <SplitHeading text="Results" className="metrics-big-title" />
          <p className="metrics-subtitle">
            We let our work speak for itself. Here's the proof.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card" style={{ '--stat-color': stat.color, transformStyle: 'preserve-3d' }}>
              <div
                className="stat-value"
                data-target={stat.value}
                data-suffix={stat.suffix}
                data-decimals={stat.decimals || 0}
              >
                0{stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-card__glow" aria-hidden="true" style={{ background: stat.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
