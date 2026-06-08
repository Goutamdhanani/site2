import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: 'STEP 1', title: 'DISCOVER', week: 'Week 1', color: '#7B3FE4',
    icon: '🔍', desc: 'Deep-dive into your goals, users, and market position.',
    note: 'We ask the questions other agencies skip.',
  },
  {
    num: 'STEP 2', title: 'DESIGN', week: 'Week 2', color: '#06EFC5',
    icon: '✦', desc: 'High-fidelity Figma prototypes. You approve every pixel.',
    note: 'Unlimited revisions until it\'s exactly right.',
  },
  {
    num: 'STEP 3', title: 'BUILD', week: 'Weeks 3–5', color: '#FFD166',
    icon: '⟨/⟩', desc: 'Production-grade code. Daily GitHub commits.',
    note: 'Staging environment so you see progress in real time.',
  },
  {
    num: 'STEP 4', title: 'LAUNCH', week: 'Week 6+', color: '#A78BFA',
    icon: '🚀', desc: 'Deploy, monitor, iterate. We don\'t disappear post-launch.',
    note: 'Growth support and analytics built in from day one.',
  },
];

export default function Process() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.process-step').forEach((step, i) => {
        gsap.fromTo(step, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 85%' },
          delay: i * 0.15,
        });
      });

      // Draw the SVG line
      const line = document.querySelector('.process-svg-line');
      if (line) {
        const length = line.getTotalLength();
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(line, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: 1,
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="process-section" ref={sectionRef} id="process">
      <div className="section-header">
        <span className="section-pill">[ HOW WE WORK ]</span>
        <h2 className="section-title">From idea to launch — <span className="highlight">in 4 steps.</span></h2>
      </div>

      <div className="process-timeline">
        <svg className="process-line-svg" width="100%" height="3" preserveAspectRatio="none">
          <defs>
            <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7B3FE4" />
              <stop offset="33%" stopColor="#06EFC5" />
              <stop offset="66%" stopColor="#FFD166" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <line className="process-svg-line" x1="28" y1="1.5" x2="100%" y2="1.5" stroke="url(#processGrad)" strokeWidth="2" />
        </svg>

        <div className="process-steps">
          {steps.map((s, i) => (
            <div className="process-step" key={i}>
              <div className="step-circle" style={{ background: `${s.color}20`, borderColor: s.color, border: `2px solid ${s.color}` }}>
                <span>{s.icon}</span>
              </div>
              <div className="step-label">{s.week}</div>
              <div className="step-title" style={{ color: s.color }}>{s.title}</div>
              <div className="step-desc">{s.desc}</div>
              <div className="step-note">{s.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="process-proof">
        <div className="proof-badge">⚡ Avg. 6-week delivery</div>
        <div className="proof-badge">💰 Fixed price always</div>
        <div className="proof-badge">✓ 100% satisfaction guarantee</div>
      </div>
    </section>
  );
}
