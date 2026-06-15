import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: 'LuxeThread',
    category: 'E-Commerce',
    year: '2026',
    description: 'A high-converting luxury fashion platform that increased AOV by 180% through personalized AI recommendations.',
    metric: '+180%',
    metricLabel: 'AOV Increase',
    color: '#8b5cf6',
    size: 'large'
  },
  {
    title: 'VaultPay',
    category: 'Fintech',
    year: '2025',
    description: 'Enterprise banking dashboard serving 50K+ daily active users with real-time analytics.',
    metric: '50K+',
    metricLabel: 'Daily Users',
    color: '#3b82f6',
    size: 'medium'
  },
  {
    title: 'BiteBuddy',
    category: 'Mobile App',
    year: '2026',
    description: 'Food delivery platform handling 100K+ orders per day across 3 countries.',
    metric: '100K+',
    metricLabel: 'Daily Orders',
    color: '#ec4899',
    size: 'medium'
  },
  {
    title: 'NestHub',
    category: 'Real Estate',
    year: '2025',
    description: 'AI-powered property matching platform with 3D virtual tours and smart valuations.',
    metric: '$24M',
    metricLabel: 'Properties Sold',
    color: '#14b8a6',
    size: 'large'
  },
  {
    title: 'PulseIQ',
    category: 'SaaS',
    year: '2024',
    description: 'Enterprise analytics suite with predictive insights used by Fortune 500 companies.',
    metric: '4.2x',
    metricLabel: 'ROI Delivered',
    color: '#f59e0b',
    size: 'medium'
  },
  {
    title: 'ZenFit',
    category: 'Health & Wellness',
    year: '2025',
    description: 'Premium fitness brand with subscription model achieving 92% retention rate.',
    metric: '92%',
    metricLabel: 'Retention Rate',
    color: '#a78bfa',
    size: 'medium'
  }
];

export default function CaseStudies() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── SECTION HEADER: Emerges from depth ───
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#work',
          start: 'top 75%',
          once: true,
        },
      });

      headerTl
        .fromTo('#work .section-counter', {
          opacity: 0, y: 30, filter: 'blur(6px)',
        }, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.6, ease: 'power3.out',
        })
        .fromTo('#work .eyebrow', {
          opacity: 0, x: -40, filter: 'blur(4px)',
        }, {
          opacity: 1, x: 0, filter: 'blur(0px)',
          duration: 0.7, ease: 'power3.out',
        }, '-=0.3')
        .fromTo('#work .work-heading', {
          opacity: 0, y: 80, scale: 0.85, filter: 'blur(10px)',
          clipPath: 'inset(100% 0 0 0)',
        }, {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2, ease: 'power4.out',
        }, '-=0.4')
        .fromTo('#work .work-subtext', {
          opacity: 0, y: 30, filter: 'blur(4px)',
        }, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.7, ease: 'power2.out',
        }, '-=0.6');

      // ─── PROJECT CARDS: Float in from 3D space ───
      gsap.utils.toArray('.project-card').forEach((card, i) => {
        // Each card emerges from a different 3D position
        const xDir = i % 2 === 0 ? -1 : 1;
        const depth = 80 + i * 20;
        const rotate = xDir * (5 + Math.random() * 8);

        gsap.fromTo(card, {
          y: depth,
          x: xDir * 60,
          opacity: 0,
          scale: 0.8,
          rotateY: rotate,
          rotateX: 8,
          filter: 'blur(6px)',
          transformPerspective: 1200,
        }, {
          y: 0,
          x: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            once: true,
          },
          delay: (i % 2) * 0.15,
        });

        // ─── SCROLL PARALLAX: Cards at different depths ───
        gsap.to(card, {
          y: -30 * (1 + (i % 3) * 0.4),
          rotateX: -2,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        // ─── HOVER: 3D tilt with depth ───
        const handleMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateX: y * -12,
            rotateY: x * 12,
            scale: 1.02,
            boxShadow: `${x * 20}px ${y * 20}px 60px rgba(0,0,0,0.4), 0 0 80px ${card.style.getPropertyValue('--card-accent')}22`,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 1000,
          });
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            boxShadow: 'none',
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
          });
        };

        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
        card.style.transformStyle = 'preserve-3d';
      });

      // ─── VIEW ALL CTA: Slides up ───
      gsap.fromTo('.work-cta', {
        opacity: 0, y: 50,
      }, {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.work-cta',
          start: 'top 90%',
          once: true,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} data-scene="work" style={{ perspective: '1200px' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section header */}
        <div className="work-header">
          <span className="section-counter">06 Projects</span>
          <p className="eyebrow">Selected Work</p>
          <h2 className="work-heading">
            Projects that<br />move the needle.
          </h2>
          <p className="work-subtext">
            From startups to enterprise — we build products that users love and businesses rely on.
          </p>
        </div>

        {/* Project grid */}
        <div className="project-grid">
          {projects.map((project, i) => (
            <article
              key={i}
              className={`project-card project-card--${project.size}`}
              style={{ '--card-accent': project.color }}
            >
              {/* Visual placeholder — CSS-drawn gradient */}
              <div className="project-card__image">
                <div
                  className="project-card__visual"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}22, ${project.color}08)`,
                  }}
                >
                  <div className="project-card__visual-grid" />
                  <div
                    className="project-card__visual-orb"
                    style={{ background: project.color }}
                  />
                </div>
                <div className="project-card__overlay" />
              </div>

              {/* Content */}
              <div className="project-card__content">
                <div className="project-card__meta">
                  <span className="project-card__category">{project.category}</span>
                  <span className="project-card__year">{project.year}</span>
                </div>

                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__desc">{project.description}</p>

                <div className="project-card__metric">
                  <span className="project-card__metric-value" style={{ color: project.color }}>{project.metric}</span>
                  <span className="project-card__metric-label">{project.metricLabel}</span>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="project-card__arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </article>
          ))}
        </div>

        {/* View all CTA */}
        <div className="work-cta">
          <a href="#" className="btn-outline magnetic">
            View All Projects
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '8px' }}>
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
