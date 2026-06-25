import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

const projects = [
  {
    title: 'LunaCart',
    category: 'E-Commerce',
    year: '2026',
    description: 'Luxury fashion commerce experience built to increase conversion and average order value.',
    metric: '+320%',
    metricLabel: 'Revenue Growth',
    color: 'var(--accent-ember)',
    image: '/assets/projects/project-1.png',
    tags: ['E-COMMERCE', 'NEXT.JS', 'TAILWIND', 'STRIPE', 'AI AGENT', 'MOTION', 'UI/UX'],
  },
  {
    title: 'DataFlow',
    category: 'Analytics Platform',
    year: '2025',
    description: 'Enterprise analytics platform redesigned for clarity, retention, and performance.',
    metric: '-45%',
    metricLabel: 'Churn Reduction',
    color: 'var(--accent-amber)',
    image: '/assets/projects/project-2.png',
    tags: ['ANALYTICS', 'REACT', 'GSAP', 'REDUX', 'CYBERSECURITY', 'CHARTS', 'UI/UX'],
  },
  {
    title: 'Payze',
    category: 'Fintech MVP',
    year: '2026',
    description: 'Fintech MVP built to look trustworthy, launch fast, and support fundraising.',
    metric: '$2.4M',
    metricLabel: 'Seed Funding',
    color: 'var(--accent-lacquer)',
    image: '/assets/projects/project-3.png',
    tags: ['FINTECH', 'MVP', 'SECURE', 'REACT', 'UI/UX'],
  },
  {
    title: 'VoyageAI',
    category: 'Automation Platform',
    year: '2025',
    description: 'Automation platform for enterprise workflows and LLM execution.',
    metric: '80%',
    metricLabel: 'Work Removed',
    color: 'var(--accent-gold)',
    image: '/assets/projects/project-4.png',
    tags: ['AUTOMATION', 'FASTAPI', 'POSTGRES', '3D TOURS', 'AI MODEL', 'REACT', 'UI/UX'],
  },
];

