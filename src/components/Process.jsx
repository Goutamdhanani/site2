import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const steps = [
  { num: '01', title: 'Discover', desc: 'Deep-dive into your goals, users, and market. We ask the questions other agencies skip.', duration: 'Week 1' },
  { num: '02', title: 'Design', desc: 'High-fidelity Figma prototypes with your full feedback loop. You approve every pixel.', duration: 'Week 2' },
  { num: '03', title: 'Build', desc: 'Production-grade code. Daily commits. Staging environment throughout. No surprises.', duration: 'Weeks 3–5' },
  { num: '04', title: 'Launch & Scale', desc: "We don't disappear post-launch. Analytics, iterations, and growth support built in.", duration: 'Week 6+' }
];

export default function Process() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── SECTION HEADER ───
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: '#process', start: 'top 75%', once: true }
      });

      headerTl
        .fromTo('#process .eyebrow', {
          opacity: 0, x: -20
        }, {
          opacity: 1, x: 0,
          duration: 0.6, ease: 'power3.out'
        })
        .fromTo('#process .heading-lg', {
          opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)'
        }, {
          opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
          duration: 1, ease: 'power4.out'
        }, '-=0.3')
        .fromTo('#process .body-lg', {
          opacity: 0, y: 20
        }, {
          opacity: 1, y: 0,
          duration: 0.7, ease: 'power2.out'
        }, '-=0.5');

      // ─── BORDER LINE DRAW ───
      gsap.fromTo('.process-grid', {
        clipPath: 'inset(0 100% 0 0)'
      }, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: '.process-grid',
          start: 'top 85%',
          once: true
        }
      });

      // ─── PROCESS STEPS — DRAMATIC STAGGER ───
      gsap.utils.toArray('.process-step').forEach((step, i) => {
        const num = step.querySelector('.process-num');
        const title = step.querySelector('.heading-sm');
        const desc = step.querySelector('.body-md');
        const dur = step.querySelector('.process-duration');

        const stepTl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            once: true
          },
          delay: i * 0.15
        });

        // Number pops in
        stepTl.fromTo(num, {
          opacity: 0, scale: 0.5, y: -10
        }, {
          opacity: 1, scale: 1, y: 0,
          duration: 0.5, ease: 'back.out(2)'
        });

        // Title slides in
        stepTl.fromTo(title, {
          opacity: 0, y: 30, clipPath: 'inset(100% 0 0 0)'
        }, {
          opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
          duration: 0.8, ease: 'power4.out'
        }, '-=0.2');

        // Description fades
        stepTl.fromTo(desc, {
          opacity: 0, y: 15
        }, {
          opacity: 1, y: 0,
          duration: 0.6, ease: 'power2.out'
        }, '-=0.3');

        // Duration tag slides in
        stepTl.fromTo(dur, {
          opacity: 0, x: -20
        }, {
          opacity: 1, x: 0,
          duration: 0.5, ease: 'power2.out'
        }, '-=0.2');
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef}>
      <div className="container">
        <div className="process-top">
          <div>
            <p className="eyebrow">Our Process</p>
            <h2 className="heading-lg">How we work.</h2>
          </div>
          <p className="body-lg" style={{ maxWidth: '480px' }}>
            Four steps. No fluff. No hidden phases. From brief to launch in weeks — not months.
          </p>
        </div>

        <div className="process-grid">
          {steps.map((s, i) => (
            <div className="process-step" key={i}>
              <span className="process-num">{s.num}</span>
              <h3 className="heading-sm">{s.title}</h3>
              <p className="body-md">{s.desc}</p>
              <p className="process-duration">{s.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
