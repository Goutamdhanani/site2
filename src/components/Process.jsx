import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'Deep dive into your business, audience, and goals. We map the competitive landscape and identify opportunities.',
    color: 'var(--accent-ember)'
  },
  {
    num: '02',
    title: 'Strategy',
    desc: 'Architecture, user flows, and technical specifications. Every decision backed by data and experience.',
    color: 'var(--accent-amber)'
  },
  {
    num: '03',
    title: 'Design',
    desc: 'Pixel-perfect interfaces that balance beauty with conversion. Interactive prototypes before a single line of code.',
    color: 'var(--accent-lacquer)'
  },
  {
    num: '04',
    title: 'Build',
    desc: 'Clean, performant code. Agile sprints with weekly demos. You see progress in real-time, not just at the end.',
    color: 'var(--accent-gold)'
  },
  {
    num: '05',
    title: 'Launch & Scale',
    desc: 'Deployment, monitoring, and continuous optimisation. We don\'t disappear after launch — we help you grow.',
    color: 'var(--accent-bright)'
  }
];

export default function Process() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── TIMELINE LINE: Draws down as user scrolls ───
      const line = document.querySelector('.process-timeline-line');
      if (line) {
        gsap.fromTo(line, {
          scaleY: 0,
          transformOrigin: 'top center',
        }, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: true,
          },
        });
      }

      // ─── STEPS & DOTS ───
      const stepDots = gsap.utils.toArray('.process-step__dot');
      
      gsap.utils.toArray('.process-step').forEach((step, i) => {
        const isEven = i % 2 === 0;

        // Content reveal
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
          stagger: 0.1,
        });

        // Each step dot pops in when the line reaches it
        const dot = stepDots[i];
        if (dot) {
          const triggerPosition = `${20 + i * (60 / Math.max(1, stepDots.length - 1))}%`;
          ScrollTrigger.create({
            trigger: '.process-timeline',
            start: `${triggerPosition} 80%`,
            onEnter: () => {
              gsap.fromTo(dot,
                { scale: 0 },
                { scale: 1, duration: 0.4, ease: 'back.out(2)' }
              );
            }
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
          <SplitHeading text="Process" className="process-big-title" />
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
