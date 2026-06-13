import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'Deep dive into your business, audience, and goals. We map the competitive landscape and identify opportunities.',
    icon: '🔍',
    color: '#8b5cf6'
  },
  {
    num: '02',
    title: 'Strategy',
    desc: 'Architecture, user flows, and technical specifications. Every decision backed by data and experience.',
    icon: '🎯',
    color: '#3b82f6'
  },
  {
    num: '03',
    title: 'Design',
    desc: 'Pixel-perfect interfaces that balance beauty with conversion. Interactive prototypes before a single line of code.',
    icon: '✨',
    color: '#ec4899'
  },
  {
    num: '04',
    title: 'Build',
    desc: 'Clean, performant code. Agile sprints with weekly demos. You see progress in real-time, not just at the end.',
    icon: '⚡',
    color: '#14b8a6'
  },
  {
    num: '05',
    title: 'Launch & Scale',
    desc: 'Deployment, monitoring, and continuous optimisation. We don\'t disappear after launch — we help you grow.',
    icon: '🚀',
    color: '#f59e0b'
  }
];

export default function Process() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      gsap.fromTo('#process .section-title-reveal', {
        y: 80, opacity: 0, scale: 0.9, filter: 'blur(4px)'
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#process', start: 'top 75%', once: true }
      });

      // Timeline steps
      gsap.utils.toArray('.process-step').forEach((step, i) => {
        gsap.fromTo(step, {
          opacity: 0, y: 60, scale: 0.95
        }, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 88%', once: true },
          delay: i * 0.1
        });
      });

      // Timeline line draw
      const line = document.querySelector('.process-timeline-line');
      if (line) {
        gsap.fromTo(line, { scaleY: 0 }, {
          scaleY: 1, duration: 2, ease: 'power2.inOut',
          scrollTrigger: { trigger: '#process .process-timeline', start: 'top 80%', once: true }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef}>
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container">
        <div className="process-header">
          <p className="eyebrow">How We Work</p>
          <h2 className="section-title-reveal process-big-title">Process</h2>
          <p className="process-subtitle">
            A proven framework that turns ideas into shipped products.
          </p>
        </div>

        <div className="process-timeline">
          <div className="process-timeline-line" aria-hidden="true" />

          {steps.map((step, i) => (
            <div key={i} className="process-step" style={{ '--step-color': step.color }}>
              <div className="process-step__dot">
                <span>{step.icon}</span>
              </div>
              <div className="process-step__content">
                <span className="process-step__num">{step.num}</span>
                <h3 className="process-step__title">{step.title}</h3>
                <p className="process-step__desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
