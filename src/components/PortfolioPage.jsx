import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

const projects = [
  {
    title: 'LunaCart',
    category: 'E-Commerce Platform',
    year: '2026',
    description: 'Luxury fashion commerce experience meticulously crafted to boost sales and conversion rates.',
    metric: '+320%',
    metricLabel: 'Revenue Growth',
    color: '#ff5c33', // Custom tailored vibrant theme color
    image: '/assets/projects/project-1.png',
    tags: ['NEXT.JS', 'STRIPE', 'AI RECOM', 'GSAP', 'UI/UX', 'SEO'],
    link: 'https://project-restro1.vercel.app/'
  },
  {
    title: 'DataFlow',
    category: 'Analytics Dashboard',
    year: '2025',
    description: 'Enterprise metrics panel redesigned for maximum clarity, low latency, and ease of use.',
    metric: '-45%',
    metricLabel: 'Churn Reduction',
    color: '#33ccff',
    image: '/assets/projects/project-2.png',
    tags: ['REACT', 'HIGHCHARTS', 'TAILWIND', 'REDUX', 'UX AUDIT'],
    link: 'https://project-restro1.vercel.app/'
  },
  {
    title: 'Payze',
    category: 'Fintech MVP',
    year: '2026',
    description: 'Highly secure fintech platform built to launch fast, convert trust, and secure seed funding.',
    metric: '$2.4M',
    metricLabel: 'Seed Funding Secured',
    color: '#33ffaa',
    image: '/assets/projects/project-3.png',
    tags: ['FINTECH', 'REACT', 'SECURITY', 'MVP', 'WEB DESIGN'],
    link: 'https://project-restro1.vercel.app/'
  },
  {
    title: 'Qitchen',
    category: 'Restaurant Experience',
    year: '2026',
    description: 'A premium Japanese restaurant reservations portal and digital brand experience.',
    metric: '4.9★',
    metricLabel: 'Customer Rating',
    color: '#ffd700',
    image: '/assets/projects/qitchen.png',
    tags: ['UX/UI', 'RESTAURANT', 'NEXT.JS', 'RESERVATIONS', 'BRANDING'],
    link: 'https://project-restro1.vercel.app/'
  },
];

