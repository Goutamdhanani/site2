import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

const projectParameters = [
  { label: 'AI Agent', color: 'var(--accent-ember)' },
  { label: 'Web App', color: 'var(--accent-amber)' },
  { label: 'Custom SaaS', color: 'var(--accent-gold)' },
  { label: 'Motion Design', color: 'var(--accent-lacquer)' },
  { label: 'Mobile App', color: 'var(--accent-bright)' },
];

export default function FinalCTA() {
  const sectionRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (label) => {
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter(t => t !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const getMailtoLink = () => {
    const base = 'mailto:hello@oddwebs.com';
    if (selectedTags.length === 0) {
      return `${base}?subject=Start a Project with oddwebs&body=Hi oddwebs team,%0D%0A%0D%0AI would like to start a project with you.`;
    }
    const tagsString = selectedTags.join(', ');
    return `${base}?subject=Project Spec: [${tagsString}]&body=Hi oddwebs team,%0D%0A%0D%0AI would like to start a project incorporating: ${tagsString}.`;
  };

  useEffect(() => {
    if (isLite) {
      // Set all elements fully visible immediately on mobile to prevent rendering delays
      gsap.set('.cta-singularity-portal', { scale: 1.3, opacity: 0.15 });
      gsap.set('.cta-console-panel', { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' });
      gsap.set('.cta-big-title', { opacity: 1, y: 0, filter: 'blur(0px)' });
      gsap.set('.cta-subtitle', { opacity: 1, y: 0 });
      gsap.set('.cta-spec-builder, .cta-actions', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {

      // ─── VISUAL EFFECTS: Singularity Pulse ───
      gsap.fromTo('.cta-singularity-portal', {
        scale: 0.5,
        opacity: 0,
      }, {
        scale: 1.3,
        opacity: 0.25,
        duration: 3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // ─── PANEL ENTRANCE ───
      gsap.fromTo('.cta-console-panel', {
        y: 60,
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      // ─── TITLE & TEXT ───
      gsap.fromTo('.cta-big-title', {
        opacity: 0,
        y: 40,
        filter: 'blur(10px)',
      }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      });

      gsap.fromTo('.cta-subtitle', {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          once: true,
        },
        delay: 0.2,
      });

      // ─── TAGS & ACTIONS ───
      gsap.fromTo('.cta-spec-builder, .cta-actions', {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          once: true,
        },
        delay: 0.4,
      });

      // ─── ENERGY RINGS: Pulsing from CTA button ───
      gsap.to('.cta-energy-ring', {
        scale: 2.8,
        opacity: 0,
        duration: 2.5,
        ease: 'power2.out',
        repeat: -1,
        stagger: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 55%',
          toggleActions: 'play pause resume pause',
        },
      });

    }, sectionRef);

    // ─── MAGNETIC BUTTON ───
    const btn = ctaBtnRef.current;
    if (btn && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const strength = 0.3;

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

  }, [selectedTags]);

  return (
    <section id="contact" ref={sectionRef} data-scene="cta" className="cta-scene-wrapper" style={{ perspective: '1200px' }}>
      {/* 3D Cyber Horizon perspective grid background */}
      <div className="cta-scenic-grid" aria-hidden="true">
        <div className="cta-grid-plane" />
        <div className="cta-singularity-portal" />
      </div>

      <div className="container cta-container">
        <div className="cta-console-panel">
          {/* HUD borders */}
          <div className="hud-corner tl" />
          <div className="hud-corner tr" />
          <div className="hud-corner bl" />
          <div className="hud-corner br" />

          {/* HUD status scanner */}
          <div className="cta-scanner-line" />
          <div className="cta-console-header-label">CONSOLE_SEQUENCE // PROJECT_IGNITION</div>

          <div className="cta-content-wrapper">
            <SplitHeading text="Let's build something great." className="cta-big-title" />
            <p className="cta-subtitle">
              Select your parameters below to initialize project ignition. No pitch decks, no BS.
            </p>

            {/* Spec Builder Tags */}
            <div className="cta-spec-builder">
              <span className="spec-label">SELECT_PARAMETERS //</span>
              <div className="spec-tags-cloud">
                {projectParameters.map((param, idx) => {
                  const isSelected = selectedTags.includes(param.label);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTag(param.label)}
                      className={`spec-tag-btn ${isSelected ? 'active' : ''}`}
                      style={{ '--tag-color': param.color }}
                    >
                      <span className="tag-dot" />
                      {param.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy rings */}
            <div className="cta-energy-rings" aria-hidden="true">
              <div className="cta-energy-ring" />
              <div className="cta-energy-ring" />
              <div className="cta-energy-ring" />
            </div>

            {/* CTA actions console */}
            <div className="cta-actions">
              <a 
                ref={ctaBtnRef} 
                href={getMailtoLink()} 
                className="btn-primary btn-large magnetic"
              >
                Ignite Project
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '8px' }}>
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="btn-outline magnetic">Synchronize Calendar</a>
            </div>

            {/* Console Status Badges */}
            <div className="cta-trust">
              <span>[ STATUS: FREE_CONSULT ]</span>
              <span className="cta-trust-dot"></span>
              <span>[ LATENCY: 48HR_RESPONSE ]</span>
              <span className="cta-trust-dot"></span>
              <span>[ TARGET: NO_COMMITMENT ]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
