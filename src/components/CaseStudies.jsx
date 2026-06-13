import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const projects = [
  {
    image: '/assets/projects/project-1.png',
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
    image: '/assets/projects/project-2.png',
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
    image: '/assets/projects/project-3.png',
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
    image: '/assets/projects/project-4.png',
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
    image: '/assets/projects/project-5.png',
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
    image: '/assets/projects/project-6.png',
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

      // Section header animation
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: '#work', start: 'top 75%', once: true }
      });

      headerTl
        .fromTo('#work .section-counter', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        .fromTo('#work .eyebrow', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .fromTo('#work .work-heading', { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' }, {
          opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power4.out'
        }, '-=0.4')
        .fromTo('#work .work-subtext', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5');

      // Project cards — staggered reveal with parallax
      gsap.utils.toArray('.project-card').forEach((card, i) => {
        // Reveal
        gsap.fromTo(card, {
          y: 100, opacity: 0, scale: 0.95
        }, {
          y: 0, opacity: 1, scale: 1,
          duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true
          },
          delay: (i % 2) * 0.15
        });

        // Image parallax inside card
        const img = card.querySelector('.project-card__image img');
        if (img) {
          gsap.to(img, {
            yPercent: -15,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5
            }
          });
        }

        // 3D tilt on hover
        const handleMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateX: y * -8,
            rotateY: x * 8,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 1000,
          });
        };
        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0, rotateY: 0,
            duration: 0.7, ease: 'elastic.out(1, 0.5)'
          });
        };
        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
        card.style.transformStyle = 'preserve-3d';
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef}>
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

        {/* Project grid — bento-style */}
        <div className="project-grid">
          {projects.map((project, i) => (
            <article
              key={i}
              className={`project-card project-card--${project.size}`}
              style={{ '--card-accent': project.color }}
            >
              {/* Image */}
              <div className="project-card__image">
                <img src={project.image} alt={project.title} loading="lazy" />
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
                  <span className="project-card__metric-value">{project.metric}</span>
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
        <div className="work-cta" data-animate="fade-up">
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
