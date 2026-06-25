import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Discovery',
    phase: 'Phase 01',
    metric: '1-2 Weeks',
    metricLabel: 'Duration',
    desc: 'We study your business, competitors, audience, and current problems.',
    color: 'var(--accent-ember)',
    blueprint: (
      <svg className="blueprint-svg" viewBox="0 0 160 160" fill="none">
        {/* Radar scope */}
        <circle cx="80" cy="80" r="70" stroke="rgba(249, 87, 56, 0.15)" strokeWidth="1" />
        <circle cx="80" cy="80" r="45" stroke="rgba(249, 87, 56, 0.1)" strokeWidth="1" />
        <circle cx="80" cy="80" r="20" stroke="rgba(249, 87, 56, 0.1)" strokeWidth="1" />
        
        {/* Crosshair lines */}
        <line x1="80" y1="5" x2="80" y2="155" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="5" y1="80" x2="155" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Rotating radar sweep */}
        <line x1="80" y1="80" x2="130" y2="40" stroke="var(--accent-ember)" strokeWidth="2" className="radar-sweep-hand" />
        <path d="M80,80 L130,40 A70,70 0 0,0 80,10 Z" fill="rgba(249, 87, 56, 0.05)" className="radar-sweep-shadow" />

        {/* Pulsing targets */}
        <circle cx="50" cy="60" r="3" fill="var(--accent-ember)" className="radar-target-1" />
        <circle cx="110" cy="110" r="3" fill="var(--accent-ember)" className="radar-target-2" />
        <circle cx="95" cy="50" r="2.5" fill="var(--accent-ember)" className="radar-target-3" />
      </svg>
    )
  },
  {
    num: '02',
    title: 'Strategy',
    phase: 'Phase 02',
    metric: '2 Weeks',
    metricLabel: 'Duration',
    desc: 'We define the structure, messaging, and conversion path.',
    color: 'var(--accent-amber)',
    blueprint: (
      <svg className="blueprint-svg" viewBox="0 0 160 160" fill="none">
        {/* Node connectors */}
        <path d="M80,25 V60 M80,60 H40 V105 M80,60 H120 V105" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <path d="M40,105 H20 V135 M40,105 H60 V135" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M120,105 H100 V135 M120,105 H140 V135" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Core database Node */}
        <rect x="65" y="15" width="30" height="20" rx="4" fill="var(--bg-primary)" stroke="var(--accent-amber)" strokeWidth="1.5" />
        <circle cx="80" cy="25" r="2" fill="var(--accent-amber)" />

        {/* Strategy Nodes */}
        <circle cx="80" cy="60" r="5" fill="var(--accent-amber)" className="strat-node-pulse" />
        <circle cx="40" cy="105" r="4.5" fill="var(--bg-primary)" stroke="var(--accent-amber)" strokeWidth="1.5" />
        <circle cx="120" cy="105" r="4.5" fill="var(--bg-primary)" stroke="var(--accent-amber)" strokeWidth="1.5" />

        {/* Leaf Nodes */}
        <circle cx="20" cy="135" r="3" fill="var(--accent-amber)" />
        <circle cx="60" cy="135" r="3" fill="var(--accent-amber)" />
        <circle cx="100" cy="135" r="3" fill="var(--accent-amber)" />
        <circle cx="140" cy="135" r="3" fill="var(--accent-amber)" />

        {/* Flowing energy packet */}
        <circle cx="80" cy="25" r="3" fill="var(--accent-amber)" className="strat-pulse-packet-1" />
        <circle cx="80" cy="25" r="3" fill="var(--accent-amber)" className="strat-pulse-packet-2" />
      </svg>
    )
  },
  {
    num: '03',
    title: 'Design',
    phase: 'Phase 03',
    metric: '3-4 Weeks',
    metricLabel: 'Duration',
    desc: 'We create the visual system, layout, and interaction style.',
    color: 'var(--accent-lacquer)',
    blueprint: (
      <svg className="blueprint-svg" viewBox="0 0 160 160" fill="none">
        {/* Layout grid overlay */}
        <rect x="20" y="20" width="120" height="120" rx="8" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="20" y1="50" x2="140" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="20" y1="110" x2="140" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="50" y1="20" x2="50" y2="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="110" y1="20" x2="110" y2="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Active translating design wireframes */}
        <rect x="25" y="25" width="20" height="20" rx="3" fill="rgba(174, 32, 18, 0.1)" stroke="var(--accent-lacquer)" strokeWidth="1.5" className="ds-box-1" />
        <rect x="55" y="55" width="50" height="50" rx="4" fill="rgba(174, 32, 18, 0.1)" stroke="var(--accent-lacquer)" strokeWidth="1.5" className="ds-box-2" />
        <circle cx="125" cy="125" r="10" fill="rgba(174, 32, 18, 0.1)" stroke="var(--accent-lacquer)" strokeWidth="1.5" className="ds-circle-1" />

        {/* Focus cursor marker */}
        <path d="M90,75 L80,95 L88,96 L91,105 L96,104 L93,95 L101,94 Z" fill="var(--accent-lacquer)" className="ds-cursor" />
      </svg>
    )
  },
  {
    num: '04',
    title: 'Build',
    phase: 'Phase 04',
    metric: '6-8 Weeks',
    metricLabel: 'Duration',
    desc: 'We develop the site for speed, responsiveness, and scale.',
    color: 'var(--accent-gold)',
    blueprint: (
      <svg className="blueprint-svg" viewBox="0 0 160 160" fill="none">
        {/* Code tabs HUD */}
        <rect x="15" y="25" width="130" height="110" rx="8" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="rgba(0,0,0,0.2)" />
        <line x1="15" y1="45" x2="145" y2="45" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="27" cy="35" r="2.5" fill="#f95738" />
        <circle cx="37" cy="35" r="2.5" fill="#ee9b00" />
        <circle cx="47" cy="35" r="2.5" fill="#e9d8a6" />

        {/* Code metrics bars */}
        <line x1="25" y1="60" x2="65" y2="60" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" className="code-ln-1" />
        <line x1="25" y1="72" x2="95" y2="72" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="code-ln-2" />
        <line x1="25" y1="84" x2="55" y2="84" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" className="code-ln-3" />
        <line x1="25" y1="96" x2="115" y2="96" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="code-ln-4" />
        <line x1="25" y1="108" x2="45" y2="108" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" className="code-ln-5" />

        {/* Code brackets indicator */}
        <path d="M120,60 L130,75 L120,90" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" className="code-bracket-r" />
      </svg>
    )
  },
  {
    num: '05',
    title: 'Launch',
    phase: 'Phase 05',
    metric: 'Continuous',
    metricLabel: 'Support',
    desc: 'We test, deploy, and support the handoff.',
    color: 'var(--accent-bright)',
    blueprint: (
      <svg className="blueprint-svg" viewBox="0 0 160 160" fill="none">
        {/* Launcher launch ring */}
        <circle cx="80" cy="115" r="15" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" />
        
        {/* Launch chevrons */}
        <path d="M80,30 L60,65 H72 V95 H88 V65 H100 Z" fill="rgba(255,209,102,0.15)" stroke="var(--accent-bright)" strokeWidth="2" strokeLinejoin="round" className="launch-projectile" />
        
        {/* Propulsion ripples */}
        <circle cx="80" cy="115" r="22" stroke="var(--accent-bright)" strokeWidth="1" strokeDasharray="3 3" className="propulsion-wave-1" />
        <circle cx="80" cy="115" r="38" stroke="var(--accent-bright)" strokeWidth="1" strokeDasharray="5 5" className="propulsion-wave-2" />
      </svg>
    )
  }
];

