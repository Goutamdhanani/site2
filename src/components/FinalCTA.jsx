import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function FinalCTA() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('#contact .cta-big-title', {
        y: 100, opacity: 0, scale: 0.85, filter: 'blur(6px)'
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '#contact', start: 'top 75%', once: true }
      });

      gsap.fromTo('#contact .cta-subtitle', {
        opacity: 0, y: 30
      }, {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '#contact', start: 'top 70%', once: true },
        delay: 0.3
      });

      gsap.fromTo('#contact .cta-actions', {
        opacity: 0, y: 20
      }, {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '#contact', start: 'top 70%', once: true },
        delay: 0.5
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef}>
      <div className="cta-section">
        {/* Background gradient orbs */}
        <div className="cta-gradient-bg" aria-hidden="true">
          <div className="cta-orb cta-orb--1" />
          <div className="cta-orb cta-orb--2" />
        </div>

        <div className="container cta-container">
          <h2 className="cta-big-title">
            Let's build<br />something great.
          </h2>
          <p className="cta-subtitle">
            Ready to turn your vision into a product users love?<br />
            Let's talk — no pitch decks, no BS.
          </p>

          <div className="cta-actions">
            <a href="mailto:hello@oddwebs.com" className="btn-primary btn-large magnetic">
              Start a Project
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '8px' }}>
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#" className="btn-outline magnetic">Book a Call</a>
          </div>

          <div className="cta-trust">
            <span>Free consultation</span>
            <span className="cta-trust-dot"></span>
            <span>48hr response</span>
            <span className="cta-trust-dot"></span>
            <span>No commitment</span>
          </div>
        </div>
      </div>
    </section>
  );
}
