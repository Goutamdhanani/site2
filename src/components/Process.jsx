import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'Deep dive into your business, audience, and goals. We map the competitive landscape and identify opportunities.',
    color: '#8b5cf6'
  },
  {
    num: '02',
    title: 'Strategy',
    desc: 'Architecture, user flows, and technical specifications. Every decision backed by data and experience.',
    color: '#3b82f6'
  },
  {
    num: '03',
    title: 'Design',
    desc: 'Pixel-perfect interfaces that balance beauty with conversion. Interactive prototypes before a single line of code.',
    color: '#ec4899'
  },
  {
    num: '04',
    title: 'Build',
    desc: 'Clean, performant code. Agile sprints with weekly demos. You see progress in real-time, not just at the end.',
    color: '#14b8a6'
  },
  {
    num: '05',
    title: 'Launch & Scale',
    desc: 'Deployment, monitoring, and continuous optimisation. We don\'t disappear after launch — we help you grow.',
    color: '#f59e0b'
  }
];

export default function Process() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── TITLE: Slides through depth ───
      gsap.fromTo('#process .section-title-reveal', {
        y: 100, opacity: 0, scale: 0.85, filter: 'blur(10px)',
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.2, ease: 'power3.out',
        scrollTrigger: {
          trigger: '#process',
          start: 'top 75%',
          once: true,
        },
      });

      // ─── TIMELINE LINE: Draws in 3D space ───
      const line = document.querySelector('.process-timeline-line');
      if (line) {
        gsap.fromTo(line, {
          scaleY: 0,
          opacity: 0,
        }, {
          scaleY: 1,
          opacity: 1,
          duration: 2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '#process .process-timeline',
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: 1,
          },
        });
      }

      // ─── STEPS: Each emerges as camera reaches it ───
      gsap.utils.toArray('.process-step').forEach((step, i) => {
        const isEven = i % 2 === 0;

        // Step content emerges from side with perspective warp
        gsap.fromTo(step, {
          opacity: 0,
          x: isEven ? -80 : 80,
          y: 60,
          scale: 0.85,
          rotateY: isEven ? -12 : 12,
          filter: 'blur(6px)',
          transformPerspective: 1200,
        }, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotateY: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 88%',
            once: true,
          },
          delay: i * 0.1,
        });

        // Dot pulses with light when visible
        const dot = step.querySelector('.process-step__dot');
        if (dot) {
          gsap.fromTo(dot, {
            scale: 0,
            opacity: 0,
          }, {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
              once: true,
            },
            delay: i * 0.1 + 0.3,
          });
        }

        // Independent parallax per step
        gsap.to(step, {
          y: -20 * (i + 1) * 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: step,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} data-scene="process" style={{ perspective: '1200px' }}>
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
            <div key={i} className="process-step" style={{ '--step-color': step.color, transformStyle: 'preserve-3d' }}>
              <div className="process-step__dot">
                <span>{step.num}</span>
              </div>
              <div className="process-step__content">
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
