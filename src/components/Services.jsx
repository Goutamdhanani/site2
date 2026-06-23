import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: 'Web Development',
    desc: 'Lightning-fast, highly-optimized web applications engineered for seamless scalability, flawless SEO, and conversion-focused architectures.',
    tags: ['Next.js', 'React', 'TypeScript', 'WebGL', 'SEO'],
    color: 'var(--accent-ember)',
    tools: ['Vite', 'Node.js', 'Tailwind', 'GSAP'],
    logs: [
      'npm run build --production',
      'compiling routes (app router)...',
      'bundling chunks (64 modules)...',
      'optimized asset delivery (Brotli active)',
      'server deployed at edge in 18ms ✓'
    ]
  },
  {
    title: 'Mobile Development',
    desc: 'Bespoke iOS and Android mobile ecosystems built with native speed and fluid animations to capture and hold user attention.',
    tags: ['iOS', 'Android', 'React Native', 'Swift', 'Kotlin'],
    color: 'var(--accent-amber)',
    tools: ['SwiftUI', 'Expo', 'Redux', 'Fastlane'],
    logs: [
      'expo build:ios --profile production',
      'compiling native Swift layers...',
      'linking react-native-reanimated engine',
      'optimized assets: main.jsbundle (1.4MB)',
      'build completed successfully ✓'
    ]
  },
  {
    title: 'Brand & UI/UX',
    desc: 'Distinctive visual identities, interactive design tokens, and clean layout grids designed to elevate branding into a digital power status.',
    tags: ['Branding', 'Figma', 'Prototyping', 'Design Systems'],
    color: 'var(--accent-gold)',
    tools: ['Illustrator', 'Spline', 'After Effects', 'Tokens'],
    logs: [
      'loading design system tokens...',
      'parsing Figma styles API node-trees',
      'generating layout grid assets',
      'compiled theme: responsive variables',
      'canvas layout rendering at 120fps'
    ]
  },
  {
    title: 'CMS & Automation',
    desc: 'Tailor-made headless CMS architectures and automated webhook pipelines to streamline editing workflows and eliminate manual tasks.',
    tags: ['Shopify', 'Webflow', 'Headless CMS', 'Webhooks'],
    color: 'var(--accent-lacquer)',
    tools: ['Contentful', 'Strapi', 'Make', 'Zapier'],
    logs: [
      'initializing webhook listeners...',
      'connecting Shopify Storefront API v2',
      'linking orders -> Zapier automation',
      'syncing Headless space to edge cache',
      'webhook pipeline: listening... ✓'
    ]
  },
  {
    title: 'SEO & Performance',
    desc: 'Deep audit optimizations, lightning Core Web Vitals score tuning, and structured semantic layouts that secure top search rankings.',
    tags: ['PageSpeed', 'Lighthouse', 'Schema', 'Analytics'],
    color: 'var(--accent-bright)',
    tools: ['Search Console', 'GTmetrix', 'Vitals', 'Tag Manager'],
    logs: [
      'running Lighthouse performance audits...',
      'verifying schema.org JSON-LD microdata',
      'optimized dynamic media: WebP (-65%)',
      'Core Web Vitals check: passed ✓',
      'search index indexation synced'
    ]
  },
];

function TerminalConsole({ logs, isActive }) {
  const [displayedLogs, setDisplayedLogs] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setDisplayedLogs([]);
      return;
    }

    setDisplayedLogs([]);
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < logs.length) {
        setDisplayedLogs(prev => [...prev, logs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 280); // typewriter timing

    return () => clearInterval(interval);
  }, [isActive, logs]);

  return (
    <div className="terminal-console">
      <div className="console-header">
        <span className="console-dot red"></span>
        <span className="console-dot yellow"></span>
        <span className="console-dot green"></span>
        <span className="console-title">terminal.sh</span>
      </div>
      <div className="console-body">
        {displayedLogs.map((log, index) => (
          <div key={index} className="console-line">
            <span className="console-prompt">&gt;</span> {log}
          </div>
        ))}
        {displayedLogs.length < logs.length && (
          <span className="console-cursor">_</span>
        )}
      </div>
    </div>
  );
}