export default function PortfolioPage({ onViewChange }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const activeProject = projects[activeIdx];

  // ─── 3D PERSPECTIVE PARALLAX TILT ───
  const handleMouseMove = (e) => {
    if (isLite || isAnimating) return;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // Tilt the browser mockup
    gsap.to('.pt-browser-mockup', {
      rotateX: -y * 18,
      rotateY: x * 18,
      rotateZ: x * -1.5,
      x: x * 12,
      y: y * 12,
      duration: 0.4,
      ease: 'power1.out',
      overwrite: 'auto'
    });

    // Parallax on Floating Badges (moving independently in opposite depth coordinates)
    gsap.to('.pt-float-badge-metric', {
      x: x * 32,
      y: y * 32,
      z: 50,
      rotateX: -y * 8,
      rotateY: x * 8,
      duration: 0.5,
      ease: 'power1.out',
      overwrite: 'auto'
    });

    gsap.to('.pt-float-badge-tech', {
      x: x * -24,
      y: y * -24,
      z: 40,
      rotateX: -y * 12,
      rotateY: x * 12,
      duration: 0.5,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  };

  const handleMouseLeave = () => {
    if (isLite) return;
    gsap.to(['.pt-browser-mockup', '.pt-float-badge-metric', '.pt-float-badge-tech'], {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      x: 0,
      y: 0,
      z: 0,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  // ─── NAVIGATE TO NEW PROJECT ───
  const handleProjectSelect = (idx) => {
    if (idx === activeIdx || isAnimating) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIdx(idx);
        setIsAnimating(false);
      }
    });

    // Transition out
    tl.to(['.pt-browser-mockup', '.pt-float-badge-metric', '.pt-float-badge-tech'], {
      scale: 0.85,
      opacity: 0,
      y: 40,
      filter: 'blur(10px)',
      duration: 0.35,
      ease: 'power2.in'
    })
    .to('.pt-console-inner > *', {
      opacity: 0,
      x: -30,
      stagger: 0.04,
      duration: 0.3,
      ease: 'power2.in'
    }, 0);
  };

  // ─── TRANSITION ENTRANCE ONCE INDEX UPDATES ───
  useEffect(() => {
    // Reset layout rotations
    gsap.set(['.pt-browser-mockup', '.pt-float-badge-metric', '.pt-float-badge-tech'], {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      x: 0,
      y: 0,
      z: 0
    });

    // Transition in
    gsap.fromTo(['.pt-browser-mockup', '.pt-float-badge-metric', '.pt-float-badge-tech'], {
      scale: 0.85,
      opacity: 0,
      y: -40,
      filter: 'blur(10px)'
    }, {
      scale: 1,
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.75,
      ease: 'power3.out',
      delay: 0.05
    });

    gsap.fromTo('.pt-console-inner > *', {
      opacity: 0,
      x: 30
    }, {
      opacity: 1,
      x: 0,
      stagger: 0.06,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.15
    });
  }, [activeIdx]);

  // Entrance animations for the entire page
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pt-header-top', {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
      gsap.fromTo('.pt-cinematic-grid', {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.15
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="portfolio-page-wrapper">
      <div className="section-glow-line" aria-hidden="true" />
      <div className="portfolio-bg-glow-redesign" style={{ '--active-theme': activeProject.color }} />

      <div className="container portfolio-container-redesign">
        {/* Sleek Minimal Header */}
        <header className="pt-header-top">
          <div>
            <span className="eyebrow" style={{ color: activeProject.color }}>SELECTED ARCHITECTURE</span>
            <h1 className="display-sm pt-main-title">Our Work</h1>
          </div>
          <p className="body-md pt-desc-top">
            Interact with the digital products crafted by our agency. Select a project to view metrics, specs, and live demonstrations.
          </p>
        </header>

        {/* Full Cinematic 2-Column Grid */}
        <div className="pt-cinematic-grid">
          {/* Left Column: 3D Parallax Device Showcase */}
          <div 
            ref={stageRef}
            className="pt-visual-column"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="hud-brackets" aria-hidden="true">
              <div className="hud-corner-r tl" />
              <div className="hud-corner-r tr" />
              <div className="hud-corner-r bl" />
              <div className="hud-corner-r br" />
            </div>

            {/* Glowing spotlight effect behind the active device */}
            <div className="pt-spotlight" style={{ '--spotlight-color': activeProject.color }} />

            {/* The main browser mockup */}
            <div className="pt-browser-mockup" style={{ transformStyle: 'preserve-3d' }}>
              {/* Browser window header */}
              <div className="pt-browser-header">
                <div className="pt-browser-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="pt-browser-address">{activeProject.title.toLowerCase()}.oddwebs.com</div>
              </div>
              
              {/* Image viewport */}
              <div className="pt-browser-body">
                <img src={activeProject.image} alt={activeProject.title} className="pt-browser-img" />
              </div>
            </div>

            {/* Floating Badge 1: Key Metric (parallax layers) */}
            <div className="pt-float-badge-metric pt-floating-card">
              <span className="badge-title">PROVEN OUTCOME</span>
              <span className="badge-value" style={{ color: activeProject.color }}>{activeProject.metric}</span>
              <span className="badge-label">{activeProject.metricLabel}</span>
            </div>

            {/* Floating Badge 2: Tech Details */}
            <div className="pt-float-badge-tech pt-floating-card">
              <span className="badge-title">KEY SPECIALIZATION</span>
              <div className="badge-tech-list">
                <span className="badge-tech-item">{activeProject.tags[0]}</span>
                <span className="badge-tech-item">{activeProject.tags[1]}</span>
              </div>
              <span className="badge-label">{activeProject.category}</span>
            </div>
          </div>

          {/* Right Column: Specs & Roadmapping Console */}
          <section className="pt-info-column" style={{ '--console-color': activeProject.color }}>
            <div className="hud-brackets" aria-hidden="true">
              <div className="hud-corner-r tl" />
              <div className="hud-corner-r tr" />
              <div className="hud-corner-r bl" />
              <div className="hud-corner-r br" />
            </div>

            <div className="pt-console-card">
              <div className="pt-console-inner">
                {/* Number HUD & Category */}
                <div className="pt-console-header-row">
                  <span className="pt-console-num" style={{ color: activeProject.color }}>
                    [ 0{activeIdx + 1} // 0{projects.length} ]
                  </span>
                  <span className="pt-console-cat">{activeProject.category}</span>
                </div>

                {/* Project Title */}
                <h2 className="pt-console-title">{activeProject.title}</h2>
                <div className="console-divider" style={{ background: `linear-gradient(90deg, ${activeProject.color}4d, transparent)` }} />

                {/* Description */}
                <p className="pt-console-desc">{activeProject.description}</p>

                {/* Tag Cloud */}
                <div className="pt-console-tags-wrap">
                  <span className="pt-console-section-label">SYSTEM ARCHITECTURE:</span>
                  <div className="pt-console-chips">
                    {activeProject.tags.map((tag, i) => (
                      <span key={i} className="pt-console-chip" style={{ '--chip-theme': activeProject.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Outcome Metrics Container */}
                <div className="pt-console-metrics-row">
                  <div className="pt-console-metric-card" style={{ borderLeftColor: activeProject.color }}>
                    <span className="metric-header">METRIC PERFORMANCE</span>
                    <div className="metric-body-val" style={{ color: activeProject.color }}>{activeProject.metric}</div>
                    <span className="metric-body-lbl">{activeProject.metricLabel}</span>
                  </div>
                </div>

                {/* Interactive Action CTAs */}
                <div className="pt-console-actions">
                  {activeProject.link ? (
                    <a 
                      href={activeProject.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pt-console-btn-primary"
                      style={{ '--btn-glow-color': activeProject.color }}
                    >
                      LAUNCH LIVE DEMO ↗
                    </a>
                  ) : (
                    <button 
                      onClick={() => onViewChange('demo')} 
                      className="pt-console-btn-primary"
                      style={{ '--btn-glow-color': activeProject.color }}
                    >
                      BOOK FREE TECHNICAL ROADMAP
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onViewChange('demo')} 
                    className="pt-console-btn-secondary"
                  >
                    GET CUSTOM QUOTE
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modern Interactive Timeline Navigation */}
        <nav className="pt-timeline-container">
          <div className="pt-timeline-nav">
            {projects.map((project, idx) => (
              <button
                key={idx}
                onClick={() => handleProjectSelect(idx)}
                className={`pt-timeline-btn ${idx === activeIdx ? 'active' : ''}`}
                style={{ '--btn-theme': project.color }}
              >
                <div className="pt-timeline-btn-content">
                  <span className="btn-num">0{idx + 1}</span>
                  <span className="btn-title">{project.title}</span>
                </div>
                <div className="btn-indicator-bar">
                  <div className="btn-indicator-fill" />
                </div>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
