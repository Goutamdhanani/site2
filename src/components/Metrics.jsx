import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const stats = [
  { value: 47, suffix: '+', desc: 'Projects delivered across 18 industries worldwide' },
  { value: 98, suffix: '%', desc: 'Client satisfaction rate — measured, not assumed' },
  { value: null, display: '₹4.2Cr', desc: 'Revenue generated for clients in the last 12 months' },
  { value: 21, suffix: '', desc: 'Countries served — from Mumbai to Melbourne' }
];

export default function Metrics() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── HEADLINE ENTRANCE ───
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: '#proof', start: 'top 75%', once: true }
      });

      headerTl
        .fromTo('#proof .eyebrow', {
          opacity: 0, x: -20
        }, {
          opacity: 1, x: 0,
          duration: 0.6, ease: 'power3.out'
        })
        .fromTo('#proof .heading-lg', {
          opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)'
        }, {
          opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
          duration: 1, ease: 'power4.out'
        }, '-=0.3');

      // ─── STAT BLOCKS — STAGGERED + COUNTER ANIMATION ───
      gsap.utils.toArray('.stat-block').forEach((block, i) => {
        const metricEl = block.querySelector('.metric');
        const descEl = block.querySelector('.stat-desc');
        const borderEl = block;

        const statTl = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: 'top 88%',
            once: true
          },
          delay: i * 0.15
        });

        // Border draws in
        statTl.fromTo(borderEl, {
          clipPath: 'inset(0 100% 0 0)'
        }, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.8,
          ease: 'power3.out'
        });

        // Counter animates
        if (metricEl && metricEl.dataset.target) {
          const target = parseInt(metricEl.dataset.target);
          const suffix = metricEl.dataset.suffix || '';
          statTl.fromTo(metricEl, {
            opacity: 0, scale: 0.8
          }, {
            opacity: 1, scale: 1,
            duration: 0.5,
            ease: 'back.out(1.5)'
          }, '-=0.4');

          statTl.to(metricEl, {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function() {
              metricEl.textContent = Math.round(gsap.getProperty(metricEl, 'innerText')) + suffix;
            }
          }, '-=0.3');
        } else if (metricEl) {
          statTl.fromTo(metricEl, {
            opacity: 0, scale: 0.8
          }, {
            opacity: 1, scale: 1,
            duration: 0.6,
            ease: 'back.out(1.5)'
          }, '-=0.4');
        }

        // Description fades in
        if (descEl) {
          statTl.fromTo(descEl, {
            opacity: 0, y: 10
          }, {
            opacity: 1, y: 0,
            duration: 0.5,
            ease: 'power2.out'
          }, '-=0.3');
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="proof" ref={sectionRef}>
      <div className="container">
        <div className="proof-grid">
          <div className="proof-headline">
            <p className="eyebrow">By The Numbers</p>
            <h2 className="heading-lg">Numbers that<br />tell the story.</h2>
          </div>

          <div className="proof-stats">
            {stats.map((s, i) => (
              <div className="stat-block" key={i}>
                {s.value !== null ? (
                  <span
                    className="metric"
                    data-target={s.value}
                    data-suffix={s.suffix}
                  >
                    0{s.suffix}
                  </span>
                ) : (
                  <span className="metric">{s.display}</span>
                )}
                <p className="stat-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