export default function PortfolioPage({ onViewChange }) {
  const [rotationY, setRotationY] = useState(0);
  const [orbitX, setOrbitX] = useState(-5); // Default tilt down slightly
  const [orbitY, setOrbitY] = useState(0);
  const [orbitMode, setOrbitMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const rotationRef = useRef({ y: 0 });
  const orbitRef = useRef({ x: -5, y: 0 });
  const dragStartRef = useRef({ x: 0, rotationY: 0 });
  const containerRef = useRef(null);

  // Active project index calculation
  const activeIndex = (Math.round(-rotationY / 90) % 4 + 4) % 4;
  const activeProject = projects[activeIndex];

  // ─── MOUSE DRAG / SWIPE INTERACTION ───
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      rotationY: rotationRef.current.y
    };
    // Kill any active GSAP rotation tweens immediately
    gsap.killTweensOf(rotationRef.current);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.x;
    const dragSensitivity = isLite ? 0.45 : 0.35;
    const targetRot = dragStartRef.current.rotationY + deltaX * dragSensitivity;
    
    rotationRef.current.y = targetRot;
    setRotationY(targetRot);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap Y angle to the nearest 90-degree face
    const snapRot = Math.round(rotationRef.current.y / 90) * 90;
    
    gsap.to(rotationRef.current, {
      y: snapRot,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: () => {
        setRotationY(rotationRef.current.y);
      }
    });
  };

  // Drag button helpers
  const rotateTo = (direction) => {
    const currentSnap = Math.round(rotationRef.current.y / 90) * 90;
    const targetRot = currentSnap + direction * 90;
    
    gsap.killTweensOf(rotationRef.current);
    gsap.to(rotationRef.current, {
      y: targetRot,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        setRotationY(rotationRef.current.y);
      }
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        rotateTo(1);
      } else if (e.key === 'ArrowRight') {
        rotateTo(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── PERSPECTIVE ORBIT (MOUSE MOVE TILT) ───
  useEffect(() => {
    if (isLite) return;

    const handleMouseMove = (e) => {
      // Calculate cursor position from -0.5 to 0.5 relative to viewport center
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;

      const targetX = orbitMode ? -y * 25 - 5 : -5;
      const targetY = orbitMode ? x * 30 : 0;

      gsap.to(orbitRef.current, {
        x: targetX,
        y: targetY,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          setOrbitX(orbitRef.current.x);
          setOrbitY(orbitRef.current.y);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [orbitMode]);

  // Card individual hover tilt
  const handleCardMouseMove = (e, cardIndex) => {
    if (cardIndex !== activeIndex || isLite) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle localized 3D tilt
    gsap.to(card, {
      rotateX: -y * 12,
      rotateY: x * 12,
      scale: 1.02,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleCardMouseLeave = (e, cardIndex) => {
    if (cardIndex !== activeIndex || isLite) return;
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pt-header-text > *', {
        opacity: 0,
        y: 30,
        filter: 'blur(8px)'
      }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      });

      gsap.fromTo('.pt-viewport-frame', {
        opacity: 0,
        scale: 0.85
      }, {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.fromTo('.pt-details-panel', {
        opacity: 0,
        y: 40
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.4
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="portfolio-page-wrapper">
      <div className="section-glow-line" aria-hidden="true" />
      
      {/* Background radial overlays */}
      <div className="portfolio-bg-glow" style={{ '--active-color': activeProject.color }} />

      <div className="container portfolio-container">
        {/* Minimalism Header */}
        <header className="portfolio-header">
          <div className="pt-header-text">
            <span className="eyebrow" style={{ color: activeProject.color }}>Portfolio Stage</span>
            <h1 className="display-lg pt-title">Our Work</h1>
            <p className="body-md pt-subtitle">
              Drag to spin the carousel, hover to tilt cards, or toggle orbit mode for a true 3D spatial experience.
            </p>
          </div>

          <div className="pt-controls-bar">
            {/* Interactive orbit toggle */}
            {!isLite && (
              <button 
                onClick={() => setOrbitMode(!orbitMode)} 
                className={`pt-btn-orbit ${orbitMode ? 'active' : ''}`}
                style={{ '--btn-accent': activeProject.color }}
              >
                <span className="orbit-dot" />
                {orbitMode ? 'Orbit Mode Enabled' : 'Enable Orbit Mode'}
              </button>
            )}
          </div>
        </header>

        {/* 3D Visualizer Viewport */}
        <div className="pt-viewport-frame">
          <div className="hud-corner tl" />
          <div className="hud-corner tr" />
          <div className="hud-corner bl" />
          <div className="hud-corner br" />

          <div 
            className={`pt-viewport ${isDragging ? 'grabbing' : ''}`}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
          >
            {/* 3D rotating stage */}
            <div 
              className="pt-stage"
              style={{
                transform: `rotateX(${orbitX}deg) rotateY(${orbitY + rotationY}deg)`,
                transformStyle: 'preserve-3d',
                transition: isDragging ? 'none' : 'transform 0.05s linear'
              }}
            >
              {projects.map((project, idx) => {
                const isCardActive = idx === activeIndex;
                const angle = idx * 90;
                
                return (
                  <div
                    key={idx}
                    className={`pt-card-face ${isCardActive ? 'active' : ''}`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${isLite ? 220 : 330}px)`,
                      '--card-theme': project.color,
                      transformStyle: 'preserve-3d'
                    }}
                    onMouseMove={(e) => handleCardMouseMove(e, idx)}
                    onMouseLeave={(e) => handleCardMouseLeave(e, idx)}
                  >
                    {/* Glowing card border */}
                    <div className="pt-card-glow" />

                    <div className="pt-card-content" style={{ transformStyle: 'preserve-3d' }}>
                      <div className="pt-card-img-wrap" style={{ transform: 'translateZ(20px)' }}>
                        <img src={project.image} alt={project.title} className="pt-card-img" />
                      </div>
                      
                      <div className="pt-card-footer" style={{ transform: 'translateZ(35px)' }}>
                        <h3 className="pt-card-name">{project.title}</h3>
                        <div className="pt-card-metric-badge">
                          <span className="pt-badge-val">{project.metric}</span>
                          <span className="pt-badge-lbl">{project.metricLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stage perspective grid floor */}
            <div className="pt-stage-grid" style={{ transform: `rotateX(${orbitX}deg) rotateY(${orbitY}deg)` }} />
          </div>

          {/* Quick-action rotation arrow buttons */}
          <button className="pt-arrow-btn pt-arrow-prev" onClick={() => rotateTo(1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="pt-arrow-btn pt-arrow-next" onClick={() => rotateTo(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Dynamic Project Details Overlay */}
        <section className="pt-details-panel" style={{ '--active-border': activeProject.color }}>
          <div className="hud-corner tl" />
          <div className="hud-corner tr" />
          
          <div className="pt-details-grid">
            <div className="pt-details-main">
              <div className="pt-meta-row">
                <span className="pt-label-num">Project 0{activeIndex + 1}</span>
                <span className="pt-category">{activeProject.category}</span>
                <span className="pt-year">{activeProject.year}</span>
              </div>
              <h2 className="display-sm pt-details-title">{activeProject.title}</h2>
              <p className="body-lg pt-details-desc">{activeProject.description}</p>
              
              <div className="pt-tags-row">
                {activeProject.tags.map((tag, i) => (
                  <span key={i} className="pt-tag-chip">{tag}</span>
                ))}
              </div>
            </div>

            <div className="pt-details-sidebar">
              <div className="pt-sidebar-metric-box" style={{ background: `${activeProject.color}0a`, borderColor: `${activeProject.color}33` }}>
                <span className="pt-sidebar-lbl">PROVEN OUTCOME</span>
                <div className="pt-sidebar-val" style={{ color: activeProject.color }}>{activeProject.metric}</div>
                <div className="pt-sidebar-lbl-metric">{activeProject.metricLabel}</div>
              </div>

              <div className="pt-details-actions">
                <a href="#demo" onClick={(e) => { e.preventDefault(); onViewChange('demo'); }} className="btn-primary magnetic" style={{ width: '100%', justifyContent: 'center' }}>
                  Schedule Free Demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
