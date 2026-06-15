import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 150, suffix: '+', label: 'Projects Delivered', color: '#8b5cf6' },
  { value: 98, suffix: '%', label: 'Client Satisfaction', color: '#3b82f6' },
  { value: 4.2, suffix: 'x', label: 'Average ROI', decimals: 1, color: '#14b8a6' },
  { value: 24, suffix: '/7', label: 'Support & Uptime', color: '#ec4899' },
];

export default function Metrics() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── SECTION TITLE: Scale from massive to normal with depth ───
      gsap.fromTo('#proof .section-title-reveal', {
        y: 100, opacity: 0, scale: 1.8, filter: 'blur(16px)',
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.5, ease: 'power3.out',
        scrollTrigger: {
          trigger: '#proof',
          start: 'top 75%',
          once: true,
        },
      });

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
          delay: i * 0.15,
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

      // ─── COUNTER ANIMATIONS with dramatic easing ───
      gsap.utils.toArray('.stat-value').forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals) || 0;

        // Number stretches vertically as it counts
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
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="proof" ref={sectionRef} data-scene="metrics" style={{ perspective: '1200px' }}>
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container">
        <div className="metrics-header">
          <p className="eyebrow">The Numbers</p>
          <h2 className="section-title-reveal metrics-big-title">
            Results
          </h2>
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
