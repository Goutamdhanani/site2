import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const stats = [
  { value: 150, suffix: '+', label: 'Projects Delivered', icon: '🚀' },
  { value: 98, suffix: '%', label: 'Client Satisfaction', icon: '⭐' },
  { value: 4.2, suffix: 'x', label: 'Average ROI', decimals: 1, icon: '📊' },
  { value: 24, suffix: '/7', label: 'Support & Uptime', icon: '🛡️' },
];

export default function Metrics() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Giant title
      gsap.fromTo('#proof .section-title-reveal', {
        y: 80, opacity: 0, scale: 0.9, filter: 'blur(4px)'
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#proof', start: 'top 75%', once: true }
      });

      // Stat cards — dramatic stagger
      gsap.utils.toArray('.stat-card').forEach((card, i) => {
        gsap.fromTo(card, {
          y: 100, opacity: 0, rotateX: 15, scale: 0.9
        }, {
          y: 0, opacity: 1, rotateX: 0, scale: 1,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          delay: i * 0.12
        });
      });

      // Counter animations
      gsap.utils.toArray('.stat-value').forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals) || 0;

        gsap.fromTo({ val: 0 }, { val: 0 }, {
          val: target,
          duration: 2.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate() {
            el.textContent = this.targets()[0].val.toFixed(decimals) + suffix;
          }
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="proof" ref={sectionRef}>
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
            <div key={i} className="stat-card">
              <div className="stat-card__icon">{stat.icon}</div>
              <div
                className="stat-value"
                data-target={stat.value}
                data-suffix={stat.suffix}
                data-decimals={stat.decimals || 0}
              >
                0{stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-card__glow" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
