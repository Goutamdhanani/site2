import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, STAGGER, prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: 'LuxeThread',
    category: 'E-Commerce',
    year: '2026',
    description: 'A high-converting luxury fashion platform that increased AOV by 180% through personalized AI recommendations.',
    metric: '+180%',
    metricLabel: 'AOV Increase',
    color: 'var(--accent-ember)',
  },
  {
    title: 'VaultPay',
    category: 'Fintech',
    year: '2025',
    description: 'Enterprise banking dashboard serving 50K+ daily active users with real-time analytics.',
    metric: '50K+',
    metricLabel: 'Daily Users',
    color: 'var(--accent-amber)',
  },
  {
    title: 'BiteBuddy',
    category: 'Mobile App',
    year: '2026',
    description: 'Food delivery platform handling 100K+ orders per day across 3 countries.',
    metric: '100K+',
    metricLabel: 'Daily Orders',
    color: 'var(--accent-lacquer)',
  },
  {
    title: 'NestHub',
    category: 'Real Estate',
    year: '2025',
    description: 'AI-powered property matching platform with 3D virtual tours and smart valuations.',
    metric: '$24M',
    metricLabel: 'Properties Sold',
    color: 'var(--accent-gold)',
  },
];

export default function CaseStudies() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const totalScroll = track.scrollWidth - window.innerWidth;

      // ─── HORIZONTAL SCROLL PIN ───
      const horizontalTween = gsap.to(track, {
        x: -totalScroll,
        ease: EASE.none,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (projects.length - 1),
            duration: { min: 0.3, max: 0.6 },
            ease: EASE.inOut,
          },
        },
      });

      // ─── CARD CONTENT REVEALS ───
      gsap.utils.toArray('.cs-card').forEach((card) => {
        const content = card.querySelector('.cs-card__content');
        if (!content) return;

        gsap.fromTo(content.children,
          { opacity: 0, x: 60, filter: 'blur(4px)' },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: DUR.mid,
            ease: EASE.out,
            stagger: STAGGER.normal,
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: 'left 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Metric number scale pop
        const metric = card.querySelector('.cs-card__metric-value');
        if (metric) {
          gsap.fromTo(metric,
            { scale: 0.5, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: DUR.slow,
              ease: EASE.back,
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 60%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} data-scene="work" className="cs-section">
      <div ref={trackRef} className="cs-track">
        {projects.map((project, i) => (
          <article key={i} className="cs-card" style={{ '--card-accent': project.color }}>
            {/* Full-screen gradient background */}
            <div className="cs-card__bg">
              <div className="cs-card__visual" style={{
                background: `radial-gradient(ellipse at 30% 40%, ${project.color}22, transparent 60%), radial-gradient(ellipse at 70% 70%, ${project.color}11, transparent 50%)`,
              }}>
                <div className="cs-card__grid-lines" />
                <div className="cs-card__orb" style={{ background: project.color }} />
              </div>
            </div>

            {/* Content overlay */}
            <div className="cs-card__content">
              <div className="cs-card__meta">
                <span className="cs-card__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="cs-card__category">{project.category}</span>
                <span className="cs-card__year">{project.year}</span>
              </div>

              <h3 className="cs-card__title">{project.title}</h3>
              <p className="cs-card__desc">{project.description}</p>

              <div className="cs-card__metric">
                <span className="cs-card__metric-value" style={{ color: project.color }}>{project.metric}</span>
                <span className="cs-card__metric-label">{project.metricLabel}</span>
              </div>

              <div className="cs-card__arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
