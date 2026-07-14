import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: 'OddShoe',
    category: '3D E-Commerce',
    year: '2026',
    description: 'Futuristic 3D shoe landing page and e-commerce experience showcasing high-production sneaker drops with fluid layouts and organic aesthetics.',
    metric: '+320%',
    metricLabel: 'Revenue Growth',
    color: 'var(--accent-ember)',
    glowColor: 'rgba(249, 87, 56, 0.22)',
    image: '/assets/projects/boss-shoes.png',
    tags: ['E-COMMERCE', 'REACT', 'GSAP', '3D MOTION', 'STYLING', 'ORGANIC DESIGN', 'UI/UX'],
    link: 'https://odd-shoe.vercel.app/'
  },
  {
    title: 'OddDoctor',
    category: 'Healthcare Platform',
    year: '2026',
    description: 'Immersive mobile dental tracking dashboard and interactive 3D arch mapping system that connects users with real-time health data.',
    metric: '88%',
    metricLabel: 'Oral Health Index',
    color: '#33ccff',
    glowColor: 'rgba(51, 204, 255, 0.22)',
    image: '/assets/projects/odddoctor.png',
    tags: ['MOBILE APP', '3D MAPPING', 'DENTAL AI', 'REACT', 'GSAP', 'UI/UX'],
    link: 'https://odddoctor-alpha.vercel.app/',
    isMobile: true
  },
  {
    title: 'Storybook',
    category: 'Watercolor Narrative',
    year: '2026',
    description: 'Premium Ghibli-inspired watercolor storybook landing page and collectors workshop with custom canvas leaf-drift physics and glowing firefly animations.',
    metric: '99.4%',
    metricLabel: 'Visual Finesse',
    color: '#74B45C',
    glowColor: 'rgba(116, 180, 92, 0.22)',
    image: '/assets/projects/storybook.jpg',
    tags: ['CREATIVE SITE', 'REACT', 'CANVAS', 'GLASS UI', 'INTERACTIVE', 'UI/UX'],
    link: 'https://oddscene.vercel.app/'
  },
  {
    title: 'Qitchen',
    category: 'Restaurant Experience',
    year: '2026',
    description: 'A premium Japanese restaurant menu and reservation brand experience.',
    metric: '4.9★',
    metricLabel: 'Customer Rating',
    color: 'var(--accent-gold)',
    glowColor: 'rgba(233, 216, 166, 0.22)',
    image: '/assets/projects/qitchen.png',
    tags: ['UX/UI', 'RESTAURANT', 'NEXT.JS', 'FRAMER MOTION', 'BOOKINGS', 'BRANDING'],
    link: 'https://project-restro1.vercel.app/'
  },
];