function ServiceRow({ service, index, activeService, setActiveService }) {
  const rowRef = useRef(null);
  const numRef = useRef(null);
  const isActive = activeService === index;

  useEffect(() => {
    if (prefersReducedMotion() || isLite) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rowRef.current,
        start: 'top 88%',
        onEnter: () => {
          gsap.fromTo(
            rowRef.current,
            { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0, y: 50 },
            { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0, duration: DUR.slow, ease: EASE.out }
          );

          if (numRef.current) {
            gsap.fromTo(
              { val: 0 },
              { val: index + 1 },
              {
                val: index + 1,
                duration: DUR.slow,
                ease: EASE.outExpo,
                onUpdate: function () {
                  const val = Math.ceil(this.targets()[0].val);
                  numRef.current.textContent = String(val).padStart(2, '0');
                },
              }
            );
          }
        },
      });
    }, rowRef);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={rowRef}
      className={`sv-row ${isActive ? 'sv-row--active' : ''}`}
      style={{ '--service-color': service.color }}
      onMouseEnter={() => setActiveService(index)}
    >
      <div className="sv-row-header">
        <span ref={numRef} className="sv-num">00</span>
        <h3 className="sv-title">{service.title}</h3>
        <div className="sv-row-arrow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      <div className="sv-row-body">
        <div className="sv-row-body-inner">
          <p className="sv-desc">{service.desc}</p>
          
          <div className="sv-row-details">
            <div className="sv-details-section">
              <span className="sv-details-label">Capabilities</span>
              <div className="sv-tags">
                {service.tags.map((tag, j) => (
                  <span key={j} className="sv-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="sv-details-section">
              <span className="sv-details-label">Tech Stack</span>
              <div className="sv-tools">
                {service.tools.map((tool, j) => (
                  <span key={j} className="sv-tool-chip">{tool}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Active typewriter compilation simulator */}
          <TerminalConsole logs={service.logs} isActive={isActive} />
        </div>
      </div>
      <div className="sv-row-glow-indicator" />
    </div>
  );
}

export default function Services() {
  const sectionRef = useRef(null);
  const itemsRef = useRef(null);
  const showcaseRef = useRef(null);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Scroll spy: update active index as user scrolls past rows on mobile/desktop
    const rows = gsap.utils.toArray('.sv-row');
    const triggers = [];

    rows.forEach((row, index) => {
      const trigger = ScrollTrigger.create({
        trigger: row,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) {
            setActiveService(index);
          }
        }
      });
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach(t => t.kill());
    };
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion() || !showcaseRef.current) return;
    const rect = showcaseRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    gsap.to(showcaseRef.current, {
      '--rx': y * 35, // Tilt X
      '--ry': x * -35, // Tilt Y
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion() || !showcaseRef.current) return;
    gsap.to(showcaseRef.current, {
      '--rx': 0,
      '--ry': 0,
      duration: 1.2,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  };

  return (
    <section id="services" ref={sectionRef} data-scene="services" className="sv-section">
      <div className="container sv-grid">
        {/* Left Sticky Column — Sci-fi Hologram chamber */}
        <div className="sv-sticky-wrapper">
          <div className="sv-sticky">
            <span className="sv-label eyebrow">WHAT WE DO</span>
            <SplitHeading text="Services" className="sv-heading" />
            <p className="sv-sub">
              Engineering Awwwards-grade digital interfaces designed to command market attention.
            </p>

            {/* 3D Holographic Chamber */}
            <div 
              ref={showcaseRef}
              className="hologram-chamber" 
              style={{ 
                '--active-color': services[activeService].color,
                '--rx': 0,
                '--ry': 0
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Holographic grid scan lines */}
              <div className="holo-grid-lines" />
              <div className="holo-scanner-ring ring-1" />
              <div className="holo-scanner-ring ring-2" />
              <div className="holo-laser-line" />

              {/* HUD interface borders */}
              <div className="holo-hud-corner corner-tl"></div>
              <div className="holo-hud-corner corner-tr"></div>
              <div className="holo-hud-corner corner-bl"></div>
              <div className="holo-hud-corner corner-br"></div>

              {/* Sci-fi metrics console overlay */}
              <div className="holo-hud-stats">
                <div className="hud-stat-row">
                  <span className="hud-stat-dot pulsing"></span>
                  <span className="hud-stat-label">HOLO_LINK</span>
                  <span className="hud-stat-value text-accent">SECURE</span>
                </div>
                <div className="hud-stat-row">
                  <span className="hud-stat-label">LATENCY</span>
                  <span className="hud-stat-value">12ms</span>
                </div>
                <div className="hud-stat-row">
                  <span className="hud-stat-label">NODE_INDEX</span>
                  <span className="hud-stat-value">0x{activeService}F4</span>
                </div>
              </div>

              {/* Web Dev Mockup (0) */}
              <div className={`sv-mockup sv-mockup--web ${activeService === 0 ? 'active' : ''}`}>
                <div className="web-editor-layer">
                  <div className="web-header">
                    <span className="dot dot--red"></span>
                    <span className="dot dot--yellow"></span>
                    <span className="dot dot--green"></span>
                    <span className="web-tab">index.tsx</span>
                  </div>
                  <div className="web-editor-body">
                    <div className="code-line line-1"></div>
                    <div className="code-line line-2"></div>
                    <div className="code-line line-3"></div>
                    <div className="code-line line-4"></div>
                    <div className="code-line line-5"></div>
                  </div>
                </div>

                <div className="web-wireframe-layer">
                  <div className="wf-grid-lines">
                    <div className="wf-line-h"></div>
                    <div className="wf-line-v"></div>
                  </div>
                  <div className="wf-box"></div>
                  <div className="wf-circle"></div>
                </div>

                <div className="web-dashboard-layer">
                  <div className="dash-card">
                    <div className="dash-top">
                      <span className="dash-title">PROD SERVER</span>
                      <span className="dash-status">99.9%</span>
                    </div>
                    <svg className="dash-chart" viewBox="0 0 100 30">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-ember)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--accent-ember)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,25 Q15,5 30,22 T60,8 T90,20 L100,20 L100,30 L0,30 Z" fill="url(#chartGrad)" />
                      <path d="M0,25 Q15,5 30,22 T60,8 T90,20 L100,20" fill="none" stroke="var(--accent-ember)" strokeWidth="1.5" />
                    </svg>
                    <div className="dash-vitals">
                      <span className="vital-num">18ms</span>
                      <span className="vital-label">latency</span>
                    </div>
                  </div>
                </div>
                <div className="mockup-glow" />
              </div>

              {/* Mobile Dev Mockup (1) */}
              <div className={`sv-mockup sv-mockup--mobile ${activeService === 1 ? 'active' : ''}`}>
                <div className="phone-base">
                  <div className="phone-notch"></div>
                  <div className="phone-bezel-glow"></div>
                  <div className="phone-screen-grid"></div>
                </div>

                <div className="phone-player-layer">
                  <div className="player-widget">
                    <div className="player-disc">
                      <div className="player-disc-inner"></div>
                    </div>
                    <div className="player-info">
                      <div className="player-track">Track 04.wav</div>
                      <div className="player-progress">
                        <div className="progress-bar-fill"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="phone-chart-layer">
                  <div className="chart-widget">
                    <div className="widget-header">
                      <span className="dot dot--orange"></span>
                      <span className="widget-label">Daily Installs</span>
                    </div>
                    <div className="widget-bars">
                      <div className="wbar bar-1"></div>
                      <div className="wbar bar-2"></div>
                      <div className="wbar bar-3"></div>
                      <div className="wbar bar-4"></div>
                    </div>
                  </div>
                </div>

                <div className="phone-chat-layer">
                  <div className="chat-bubble">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent-amber)" style={{ marginRight: '4px' }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>App deployed.</span>
                  </div>
                </div>

                <div className="mockup-glow" />
              </div>

              {/* Brand & UI/UX Mockup (2) */}
              <div className={`sv-mockup sv-mockup--uiux ${activeService === 2 ? 'active' : ''}`}>
                <div className="vector-grid-layer">
                  <div className="artboard-grid"></div>
                </div>

                <div className="vector-curve-layer">
                  <svg className="bezier-svg" viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="bezierGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--accent-gold)" />
                        <stop offset="100%" stopColor="var(--accent-amber)" />
                      </linearGradient>
                    </defs>
                    <line x1="20" y1="80" x2="50" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="140" y1="80" x2="110" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M20,80 C50,30 110,130 140,80" fill="none" stroke="url(#bezierGrad)" strokeWidth="2.5" />
                    <circle cx="20" cy="80" r="4.5" fill="var(--bg-primary)" stroke="var(--accent-gold)" strokeWidth="2" />
                    <circle cx="50" cy="30" r="3.5" fill="var(--accent-gold)" />
                    <circle cx="140" cy="80" r="4.5" fill="var(--bg-primary)" stroke="var(--accent-gold)" strokeWidth="2" />
                    <circle cx="110" cy="130" r="3.5" fill="var(--accent-gold)" />
                  </svg>
                </div>

                <div className="vector-chips-layer">
                  <div className="color-chip chip-1"></div>
                  <div className="color-chip chip-2"></div>
                  <div className="color-chip chip-3"></div>
                </div>

                <div className="vector-layers-layer">
                  <div className="layers-widget">
                    <div className="layer-item active-item">Path Node</div>
                    <div className="layer-item">Dot Grid</div>
                    <div className="layer-item">Artboard</div>
                  </div>
                </div>

                <div className="vector-pen-layer">
                  <svg className="pen-tool-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
                    <path d="M12 2L2 22l10-6 10 6L12 2z"/>
                  </svg>
                </div>

                <div className="mockup-glow" />
              </div>

              {/* CMS & Automation Mockup (3) */}
              <div className={`sv-mockup sv-mockup--cms ${activeService === 3 ? 'active' : ''}`}>
                <div className="database-cylinder-layer">
                  <div className="cylinder-ring ring-top"></div>
                  <div className="cylinder-ring ring-mid"></div>
                  <div className="cylinder-ring ring-bot"></div>
                </div>

                <div className="database-automation-layer">
                  <svg className="circuit-lines" viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="circuitGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--accent-lacquer)" />
                        <stop offset="100%" stopColor="var(--accent-ember)" />
                      </linearGradient>
                    </defs>
                    <path d="M80,80 H40 V45" fill="none" stroke="url(#circuitGrad)" strokeWidth="2" className="circuit-path" />
                    <path d="M80,80 H120 V50" fill="none" stroke="url(#circuitGrad)" strokeWidth="2" className="circuit-path" />
                    <path d="M80,80 V125 H115" fill="none" stroke="url(#circuitGrad)" strokeWidth="2" className="circuit-path" />
                  </svg>

                  <div className="auto-node node-shopify">S</div>
                  <div className="auto-node node-webflow">W</div>
                  <div className="auto-node node-api">API</div>
                  
                  <div className="pulse pulse-1"></div>
                  <div className="pulse pulse-2"></div>
                  <div className="pulse pulse-3"></div>
                </div>

                <div className="mockup-glow" />
              </div>

              {/* SEO & Performance Mockup (4) */}
              <div className={`sv-mockup sv-mockup--seo ${activeService === 4 ? 'active' : ''}`}>
                <div className="speed-particles-layer">
                  <div className="speed-line line-p1"></div>
                  <div className="speed-line line-p2"></div>
                  <div className="speed-line line-p3"></div>
                </div>

                <div className="speed-gauge-layer">
                  <div className="gauge-housing">
                    <svg className="gauge-svg" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-bright)" strokeWidth="6" 
                        strokeDasharray="251.2" strokeDashoffset="50.2" strokeLinecap="round" className="gauge-progress-circle" />
                    </svg>
                    <div className="gauge-indicator-needle"></div>
                    <div className="gauge-score-value">100</div>
                  </div>
                </div>

                <div className="speed-audit-layer">
                  <div className="audit-card">
                    <div className="audit-row">
                      <span className="audit-check">✓</span>
                      <span className="audit-metric">LCP</span>
                      <span className="audit-val">0.6s</span>
                    </div>
                    <div className="audit-row">
                      <span className="audit-check">✓</span>
                      <span className="audit-metric">CLS</span>
                      <span className="audit-val">0.00</span>
                    </div>
                    <div className="audit-row">
                      <span className="audit-check">✓</span>
                      <span className="audit-metric">FID</span>
                      <span className="audit-val">12ms</span>
                    </div>
                  </div>
                </div>

                <div className="mockup-glow" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Scrolling Column — Interactive Command Cards */}
        <div className="sv-items" ref={itemsRef}>
          {services.map((s, i) => (
            <ServiceRow
              key={i}
              service={s}
              index={i}
              activeService={activeService}
              setActiveService={setActiveService}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
