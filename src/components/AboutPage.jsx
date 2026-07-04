import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function AboutPage({ onViewChange }) {
  const containerRef = useRef(null);
  const eyeFrameRef = useRef(null);
  
  // Interactive Gaze Landing Page Simulator State
  const [activeElement, setActiveElement] = useState('headline'); // 'headline', 'cta', 'badges', 'integrations'
  
  const elementMetrics = {
    headline: {
      title: "01 / Editorial Typography",
      delay: "50ms (Retinal Detection)",
      trigger: "Instant Authority",
      description: "Sophisticated typography (Cormorant & Satoshi) structured with absolute spatial balance. The eye instantly reads credibility. Good typography isn't just readable; it signals prestige.",
      impact: "+40% Visitor Stay Duration"
    },
    cta: {
      title: "02 / Glowing Call to Action",
      delay: "150ms (Action Recognition)",
      trigger: "Eliminated Friction",
      description: "Our glowing champagne CTA buttons stand out from the canvas. By offering a '100% Free Custom Homepage Demo', we remove the psychological barrier of upfront payments. Trust is earned before capital is exchanged.",
      impact: "3.4x Booking Click-Throughs"
    },
    badges: {
      title: "03 / Trust Signals & SEO Vitals",
      delay: "300ms (Cognitive Evaluation)",
      trigger: "Proof of Performance",
      description: "Subtle numeric markers and live speed metrics. When user eyes scan the speed metrics showing sub-500ms TTFB and 100% Core Web Vitals, cognitive friction drops to zero. Technical execution builds financial confidence.",
      impact: "-28% Bounce Rate Reduction"
    },
    integrations: {
      title: "04 / AI & Automation Indicators",
      delay: "450ms (Value Realization)",
      trigger: "Operational Efficiency",
      description: "Highlighting custom LLM connectors, autonomous agents, and systems integrations. Visual indicators show how the front-end hooks directly into back-end intelligence (Make, Zapier, and custom GPT models) to automate human tasks.",
      impact: "Hundreds of Hours Saved"
    }
  };

  // ─── ENTRANCE ANIMATIONS ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main text fades
      gsap.fromTo('.ab-eyebrow', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      gsap.fromTo('.ab-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
      gsap.fromTo('.ab-lead', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      
      // Eye artwork frame fade & breathing tilt
      gsap.fromTo('.ab-eye-frame', { opacity: 0, scale: 0.95, filter: 'blur(10px)' }, {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.2, ease: 'power2.out', delay: 0.3
      });

      // Manifesto items stagger
      gsap.fromTo('.manifesto-item', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, stagger: 0.12,
        duration: 0.8, ease: 'power3.out', delay: 0.4
      });

      // Interactive section fade-in
      gsap.fromTo('.about-interactive-panel', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.6
      });
    }, containerRef);

    // Eye artwork breathing float
    if (!isLite) {
      gsap.to('.ab-eye-image', {
        y: -8,
        rotate: 0.4,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }

    return () => ctx.revert();
  }, []);

  // 3D Parallax Tilt for Eye Artwork
  const handleEyeParallax = (e) => {
    if (isLite) return;
    const frame = eyeFrameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to('.ab-eye-image', {
      rotateX: -y * 12,
      rotateY: x * 12,
      x: x * 6,
      y: y * 6,
      duration: 0.4,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  };

  const handleEyeMouseLeave = () => {
    if (isLite) return;
    gsap.to('.ab-eye-image', {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  return (
    <div ref={containerRef} className="about-page-wrapper">
      <div className="section-glow-line" aria-hidden="true" />
      <div className="about-bg-glow" />

      <div className="container about-container">
        {/* Poetic Intro Block */}
        <header className="about-header">
          <div className="about-grid-top">
            {/* Left Column: Visual focal point of the Eye */}
            <div 
              ref={eyeFrameRef}
              className="ab-eye-frame"
              onMouseMove={handleEyeParallax}
              onMouseLeave={handleEyeMouseLeave}
            >
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="ab-eye-artwork-wrap">
                <img 
                  src="/assets/gaze_eye_artwork.png" 
                  alt="Human Gaze Resonance Artwork" 
                  className="ab-eye-image"
                  draggable="false"
                />
              </div>
              <div className="ab-eye-label">[ THE DESIGN APERTURE ]</div>
            </div>

            {/* Right Column: High-Impact Perception Philosophy */}
            <div className="ab-hero-text">
              <span className="ab-eyebrow eyebrow">THE PSYCHOLOGY OF GAZE</span>
              <h1 className="ab-title display-sm">Custom websites designed for the human eye.</h1>
              <p className="ab-lead body-lg">
                We do not build generic templates. We design and code premium web platforms, custom AI systems, and search architectures mapped directly to human visual attention and cognitive trust.
              </p>
              <p className="ab-text body-md">
                Every visitor to your site forms a subconscious buying judgment in under 50 milliseconds. We combine elite software engineering, high-fidelity dark aesthetics, and conversions psychology to command authority, lower cognitive friction, and turn passive traffic into loyal paying customers.
              </p>
            </div>
          </div>
        </header>

        {/* Cognitive Manifesto Pillars */}
        <section className="about-manifesto-section">
          <div className="about-section-header">
            <span className="eyebrow">THE ODDWEBS DIFFERENCE</span>
            <h2 className="heading-md">How We Sell & Deliver Value</h2>
          </div>

          <div className="manifesto-grid">
            {/* Pillar 1 */}
            <div className="manifesto-item">
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="manifesto-inner">
                <span className="manifesto-num">01 // 100% FREE LIVE DEMO</span>
                <h3 className="manifesto-label">Zero Upfront Risk</h3>
                <p className="manifesto-desc body-sm">
                  We build your custom-designed homepage preview for free before you sign anything or pay a single cent. You see the exact, premium design tailored to your brand, removing all contract anxiety.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="manifesto-item">
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="manifesto-inner">
                <span className="manifesto-num">02 // NO MONTHLY RETAINER CHAINS</span>
                <h3 className="manifesto-label">Flat-Rate Engineering</h3>
                <p className="manifesto-desc body-sm">
                  We charge flat-rate services starting at $499. No rigid lock-in contracts. You have full ownership of your code with the freedom to buy out your build or let us manage it at an affordable scale.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="manifesto-item">
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="manifesto-inner">
                <span className="manifesto-num">03 // RAPID 3-TO-7 DAY DELIVERY</span>
                <h3 className="manifesto-label">Pure Speed & Execution</h3>
                <p className="manifesto-desc body-sm">
                  Say goodbye to bloated 8-week corporate timelines. We ship fully functional, blazing-fast React and Next.js builds integrated with Zapier/Make AI automations in less than a week.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Gaze Attention Simulator Panel */}
        <section className="about-interactive-section">
          <div className="about-section-header">
            <span className="eyebrow">CONVERSION ANALYSIS</span>
            <h2 className="heading-md">The Retinal Mapping Simulator</h2>
            <p className="body-md" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0' }}>
              Explore how we design key interfaces to guide visual attention and optimize user action. Hover over the mockup blocks on the left to review the technical details.
            </p>
          </div>

          <div className="about-interactive-panel">
            <div className="hud-brackets" aria-hidden="true">
              <div className="hud-corner-r tl" />
              <div className="hud-corner-r tr" />
              <div className="hud-corner-r bl" />
              <div className="hud-corner-r br" />
            </div>

            <div className="simulator-grid">
              {/* Left Column: Mock Website Visual Interactive Canvas */}
              <div className="simulator-stage-wrap">
                <div className="mock-site-hud-canvas">
                  
                  {/* Mock Site Header */}
                  <div className="mock-site-header">
                    <div className="mock-logo">OW</div>
                    <div className="mock-nav-links">
                      <div className="mock-dot" />
                      <div className="mock-dot" />
                      <div className="mock-dot" />
                    </div>
                  </div>

                  {/* Mock Site Content Layout */}
                  <div className="mock-site-main">
                    {/* Focus Block: Headline */}
                    <div 
                      className={`mock-focus-block block-headline ${activeElement === 'headline' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveElement('headline')}
                    >
                      <div className="scan-line-overlay" />
                      <div className="block-label">01 // EDITORIAL HEADLINE</div>
                      <div className="mock-text-line large" />
                      <div className="mock-text-line large half" />
                    </div>

                    {/* Focus Block: Badges/Trust */}
                    <div 
                      className={`mock-focus-block block-badges ${activeElement === 'badges' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveElement('badges')}
                    >
                      <div className="scan-line-overlay" />
                      <div className="block-label">03 // SPEED & TRUST Vitals</div>
                      <div className="mock-badge-row">
                        <div className="mock-mini-badge">FCP: 0.3s</div>
                        <div className="mock-mini-badge">TTFB: 80ms</div>
                        <div className="mock-mini-badge">SEO: 100%</div>
                      </div>
                    </div>

                    {/* Focus Block: Call To Action */}
                    <div 
                      className={`mock-focus-block block-cta ${activeElement === 'cta' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveElement('cta')}
                    >
                      <div className="scan-line-overlay" />
                      <div className="block-label">02 // CHAMPAGNE CTA BUTTON</div>
                      <div className="mock-cta-button">Claim Free Homepage Demo ↗</div>
                    </div>

                    {/* Focus Block: Systems & Automations */}
                    <div 
                      className={`mock-focus-block block-integrations ${activeElement === 'integrations' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveElement('integrations')}
                    >
                      <div className="scan-line-overlay" />
                      <div className="block-label">04 // AI AGENT INTEGRATIONS</div>
                      <div className="mock-integration-strip">
                        <div className="mock-integration-node">GPT</div>
                        <div className="mock-integration-arrow">&rarr;</div>
                        <div className="mock-integration-node">Zapier</div>
                        <div className="mock-integration-arrow">&rarr;</div>
                        <div className="mock-integration-node">CRM</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="simulator-overlay-label">// INTERACTIVE LANDING PREVIEW (HOVER TO SCAN)</div>
              </div>

              {/* Right Column: Real-Time Cognitive Telemetry */}
              <div className="simulator-telemetry-wrap">
                <span className="eyebrow">// NEUROLOGICAL READOUT</span>
                <h3 className="sim-title">{elementMetrics[activeElement].title}</h3>
                
                <div className="telemetry-hud-rows">
                  <div className="hud-row">
                    <span className="hud-lbl">SCANNED DELAY</span>
                    <span className="hud-val text-accent">{elementMetrics[activeElement].delay}</span>
                  </div>
                  <div className="hud-row">
                    <span className="hud-lbl">COGNITIVE TRIGGER</span>
                    <span className="hud-val">{elementMetrics[activeElement].trigger}</span>
                  </div>
                  <div className="hud-row text-highlight">
                    <span className="hud-lbl" style={{ color: 'var(--accent-ember)' }}>MEASURED IMPACT</span>
                    <span className="hud-val" style={{ color: 'var(--accent-ember)', fontWeight: 'bold' }}>{elementMetrics[activeElement].impact}</span>
                  </div>
                </div>

                <p className="sim-desc body-sm" style={{ minHeight: '90px', marginTop: '20px' }}>
                  {elementMetrics[activeElement].description}
                </p>

                <div className="sim-footer-note">
                  * Cognitive scan maps how layout hierarchy, fonts, and speed elements eliminate bounce rates and drive commercial trust.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Poetic Closing & Action Section */}
        <section className="about-footer-cta">
          <div className="about-cta-card">
            <h2 className="heading-md about-cta-heading">Get your homepage built for free.</h2>
            <p className="body-md about-cta-sub">
              Experience the psychological difference. We will design and build a custom landing page for your brand completely free. No deposit, no commitments.
            </p>
            <div className="about-cta-actions">
              <button 
                onClick={() => onViewChange('demo')}
                className="btn-primary"
              >
                CLAIM FREE HOMEPAGE DEMO <span className="btn-arrow">↗</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
