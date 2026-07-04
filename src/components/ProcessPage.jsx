import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

export default function ProcessPage({ onViewChange }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const progressLineRef = useRef(null);

  // Roadmap Simulator State (Dentist Case Study)
  const [activeMonth, setActiveMonth] = useState(1);
  const [showDemoForecast, setShowDemoForecast] = useState(false);

  const monthsData = {
    1: {
      title: "Month 1: Google Business & Local Maps Alignment",
      expected: "+15% to +25% Local Search Visibility",
      actions: ["Claim emergency dentist local keywords", "Inject citation schema", "Clean up NAP consistency across directories"],
      vitals: "Local Search Rank: #14 → #3",
      altitudLabel: "Alt: 5,000 ft (Low-altitude clearance)"
    },
    2: {
      title: "Month 2: High-Fidelity Website Launch",
      expected: "+20% to +35% Booking Conversion Rate",
      actions: ["Replace bloated template with custom React build", "Integrate rapid-response booking slots", "Introduce 500ms server response times"],
      vitals: "Bounce Rate: 65% → 22%",
      altitudLabel: "Alt: 12,000 ft (Entering the troposphere)"
    },
    3: {
      title: "Month 3: Emergency Search SEO Strategy",
      expected: "+30% to +60% High-Intent Organic Traffic",
      actions: ["Rank for 'chipped tooth emergency near me'", "Launch automated content cluster hubs", "Fine-tune speed scores for search crawl budgets"],
      vitals: "Monthly Traffic: 250 visits → 1,400 visits",
      altitudLabel: "Alt: 24,000 ft (Stratospheric ascent)"
    },
    4: {
      title: "Month 4: Autonomous AI Appointment Engine",
      expected: "40% Receptionist Workload Relief",
      actions: ["Deploy 24/7 web scheduling conversational assistant", "Connect instant slots sync with internal calendar database", "Automate text cancellations and rescheduling"],
      vitals: "Missed Calls Saved: 140/mo → 0/mo",
      altitudLabel: "Alt: 40,000 ft (Cruising altitude)"
    },
    5: {
      title: "Month 5: WhatsApp & SMS CRM Integrations",
      expected: "+25% Patient Lifetime Retention Rate",
      actions: ["Auto-trigger appointment warnings and follow-ups", "Launch post-treatment hygiene check campaigns", "Deploy automatic review links post-appointment"],
      vitals: "Review Generation: +45 positive ratings/mo",
      altitudLabel: "Alt: 60,000 ft (Mesosphere boundary)"
    },
    6: {
      title: "Month 6: High-Margin E-Commerce Subscriptions",
      expected: "New Recurring Revenue Streams ($3k - $8k/mo)",
      actions: ["Launch client portal for oral hygiene subscription packs", "Integrate automated billing checkouts for teeth whitening kits", "Affiliate program loops for custom retainers"],
      vitals: "Non-clinical sales: $0/mo → $5,200/mo",
      altitudLabel: "Alt: 100,000 ft (Escape velocity)"
    }
  };

  // ─── ENTRANCE & TIMELINE SCROLL TRIGGER ANIMATIONS ───
  useEffect(() => {
    // Nav floating indicator setup
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.add('nav-floating');

    const ctx = gsap.context(() => {
      // Main headers reveal
      gsap.fromTo('.pr-eyebrow', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      gsap.fromTo('.pr-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
      gsap.fromTo('.pr-lead', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });

      // Opportunity Simulator fade-in
      gsap.fromTo('.pr-simulator-section', { opacity: 0, y: 35 }, {
        opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.4
      });

      if (!isLite) {
        // Alternating timeline phases parallax emergence
        gsap.utils.toArray('.timeline-phase-block').forEach((block) => {
          gsap.fromTo(block.querySelector('.phase-card-wrapper'), 
            { opacity: 0, y: 60, scale: 0.98 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: block,
                start: 'top 85%',
                once: true
              }
            }
          );
        });

        // Vertical scroll progress line filling
        gsap.fromTo(progressLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 20%',
              end: 'bottom 80%',
              scrub: true
            }
          }
        );
      } else {
        // Fallback for lite/mobile devices
        gsap.set('.timeline-phase-block, .phase-card-wrapper', { opacity: 1, y: 0, scale: 1 });
      }
    }, containerRef);

    return () => {
      if (nav) nav.classList.remove('nav-floating');
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="process-page-wrapper">
      {/* Celestial Background Overlays */}
      <div className="celestial-fog-1" aria-hidden="true" />
      <div className="celestial-fog-2" aria-hidden="true" />
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container process-container">
        {/* Sky-level Header Segment */}
        <header className="process-header">
          <span className="pr-eyebrow eyebrow">THE ODDWEBS GROWTH SYSTEM</span>
          <h1 className="pr-title display-sm">Most agencies build websites.<br />We launch digital operating engines.</h1>
          
          <div className="pr-hero-quote-box">
            <div className="hud-brackets" aria-hidden="true">
              <div className="hud-corner-r tl" />
              <div className="hud-corner-r tr" />
              <div className="hud-corner-r bl" />
              <div className="hud-corner-r br" />
            </div>
            <p className="pr-lead body-lg">
              &ldquo;Most agencies ask what website you want. We ask what business you&apos;re trying to build. Before we design anything, we map a growth trajectory showing where your clients drift away, where new conversions hide, and how automated CRM pipelines will cut operational costs. Your website is just one component—we build the entire launchpad around your brand.&rdquo;
            </p>
          </div>
        </header>

        {/* Phase 01 & 02: Opportunity Maps & Case Simulator (Dentist) */}
        <section className="pr-simulator-section">
          <div className="pr-section-header">
            <span className="eyebrow">PHASE 01 // AUDITING THE CANOPY</span>
            <h2 className="heading-md">Business Discovery & Growth Roadmap</h2>
            <p className="body-md text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Before drafting code, we execute a **Stratospheric Audit** of your competitors, SEO positions, loading speeds, and CRM leaks to build your custom Roadmap.
            </p>
          </div>

          <div className="about-interactive-panel pr-sim-panel">
            <div className="hud-brackets" aria-hidden="true">
              <div className="hud-corner-r tl" />
              <div className="hud-corner-r tr" />
              <div className="hud-corner-r bl" />
              <div className="hud-corner-r br" />
            </div>

            <div className="pr-sim-layout">
              {/* Left Side: Interactive Roadmap Steps */}
              <div className="pr-sim-timeline-control">
                <span className="eyebrow">// STRATOSPHERIC FLIGHT MAP (CLICK MONTHS)</span>
                <div className="pr-sim-month-buttons">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        setActiveMonth(num);
                        setShowDemoForecast(true);
                      }}
                      className={`pr-sim-btn ${activeMonth === num ? 'active' : ''}`}
                    >
                      MONTH 0{num}
                    </button>
                  ))}
                </div>

                <div className="pr-sim-card">
                  <div className="pr-card-header">
                    <span className="pr-card-altitude">{monthsData[activeMonth].altitudLabel}</span>
                    <h3 className="pr-card-title">{monthsData[activeMonth].title}</h3>
                  </div>
                  <div className="pr-card-body">
                    <div className="pr-card-row">
                      <span className="row-label">EXPECTED OPPORTUNITY</span>
                      <span className="row-value highlight-gold">{monthsData[activeMonth].expected}</span>
                    </div>
                    <div className="pr-card-row">
                      <span className="row-label">ENGINEERING OPERATIONS</span>
                      <ul className="row-list">
                        {monthsData[activeMonth].actions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pr-card-row">
                      <span className="row-label">MEASURED METRICS</span>
                      <span className="row-value">{monthsData[activeMonth].vitals}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Growth Forecast Visualizer Chart */}
              <div className="pr-sim-chart-wrap">
                <span className="eyebrow">// OPPORTUNITY GRAPH (DENTIST AUDIT DEMO)</span>
                <h4 className="chart-heading">6-Month Revenue & Booking Projection</h4>

                {/* SVG Line Graph showing growth projection */}
                <div className="svg-chart-container">
                  <svg viewBox="0 0 400 200" className="pr-svg-graph">
                    {/* Gridlines */}
                    <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="40" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="40" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    
                    {/* Monthly Vertical Indicators */}
                    {[1, 2, 3, 4, 5, 6].map((num, i) => {
                      const cx = 40 + i * 64;
                      return (
                        <line
                          key={num}
                          x1={cx}
                          y1="20"
                          x2={cx}
                          y2="170"
                          stroke={activeMonth === num ? "rgba(199, 154, 75, 0.2)" : "rgba(255,255,255,0.02)"}
                          strokeWidth={activeMonth === num ? "1.5" : "1"}
                          strokeDasharray="3,3"
                        />
                      );
                    })}

                    {/* Chart Line Path */}
                    <path
                      d="M 40 160 Q 104 140 168 100 T 296 60 T 360 30"
                      fill="none"
                      stroke="url(#graph-grad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Glowing dots at month centers */}
                    {[
                      { m: 1, x: 40, y: 160 },
                      { m: 2, x: 104, y: 138 },
                      { m: 3, x: 168, y: 100 },
                      { m: 4, x: 232, y: 80 },
                      { m: 5, x: 296, y: 60 },
                      { m: 6, x: 360, y: 30 }
                    ].map((dot) => (
                      <circle
                        key={dot.m}
                        cx={dot.x}
                        cy={dot.y}
                        r={activeMonth === dot.m ? "6" : "3.5"}
                        className={`chart-dot ${activeMonth === dot.m ? 'active' : ''}`}
                        onClick={() => setActiveMonth(dot.m)}
                      />
                    ))}

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="graph-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--accent-ember)" />
                        <stop offset="50%" stopColor="var(--accent-amber)" />
                        <stop offset="100%" stopColor="var(--accent-gold)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="chart-axes-labels">
                    <span>Month 1</span>
                    <span>Month 2</span>
                    <span>Month 3</span>
                    <span>Month 4</span>
                    <span>Month 5</span>
                    <span>Month 6</span>
                  </div>
                </div>

                {/* Growth Forecast ROI indicators */}
                <div className="chart-metrics-legend">
                  <div className="legend-indicator">
                    <span className="legend-lbl">ORGANIC REACH</span>
                    <span className="legend-val">+140%</span>
                  </div>
                  <div className="legend-indicator">
                    <span className="legend-lbl">BOOKINGS (ROI TIMELINE)</span>
                    <span className="legend-val highlight-gold">2.4 Months</span>
                  </div>
                  <div className="legend-indicator">
                    <span className="legend-lbl">EST. NEW ANNUAL VALUE</span>
                    <span className="legend-val">+$84,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Phase Flight Roadmap Timeline */}
        <section className="pr-timeline-section">
          <div className="pr-section-header">
            <span className="eyebrow">THE ROADMAP</span>
            <h2 className="heading-md">The 12-Phase Execution Cycle</h2>
            <p className="body-md text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              We map your operational scope into twelve clear orbital coordinates, keeping the mission transparent from discovery to interstellar scale.
            </p>
          </div>

          <div className="pr-timeline-outer" ref={timelineRef}>
            {/* Scroll Progress Line Indicator */}
            <div className="pr-timeline-line-bg" />
            <div className="pr-timeline-line-active" ref={progressLineRef} />

            {/* Alternating Phases */}
            <div className="timeline-phases-list">
              
              {/* Phase 01 */}
              <div className="timeline-phase-block left">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">01</span>
                  <h3 className="phase-title">Stratospheric Audit</h3>
                  <p className="phase-quote">&ldquo;Where is your business leaking cash right now? We audit website speed, branding structures, and customer funnels.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Core Web Vitals speed check</li>
                      <li>✓ Complete SEO & Search Position audit</li>
                      <li>✓ Lead-gen funnel leakage inspection</li>
                      <li>✓ Competitor visual positioning report</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 2–3 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 02 */}
              <div className="timeline-phase-block right">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">02</span>
                  <h3 className="phase-title">Growth Roadmap</h3>
                  <p className="phase-quote">&ldquo;We map every revenue and automation opportunity before writing a single line of software.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Priority Action matrix</li>
                      <li>✓ Month-by-month Opportunity mapping</li>
                      <li>✓ Revenue growth estimates</li>
                      <li>✓ AI Automation blueprint</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 3–5 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 03 */}
              <div className="timeline-phase-block left">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">03</span>
                  <h3 className="phase-title">Proposal & Partnership</h3>
                  <p className="phase-quote">&ldquo;Scope of work, milestone timelines, and direct engineer pricing. Clear boundaries, zero monthly lock-ins.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Final Scope of Work document</li>
                      <li>✓ Payment milestones schema</li>
                      <li>✓ Mutual NDA and contract clearance</li>
                      <li>✓ Client Success Portal setup</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 1–2 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 04 */}
              <div className="timeline-phase-block right">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">04</span>
                  <h3 className="phase-title">Research & Strategy</h3>
                  <p className="phase-quote">&ldquo;We study competitor layouts, customer conversion psychology, and typography standards to map user flow blueprints.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Site navigation structure map</li>
                      <li>✓ Low-fidelity UX wireframe outlines</li>
                      <li>✓ Core typography, layout & color guidelines</li>
                      <li>✓ High-intent keyword search map</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 3–5 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 05 */}
              <div className="timeline-phase-block left">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">05</span>
                  <h3 className="phase-title">Design Preview</h3>
                  <p className="phase-quote">&ldquo;Interactive Figma prototypes demonstrating layout systems, mobile viewports, and motion curves. We don&apos;t code until you approve.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Clickable Figma desktop prototype</li>
                      <li>✓ Mobile responsive mock layout screens</li>
                      <li>✓ Micro-interaction direction guidelines</li>
                      <li>✓ Unlimited minor layout revisions</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 4–7 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 06 */}
              <div className="timeline-phase-block right">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">06</span>
                  <h3 className="phase-title">Development</h3>
                  <p className="phase-quote">&ldquo;Our engineers build custom React frontend layouts and integrate automated AI workflow connectors (Make, Zapier) in local environments.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Custom-coded React/Next.js frontend</li>
                      <li>✓ Semantic HTML & PostCSS layout modules</li>
                      <li>✓ Active backend hooks & API connectors</li>
                      <li>✓ Make/Zapier database triggers</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 5–10 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 07 */}
              <div className="timeline-phase-block left">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">07</span>
                  <h3 className="phase-title">Rigorous Testing</h3>
                  <p className="phase-quote">&ldquo;Stress-testing on Chrome, Safari, Firefox, Edge. We verify forms, check link integrity, and audit sub-500ms load speeds.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Cross-browser/device check logs</li>
                      <li>✓ Core Web Vitals speed check certificates</li>
                      <li>✓ Form validation & API payload test</li>
                      <li>✓ SEO schema verification</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 2–3 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 08 */}
              <div className="timeline-phase-block right">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">08</span>
                  <h3 className="phase-title">Client Review</h3>
                  <p className="phase-quote">&ldquo;A private staging preview link allows you to review the working platform, input changes, and approve the build.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Access link to private staging site</li>
                      <li>✓ Staged changes tracking log</li>
                      <li>✓ Final visual approval checklist</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 2–4 DAYS</span>
                  </div>
                </div>
              </div>

              {/* Phase 09 */}
              <div className="timeline-phase-block left">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">09</span>
                  <h3 className="phase-title">Launch</h3>
                  <p className="phase-quote">&ldquo;Zero-downtime launch. CDN provisioning, Cloudflare firewall configurations, sitemaps, and SSL verification.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Production CDN deployment (Vercel/AWS)</li>
                      <li>✓ Cloudflare proxy DNS and SSL launch</li>
                      <li>✓ Google Search Console registration</li>
                      <li>✓ Automatic daily backup configuration</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: 1 DAY</span>
                  </div>
                </div>
              </div>

              {/* Phase 10 */}
              <div className="timeline-phase-block right">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">10</span>
                  <h3 className="phase-title">Growth Sprint</h3>
                  <p className="phase-quote">&ldquo;We don&apos;t just walk away post-launch. We optimize landing page heatmaps, local SEO content, and Ads funnels.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Continuous A/B testing of layouts</li>
                      <li>✓ Local keyword authority tracking</li>
                      <li>✓ Custom Google & Meta Ads tracking</li>
                      <li>✓ Monthly performance updates</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: MONTHLY CYCLES</span>
                  </div>
                </div>
              </div>

              {/* Phase 11 */}
              <div className="timeline-phase-block left">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">11</span>
                  <h3 className="phase-title">Success Dashboard</h3>
                  <p className="phase-quote">&ldquo;One unified dashboard for website traffic, search rankings, lead submissions, and local reviews. Total transparency.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ Unified live metrics hub</li>
                      <li>✓ Lead tracking CRM integration</li>
                      <li>✓ Page Speed and Core Vitals monitoring</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: LIFETIME ACCESS</span>
                  </div>
                </div>
              </div>

              {/* Phase 12 */}
              <div className="timeline-phase-block right">
                <div className="timeline-dot-anchor" />
                <div className="phase-card-wrapper">
                  <div className="hud-brackets" aria-hidden="true">
                    <div className="hud-corner-r tl" />
                    <div className="hud-corner-r tr" />
                    <div className="hud-corner-r bl" />
                    <div className="hud-corner-r br" />
                  </div>
                  <span className="phase-num">12</span>
                  <h3 className="phase-title">Interstellar Scale</h3>
                  <p className="phase-quote">&ldquo;We scale your business operating engine: multi-location syncs, customer portals, and custom automations.&rdquo;</p>
                  <hr className="phase-divider" />
                  <div className="phase-deliverables">
                    <span className="del-lbl">DELIVERABLES</span>
                    <ul className="del-list">
                      <li>✓ ERP and custom database systems</li>
                      <li>✓ Multi-location scaling architectures</li>
                      <li>✓ Client portals and secure file drops</li>
                    </ul>
                  </div>
                  <div className="phase-footer">
                    <span className="p-foot-lbl">DURATION: LONG-TERM STRATEGY</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="about-footer-cta pr-closing-cta">
          <div className="about-cta-card">
            <h2 className="heading-md about-cta-heading">Ready to scale your business?</h2>
            <p className="body-md about-cta-sub">
              Get your custom-designed homepage preview for free, see where you are leaking customers, and let us build your digital engine.
            </p>
            <div className="about-cta-actions">
              <button 
                onClick={() => onViewChange('demo')}
                className="btn-primary"
              >
                CLAIM FREE CUSTOM HOMEPAGE PREVIEW <span className="btn-arrow">↗</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
