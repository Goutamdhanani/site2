import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, STAGGER, prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

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
    tags: ['FINTECH', 'REACT', 'GSAP', 'REDUX', 'CYBERSECURITY', 'CHARTS', 'UI/UX'],
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
    tags: ['MOBILE APP', 'EXPO', 'NODE.JS', 'GOOGLE MAPS', 'REDIS', 'MOTION', 'UI/UX'],
  },
  {
    title: 'VoyageAI',
    category: 'Automation Platform',
    year: '2025',
    description: 'Automation platform for enterprise workflows and LLM execution.',
    metric: '80%',
    metricLabel: 'Manual Work Removed',
    color: 'var(--accent-gold)',
    image: '/assets/projects/project-4.png',
    tags: ['REAL ESTATE', 'FASTAPI', 'POSTGRES', '3D TOURS', 'AI MODEL', 'REACT', 'UI/UX'],
  },
];

export default function CaseStudies() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const handleMouseMove = (e, card) => {
    if (prefersReducedMotion()) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates from -0.5 to 0.5
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    const imgWrapper = card.querySelector('.cs-card__image-wrapper');
    const badge = card.querySelector('.cs-card__floating-badge');
    const bgTitle = card.querySelector('.cs-card__bg-title');
    const mouseGlow = card.querySelector('.cs-card__mouse-glow');

    // 3D tilt image wrapper
    gsap.to(imgWrapper, {
      rotateY: normX * 14,
      rotateX: -normY * 14,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    // Translate badge in opposite direction for parallax depth
    gsap.to(badge, {
      x: normX * -25,
      y: normY * -25,
      rotateY: normX * 8,
      rotateX: -normY * 8,
      transformPerspective: 800,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    // Shift background title slightly
    gsap.to(bgTitle, {
      x: normX * 35,
      y: normY * 35,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    // Move card mouse glow
    if (mouseGlow) {
      gsap.to(mouseGlow, {
        left: `${x}px`,
        top: `${y}px`,
        opacity: 0.15,
        duration: 0.3,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    }
  };

  const handleMouseLeave = (card) => {
    if (prefersReducedMotion()) return;
    const imgWrapper = card.querySelector('.cs-card__image-wrapper');
    const badge = card.querySelector('.cs-card__floating-badge');
    const bgTitle = card.querySelector('.cs-card__bg-title');
    const mouseGlow = card.querySelector('.cs-card__mouse-glow');

    gsap.to(imgWrapper, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto'
    });

    gsap.to(badge, {
      x: 0,
      y: 0,
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto'
    });

    gsap.to(bgTitle, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    if (mouseGlow) {
      gsap.to(mouseGlow, {
        opacity: 0,
        duration: 0.5,
        overwrite: 'auto'
      });
    }
  };

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    // ─── DESKTOP HORIZONTAL SCROLL PINNING ───
    mm.add("(min-width: 900px)", () => {
      const track = trackRef.current;
      const totalScroll = track.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / projects.length,
            duration: { min: 0.3, max: 0.6 },
            ease: 'power2.inOut',
          },
        },
      });

      // Card reveals inside horizontal scroll
      gsap.utils.toArray('.cs-card').forEach((card) => {
        const bgTitle = card.querySelector('.cs-card__bg-title');
        const imgWrapper = card.querySelector('.cs-card__image-wrapper');
        const img = card.querySelector('.cs-card__image');
        const badge = card.querySelector('.cs-card__floating-badge');
        const content = card.querySelector('.cs-card__content');
        
        // 1. Shutter reveal (clip-path wipe)
        if (imgWrapper) {
          gsap.fromTo(imgWrapper,
            { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
            {
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 90%',
                end: 'left 25%',
                scrub: true,
              }
            }
          );
        }

        // 2. Parallax zoom/drift on the mockup image itself
        if (img) {
          gsap.fromTo(img,
            { xPercent: -8, scale: 1.12 },
            {
              xPercent: 8,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 100%',
                end: 'right 0%',
                scrub: true,
              }
            }
          );
        }

        // 3. Parallax scroll on the giant outline background title
        if (bgTitle) {
          gsap.fromTo(bgTitle,
            { x: 120 },
            {
              x: -120,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 100%',
                end: 'right 0%',
                scrub: true,
              }
            }
          );
        }

        // 4. Parallax scroll on the floating glass metric badge
        if (badge) {
          gsap.fromTo(badge,
            { x: -50, rotate: -2 },
            {
              x: 30,
              rotate: 2,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 90%',
                end: 'left 30%',
                scrub: true,
              }
            }
          );
        }

        // 5. Content elements fade/slide stagger reveal
        if (content) {
          gsap.fromTo(content.children,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 75%',
                end: 'left 40%',
                scrub: true,
              }
            }
          );
        }
      });
    });

    // ─── MOBILE VERTICAL CARDS (simplified — no scrub, no filter, no clip-path) ───
    mm.add("(max-width: 899px)", () => {
      const cards = gsap.utils.toArray('.cs-card');
      
      cards.forEach((card, i) => {
        const badge = card.querySelector('.cs-card__floating-badge');
        const content = card.querySelector('.cs-card__content');
        const img = card.querySelector('.cs-card__image');

        // 1. Smooth card reveal
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            }
          }
        );

        // 2. Parallax drift on the mockup image inside the card
        if (img) {
          gsap.fromTo(img,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              }
            }
          );
        }

        // 3. Simple badge entrance
        if (badge) {
          gsap.fromTo(badge,
            { opacity: 0, scale: 0.8, rotate: -3 },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 0.6,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: card,
                start: 'top 70%',
                once: true,
              }
            }
          );
        }

        // 4. Simple content fade
        if (content) {
          gsap.fromTo(content.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.06,
              scrollTrigger: {
                trigger: card,
                start: 'top 75%',
                once: true,
              }
            }
          );
        }
      });
    });

    // Recalculate triggers
    setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 150);

    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} data-scene="work" className="cs-section">
      <div ref={trackRef} className="cs-track">
        {/* Title Slide */}
        <article
          className="cs-card cs-card--title"
          style={{
            '--card-accent': 'var(--accent-ember)',
            zIndex: 1,
          }}
        >
          <div className="cs-card__bg">
            <div
              className="cs-card__visual"
              style={{
                background: `radial-gradient(ellipse at 30% 40%, var(--accent-ember)10, transparent 65%)`,
              }}
            >
              <div className="cs-card__grid-lines" />
            </div>
          </div>

          <div className="cs-card__layout" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6vw', height: '100%' }}>
            <div className="cs-card__content" style={{ opacity: 1, transform: 'none', maxWidth: '600px' }}>
              <p className="eyebrow" style={{ color: 'var(--accent-ember)', letterSpacing: '0.25em', marginBottom: '20px' }}>
                Selected Work
              </p>
              <h2 className="display-lg" style={{ fontSize: 'var(--text-display-lg)', fontWeight: 'var(--weight-black)', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '24px' }}>
                Real projects with real results.
              </h2>
              <p className="body-lg" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                Not fake “concept universes.”
              </p>
            </div>
          </div>
        </article>

        {projects.map((project, i) => (
          <article
            key={i}
            className="cs-card"
            style={{
              '--card-accent': project.color,
              zIndex: i + 2, // Stack cards correctly on mobile
            }}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            {/* Interactive mouse follow ambient glow */}
            <div className="cs-card__mouse-glow" style={{ background: project.color }} />

            {/* Full-screen background visual */}
            <div className="cs-card__bg">
              <div
                className="cs-card__visual"
                style={{
                  background: `radial-gradient(ellipse at 30% 40%, ${project.color}15, transparent 65%), radial-gradient(ellipse at 70% 70%, ${project.color}08, transparent 55%)`,
                }}
              >
                <div className="cs-card__grid-lines" />
                <div className="cs-card__orb" style={{ background: project.color }} />
              </div>
            </div>

            {/* Asymmetric Depth Sandwich Layout */}
            <div className="cs-card__layout">
              {/* Massive background typography overlapping behind the image */}
              <div className="cs-card__bg-title-wrap">
                <h2 className="cs-card__bg-title">{project.title}</h2>
              </div>

              {/* Background rotating tag orbit */}
              <div className="cs-card__tech-orbit">
                <div className="cs-card__orbit-track">
                  {[...project.tags, ...project.tags, ...project.tags].map((tag, idx) => (
                    <span key={idx} className="cs-card__orbit-tag">
                      {tag} <span className="cs-card__orbit-dot">•</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating Image Showcase Frame */}
              <div className="cs-card__showcase">
                <div className="cs-card__image-wrapper">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="cs-card__image"
                    loading="lazy"
                  />
                  <div className="cs-card__image-glow" style={{ background: project.color }} />

                  {/* Corner bracket reticles */}
                  <div className="cs-card__corner cs-card__corner--tl" />
                  <div className="cs-card__corner cs-card__corner--tr" />
                  <div className="cs-card__corner cs-card__corner--bl" />
                  <div className="cs-card__corner cs-card__corner--br" />
                </div>

                {/* Floating Glass Metric Badge (overlapping the image) */}
                <div className="cs-card__floating-badge">
                  <div className="cs-card__badge-glass" />
                  <span className="cs-card__badge-val" style={{ color: project.color }}>
                    {project.metric}
                  </span>
                  <span className="cs-card__badge-lbl">{project.metricLabel}</span>
                </div>
              </div>

              {/* Foreground content blocks */}
              <div className="cs-card__content">
                <div className="cs-card__meta">
                  <span className="cs-card__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cs-card__category">{project.category}</span>
                  <span className="cs-card__year">{project.year}</span>
                </div>

                <p className="cs-card__desc">{project.description}</p>

                <div className="cs-card__actions">
                  <div className="cs-card__arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="cs-card__link-text">View Case Study</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