export default function CaseStudies() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Monitor visibility of the section to suspend active RAF loop when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.02 } // Trigger when even a tiny bit of the section enters the screen
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update carousel card animations dynamically based on viewport center distance
  const updateCarouselDynamics = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.cs-card');
    const screenCenter = window.innerWidth / 2;
    const screenWidth = window.innerWidth;

    let closestCardIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = cardCenter - screenCenter;
      const normDist = distance / screenWidth;

      // Skip updating off-screen cards to optimize render performance
      if (Math.abs(normDist) > 1.25) {
        return;
      }

      const absDist = Math.abs(distance);
      if (absDist < minDistance) {
        minDistance = absDist;
        closestCardIndex = idx;
      }

      // Card box scale and opacity
      const box = card.querySelector('.cs-card__box');
      if (box) {
        const scale = 1 - Math.min(Math.abs(normDist) * 0.12, 0.12);
        const opacity = 1 - Math.min(Math.abs(normDist) * 0.5, 0.5);
        gsap.set(box, { 
          scale: scale, 
          opacity: opacity,
          overwrite: 'auto'
        });
      }

      // Parallax image container movement — overflow:hidden clips the shift cleanly
      const imgContainer = card.querySelector('.cs-card__img-container');
      if (imgContainer) {
        const parallaxX = normDist * -8;
        gsap.set(imgContainer, { 
          xPercent: parallaxX,
          overwrite: 'auto'
        });
      }

      // Floating metric card movement
      const badge = card.querySelector('.cs-card__metric-badge');
      if (badge) {
        const badgeX = normDist * -30;
        const badgeY = normDist * -10;
        gsap.set(badge, { 
          x: badgeX, 
          y: badgeY,
          overwrite: 'auto'
        });
      }

      // Giant background typography parallax
      const giantText = card.querySelector('.cs-card__giant-text');
      if (giantText) {
        const textX = normDist * 80;
        gsap.set(giantText, { 
          x: textX,
          overwrite: 'auto'
        });
      }

      // Content elements fade
      const content = card.querySelector('.cs-card__content');
      if (content) {
        const contentOpacity = 1 - Math.min(Math.abs(normDist) * 1.5, 1);
        gsap.set(content, {
          opacity: contentOpacity,
          overwrite: 'auto'
        });
      }
    });

    setActiveIndex(closestCardIndex);
  };

  // Run updates once on visibility or native mobile scroll
  useEffect(() => {
    if (isVisible) {
      updateCarouselDynamics();
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isMobile || !isVisible) return;
    const scrollContainer = sectionRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      updateCarouselDynamics();
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isMobile, isVisible]);

  // Desktop Click-and-Drag / Touch-Swipe to slide horizontal scroll cards
  useEffect(() => {
    if (isMobile) return;

    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollY = 0;
    let hasMoved = false;

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('a, button, .cs-card__action')) {
        return;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startScrollY = window.scrollY;
      hasMoved = false;
      section.classList.add('grabbing');
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        hasMoved = true;
      }

      if (hasMoved) {
        e.preventDefault();
        const targetScroll = startScrollY - dx;
        if (window.lenis) {
          window.lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo(0, targetScroll);
        }
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      section.classList.remove('grabbing');
      
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          hasMoved = false;
        }, 0);
      }
    };

    const handleTouchStart = (e) => {
      if (e.target.closest('a, button, .cs-card__action')) {
        return;
      }
      const touch = e.touches[0];
      isDragging = true;
      startX = touch.clientX;
      startY = touch.clientY;
      startScrollY = window.scrollY;
      hasMoved = false;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 6) {
          hasMoved = true;
        }
        if (hasMoved) {
          if (e.cancelable) {
            e.preventDefault();
          }
          const targetScroll = startScrollY - dx;
          if (window.lenis) {
            window.lenis.scrollTo(targetScroll, { immediate: true });
          } else {
            window.scrollTo(0, targetScroll);
          }
        }
      } else {
        isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const handleClickCapture = (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    };

    section.addEventListener('mousedown', handleMouseDown, { passive: false });
    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
    section.addEventListener('click', handleClickCapture, { capture: true });

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });
    section.addEventListener('touchend', handleTouchEnd);
    section.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      section.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      section.removeEventListener('click', handleClickCapture, { capture: true });

      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
      section.removeEventListener('touchend', handleTouchEnd);
      section.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isMobile]);

  // Desktop ScrollTrigger Setup (pinning & horizontal translation)
  useLayoutEffect(() => {
    if (isMobile) return;

    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const ctx = gsap.context(() => {
      // Calculate total horizontal translate distance
      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / projects.length, // 5 cards total (1 title + 4 projects), so 4 increments (1 / 4)
            duration: { min: 0.2, max: 0.5 },
            ease: 'power3.out',
          },
          onUpdate: () => {
            updateCarouselDynamics();
          }
        }
      });
    }, section);

    // Force layout recalculation inside ScrollTrigger
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      updateCarouselDynamics();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isMobile]);

  // Desktop Mouse Move Interactive Tilt & Glow
  const handleMouseMove = (e, card) => {
    if (window.innerWidth < 900) return;
    const box = card.querySelector('.cs-card__box');
    const imgContainer = card.querySelector('.cs-card__img-container');
    const badge = card.querySelector('.cs-card__metric-badge');

    if (!box || !imgContainer) return;

    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    gsap.to(box, {
      rotateY: normX * 6,
      rotateX: -normY * 6,
      transformPerspective: 1200,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to(imgContainer, {
      rotateY: -normX * 8,
      rotateX: normY * 8,
      x: normX * 15,
      y: normY * 15,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    if (badge) {
      gsap.to(badge, {
        x: normX * -25,
        y: normY * -25,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }

    box.style.setProperty('--mouse-x', `${x}px`);
    box.style.setProperty('--mouse-y', `${y}px`);
    box.style.setProperty('--mouse-opacity', '0.12');
  };

  const handleMouseLeave = (card) => {
    const box = card.querySelector('.cs-card__box');
    const imgContainer = card.querySelector('.cs-card__img-container');
    const badge = card.querySelector('.cs-card__metric-badge');

    if (!box) return;

    gsap.to(box, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto'
    });

    if (imgContainer) {
      gsap.to(imgContainer, {
        rotateY: 0,
        rotateX: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.6)',
        overwrite: 'auto'
      });
    }

    if (badge) {
      gsap.to(badge, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.6)',
        overwrite: 'auto'
      });
    }

    box.style.setProperty('--mouse-opacity', '0');
  };

  const glowColors = [
    'rgba(249, 87, 56, 0.15)', // Title slide (ember)
    'rgba(249, 87, 56, 0.22)', // OddShoe
    'rgba(51, 204, 255, 0.22)', // OddDoctor
    'rgba(116, 180, 92, 0.22)', // Storybook
    'rgba(233, 216, 166, 0.22)' // VoyageAI
  ];

  return (
    <section
      id="work"
      ref={sectionRef}
      data-scene="work"
      className={`cs-section ${isMobile ? 'cs-section--mobile' : 'cs-section--desktop'}`}
    >
      {/* Background technical grid */}
      <div className="cs-section__grid-bg" />

      {/* Cross-fading background radial glow layers */}
      {glowColors.map((glowColor, idx) => (
        <div
          key={idx}
          className="cs-section__glow-layer"
          style={{
            background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
            opacity: activeIndex === idx ? 1 : 0,
          }}
        />
      ))}

      {/* Horizontal Carousel Track */}
      <div ref={trackRef} className="cs-track" data-cursor="drag" style={{ width: isMobile ? 'auto' : '500vw' }}>
        {/* Title Slide */}
        <article
          className="cs-card cs-card--title"
          style={{
            '--card-accent': 'var(--accent-ember)',
            zIndex: 1,
          }}
        >
          <div className="cs-card__box" style={{ background: 'transparent', border: 'none', boxShadow: 'none', backdropFilter: 'none' }}>
            <div className="cs-card__inner" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: isMobile ? '0 24px' : '40px' }}>
              <div className="cs-card__content" style={{ maxWidth: '600px', width: '100%', opacity: 1 }}>
                {isMobile && (
                  <div className="cs-title-swipe-indicator">
                    <div className="cs-swipe-gesture">
                      <div className="cs-swipe-track-glowing" />
                      <div className="cs-swipe-hand-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                          <path d="M14 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4.5" />
                          <path d="M6 10v6a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-5" />
                          <path d="M18 11a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" />
                        </svg>
                      </div>
                    </div>
                    <span className="cs-swipe-text">Swipe to explore</span>
                  </div>
                )}
                <p className="eyebrow" style={{ color: 'var(--accent-ember)', letterSpacing: '0.25em', marginBottom: '20px' }}>
                  Selected Work
                </p>
                <h2 className="display-lg" style={{ fontSize: isMobile ? 'clamp(1.8rem, 7vw, 2.4rem)' : 'var(--text-display-lg)', fontWeight: 'var(--weight-black)', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '24px' }}>
                  Web Design & Development Case Studies
                </h2>
                <p className="body-lg" style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '1rem' : '1.2rem' }}>
                  Not fake “concept universes.”
                </p>
              </div>
            </div>
          </div>
        </article>

        {projects.map((project, i) => (
          <article
            key={i}
            className="cs-card"
            style={{
              '--card-accent': project.color,
              zIndex: i + 2,
            }}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            {/* The primary card box */}
            <div className="cs-card__box">
              {/* Internal mouse follow localized glow (desktop only) */}
              <div className="cs-card__mouse-glow" />

              {/* Technical Grid Overlay */}
              <div className="cs-card__grid" />

              {/* Massive background typography */}
              <div className="cs-card__giant-text">{project.title}</div>

              {/* Card Inner Layout */}
              <div className="cs-card__inner">
                {/* Left Side: Content */}
                <div className="cs-card__content">
                  <div className="cs-card__meta">
                    <span className="cs-card__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cs-card__category">{project.category}</span>
                    <span className="cs-card__year">{project.year}</span>
                  </div>

                  <h3 className="cs-card__title">{project.title}</h3>
                  <p className="cs-card__desc">{project.description}</p>

                  {/* Tech Tags */}
                  <div className="cs-card__tags">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="cs-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <div 
                    className="cs-card__action"
                    onClick={(e) => { e.stopPropagation(); window.open(project.link, '_blank', 'noopener,noreferrer'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="cs-card__action-text">Explore Project</span>
                    <span className="cs-card__action-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 17L17 7M17 7H7M17 7V17"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Right Side: Showcase */}
                <div 
                  className={`cs-card__showcase ${project.isMobile ? 'cs-card__showcase--mobile' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    ...(isMobile ? {
                      top: '0',
                      right: '0',
                      width: '100%',
                      height: '45%',
                    } : {
                      right: '-50px',
                      top: '-50px',
                      bottom: '-50px',
                      width: '52%',
                    })
                  }}
                >
                  <div 
                    className="cs-card__img-container"
                    style={{
                      aspectRatio: project.isMobile ? '9/19.3' : '16/10',
                      height: isMobile ? '100%' : '90%',
                      width: 'auto',
                      maxWidth: isMobile ? '100%' : '90%',
                      maxHeight: isMobile ? '100%' : '90%',
                      borderRadius: project.isMobile ? '32px' : '20px',
                      border: project.isMobile 
                        ? '6px solid rgba(255, 255, 255, 0.15)' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden'
                    }}
                  >
                    {isVisible && project.image && (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="cs-card__img"
                        loading="lazy"
                        draggable="false"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center center',
                        }}
                      />
                    )}
                    <div
                      className="cs-card__img-radial"
                      style={{
                        background: `radial-gradient(circle at center, ${project.glowColor}, transparent 65%)`,
                      }}
                    />
                  </div>

                  {/* Floating Metric Card (overlapping showcase image) */}
                  <div className="cs-card__metric-badge">
                    <span className="cs-card__metric-val" style={{ color: project.color }}>
                      {project.metric}
                    </span>
                    <span className="cs-card__metric-label">{project.metricLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Mobile Dot Pagination */}
      {isMobile && (
        <div className="cs-dot-pagination">
          {[0, ...projects.map((_, i) => i + 1)].map((dotIdx) => (
            <span
              key={dotIdx}
              className={`cs-dot ${activeIndex === dotIdx ? 'cs-dot--active' : ''}`}
              style={{ '--dot-accent': dotIdx === 0 ? 'var(--accent-ember)' : (projects[dotIdx - 1]?.color || 'var(--accent-ember)') }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
