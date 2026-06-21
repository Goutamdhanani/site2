import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const sectionRef = useRef(null);
  const ctaBtnRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── BACKGROUND: Intensifying glow orbs ───
      gsap.fromTo('.cta-orb--1', {
        scale: 0.3,
        opacity: 0,
      }, {
        scale: 1.5,
        opacity: 0.6,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      gsap.fromTo('.cta-orb--2', {
        scale: 0.5,
        opacity: 0,
      }, {
        scale: 1.3,
        opacity: 0.5,
        duration: 2.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      });

      // ─── TITLE: Massive mask reveal ───
      gsap.fromTo('.cta-big-title', {
        y: 120,
        opacity: 0,
        scale: 0.7,
        filter: 'blur(20px)',
        clipPath: 'inset(100% 0 0 0)',
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      });

      // ─── SUBTITLE: Fades through depth ───
      gsap.fromTo('.cta-subtitle', {
        opacity: 0,
        y: 40,
        filter: 'blur(6px)',
      }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          once: true,
        },
        delay: 0.3,
      });

      // ─── BUTTONS: Emerge with gravitational pull ───
      gsap.fromTo('.cta-actions', {
        opacity: 0,
        y: 50,
        scale: 0.9,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          once: true,
        },
        delay: 0.5,
      });

      // ─── ENERGY RINGS: Pulsing from CTA button ───
      gsap.to('.cta-energy-ring', {
        scale: 3,
        opacity: 0,
        duration: 2,
        ease: 'power2.out',
        repeat: -1,
        stagger: 0.7,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 50%',
          toggleActions: 'play pause resume pause',
        },
      });

      // ─── TRUST BADGES ───
      gsap.fromTo('.cta-trust', {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 55%',
          once: true,
        },
        delay: 0.7,
      });

    }, sectionRef);

    // ─── MAGNETIC BUTTON ───
    const btn = ctaBtnRef.current;
    if (btn && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const strength = 0.35;

      const onMouseMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;

        gsap.to(btn, {
          x: dx, y: dy,
          duration: 0.4,
          ease: 'power2.out'
        });
      };

      const onMouseLeave = () => {
        gsap.to(btn, {
          x: 0, y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      };

      const zone = btn.parentElement;
      zone.addEventListener('mousemove', onMouseMove);
      zone.addEventListener('mouseleave', onMouseLeave);

      return () => {
        zone.removeEventListener('mousemove', onMouseMove);
        zone.removeEventListener('mouseleave', onMouseLeave);
      };
    }

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} data-scene="cta" style={{ perspective: '1200px' }}>
      <div className="cta-section">
        {/* Background gradient orbs — intensified */}
        <div className="cta-gradient-bg" aria-hidden="true">
          <div className="cta-orb cta-orb--1" />
          <div className="cta-orb cta-orb--2" />
        </div>

        <div className="container cta-container">
          <SplitHeading text="Let's build something great." className="cta-big-title" />
          <p className="cta-subtitle">
            Ready to turn your vision into a product users love?<br />
            Let's talk — no pitch decks, no BS.
          </p>

          {/* Energy rings */}
          <div className="cta-energy-rings" aria-hidden="true">
            <div className="cta-energy-ring" />
            <div className="cta-energy-ring" />
            <div className="cta-energy-ring" />
          </div>

          <div className="cta-actions">
            <a ref={ctaBtnRef} href="mailto:hello@oddwebs.com" className="btn-primary btn-large magnetic">
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
