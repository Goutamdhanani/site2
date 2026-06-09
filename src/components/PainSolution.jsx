import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const painItems = [
  '3-month delays on a 2-week project',
  'Zero communication after invoice paid',
  'Cookie-cutter Elementor called "custom"',
  'Hidden costs at final delivery',
  'Pretty pixels, zero business results',
];

const solutionItems = [
  'Live project dashboard from day one',
  'Weekly Loom video updates, always',
  '100% custom — no templates, ever',
  'Fixed price. Fixed timeline. No surprises.',
  'ROI-obsessed: we track what we build',
];

export default function PainSolution() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pain-col', { x: -60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.fromTo('.solution-col', { x: 60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });

      // Animate divider line (skip when non-rendered, e.g. hidden on mobile —
      // getTotalLength() throws InvalidStateError on display:none SVG elements)
      const line = document.querySelector('.divider-line');
      if (line && line.getClientRects().length > 0) {
        const length = line.getTotalLength();
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(line, {
          strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="pain-solution" ref={sectionRef} id="pain-solution">
      <div className="pain-solution-accent" />
      <div className="pain-solution-grid">
        <div className="pain-col">
          <span className="section-label problem">The problem</span>
          <h2 className="pain-headline">
            Tired of agencies that <span className="strikethrough">ghost</span> you?
          </h2>
          <p className="pain-sub">You've been here before.</p>
          <div className="pain-list">
            {painItems.map((item, i) => (
              <div className="pain-item" key={i}>
                <span className="pain-icon">✗</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-svg">
          <svg width="3" height="100%" viewBox="0 0 3 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dividerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5F57" />
                <stop offset="100%" stopColor="#06EFC5" />
              </linearGradient>
            </defs>
            <line className="divider-line" x1="1.5" y1="0" x2="1.5" y2="400" stroke="url(#dividerGrad)" strokeWidth="2" />
          </svg>
        </div>

        <div className="solution-col">
          <span className="section-label solution">The oddwebs way</span>
          <h2 className="solution-headline">
            We are your digital <strong>growth partner.</strong>
          </h2>
          <div className="solution-list">
            {solutionItems.map((item, i) => (
              <div className="solution-item" key={i}>
                <span className="solution-icon">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