export default function Process() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [rotation, setRotation] = useState(0);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || isLite) return;

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const engine = engineRef.current;

      // Orchestrate ScrollTrigger to pin the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=380%',
          pin: true,
          scrub: 1.2,
          onUpdate: (self) => {
            if (!self || typeof self.progress !== 'number' || isNaN(self.progress)) return;
            const progress = self.progress;
            // Calculate active step index based on progress (0 to 1)
            const stepIndex = Math.max(0, Math.min(steps.length - 1, Math.floor(progress * steps.length)));
            setActiveStep(stepIndex);
            
            // Animate the rotation angle tracker state (for counter rotations)
            setRotation(progress * 288);
          }
        }
      });

      // Rotate the parent mech engine track
      tl.to(engine, {
        rotateZ: 288,
        ease: 'none'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Mobile-specific scroll tracking for process steps
  useEffect(() => {
    if (!isLite) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.pr-hud-card');
      cards.forEach((card, idx) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (self.isActive) {
              setActiveStep(idx);
            }
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);


  return (
    <div ref={containerRef} className="process-pin-wrapper">
      <section id="process" data-scene="process" className="pr-section">
        <div className="section-glow-line" aria-hidden="true" />

        <div className="container pr-container">
          {/* Header */}
          <div className="process-header">
            <SplitHeading text="How We Work" className="process-big-title" />
            <p className="process-subtitle">
              Simple process. Clear milestones. No agency theater.
            </p>
          </div>

          <div className="process-grid">
            {/* Left Column: 3D Mechanical Process Ring Visualizer */}
            <div className="process-engine-col">
              <div className="engine-viewport-frame" style={{ '--active-theme-color': steps[activeStep].color }}>
                {/* HUD borders */}
                <div className="hud-corner tl"></div>
                <div className="hud-corner tr"></div>
                <div className="hud-corner bl"></div>
                <div className="hud-corner br"></div>

                {/* Cyber HUD visual scan indicators */}
                <div className="engine-scanner-overlay" />


                <div className="engine-3d-scene">
                  {/* Central Holographic Lens Projector */}
                  <div className="holographic-lens">
                    <div className="holo-schematic-beam" />
                    {steps[activeStep].blueprint}
                  </div>

                  {/* 3D Orbit Mechanical Ring */}
                  <div ref={engineRef} className="process-engine-track">
                    <div className="track-rim" />
                    <div className="track-rim-inner" />
                    
                    {/* 5 Orbital nodes */}
                    {steps.map((s, idx) => {
                      const isNodeActive = activeStep === idx;
                      const nodeAngle = idx * 72; // 360 / 5
                      
                      return (
                        <div 
                          key={idx}
                          className={`engine-node ${isNodeActive ? 'active' : ''}`}
                          style={{
                            '--node-theme-color': s.color,
                            transform: `rotate(${nodeAngle}deg) translate(130px) rotate(-${nodeAngle + rotation}deg)`
                          }}
                        >
                          <span className="node-num">{s.num}</span>
                          <div className="node-glow-ring" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: HUD Scroll Cards */}
            <div className="process-cards-col">
              <div className="cards-viewport-frame" style={{ '--active-theme-color': steps[activeStep].color }}>
                {/* HUD borders */}
                <div className="hud-corner tl"></div>
                <div className="hud-corner tr"></div>
                <div className="hud-corner bl"></div>
                <div className="hud-corner br"></div>

                {/* Cyber HUD visual scan indicators */}
                <div className="engine-scanner-overlay" />


                <div className="pr-scroll-cards">
                  {steps.map((step, i) => {
                    const isCardActive = activeStep === i;
                    
                    return (
                      <div 
                        key={i} 
                        className={`pr-hud-card ${isCardActive ? 'active' : ''}`}
                        style={{ '--step-color': step.color }}
                      >
                        <div className="card-hud-label">{step.phase}</div>
                        
                        <div className="pr-card-header">
                          <span className="pr-card-num">{step.num}</span>
                          <h3 className="pr-card-title">{step.title}</h3>
                        </div>

                        <p className="pr-card-desc">{step.desc}</p>

                        <div className="pr-card-footer">
                          <div className="pr-footer-metric">
                            <span className="metric-label">{step.metricLabel}</span>
                            <span className="metric-val">{step.metric}</span>
                          </div>
                        </div>

                        <div className="pr-card-glow" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
