import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const cases = [
  {
    type: 'full',
    image: '/assets/case-01.png',
    alt: 'LunaCart',
    tag: 'E-Commerce',
    year: '2024',
    title: 'LunaCart',
    description: 'A high-converting e-commerce platform that scaled revenue by 320% in 6 months.',
    metricValue: '320%',
    metricLabel: 'Revenue Growth'
  },
  {
    type: 'half',
    image: '/assets/case-02.png',
    alt: 'DataFlow',
    tag: 'SaaS',
    year: '2024',
    title: 'DataFlow',
    metricValue: '45%',
    metricLabel: 'Churn Reduced'
  },
  {
    type: 'half',
    image: '/assets/case-03.png',
    alt: 'Payze',
    tag: 'Fintech',
    year: '2023',
    title: 'Payze',
    metricValue: '$2.4M',
    metricLabel: 'Funding Raised'
  }
];

export default function Work() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── SECTION HEADER — Split text-like animation ───
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: '#work', start: 'top 75%', once: true }
      });

      headerTl
        .fromTo('#work .eyebrow', {
          opacity: 0,
          x: -30
        }, {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power3.out'
        })
        .fromTo('#work .heading-lg', {
          opacity: 0,
          y: 60,
          clipPath: 'inset(100% 0 0 0)'
        }, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1,
          ease: 'power4.out'
        }, '-=0.3')
        .fromTo('#work .btn-outline', {
          opacity: 0,
          x: 30
        }, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=0.5');

      // ─── WORK CARDS — dramatic staggered reveal ───
      gsap.utils.toArray('.work-card').forEach((card, i) => {
        const image = card.querySelector('.work-card-image');
        const info = card.querySelector('.work-card-info');
        const metric = card.querySelector('.work-card-metric');

        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            once: true
          }
        });

        // Card container slides up
        cardTl.fromTo(card, {
          y: 80,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out'
        });

        // Image reveals with scale + clip
        if (image) {
          cardTl.fromTo(image, {
            scale: 1.2,
            filter: 'blur(4px)'
          }, {
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.4,
            ease: 'power3.out'
          }, '<0.1');
        }

        // Info fades in
        if (info) {
          cardTl.fromTo(info, {
            opacity: 0,
            y: 20
          }, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out'
          }, '-=0.5');
        }

        // Metric counter animation
        if (metric) {
          cardTl.fromTo(metric, {
            opacity: 0,
            x: -20
          }, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power2.out'
          }, '-=0.3');
        }

        // Image parallax on scroll
        if (image) {
          gsap.to(image, {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5
            }
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <p className="eyebrow">Selected Work</p>
            <h2 className="heading-lg">Real results.<br />Real impact.</h2>
          </div>
          <a href="#" className="btn-outline magnetic">View All Work ↗</a>
        </div>

        <div className="work-grid">
          {cases.map((c, i) => (
            <article
              key={i}
              className={`work-card ${c.type === 'full' ? 'work-card--full' : 'work-card--half'}`}
              data-index={String(i + 1).padStart(2, '0')}
            >
              <div className="work-card-image-wrap">
                <img src={c.image} alt={c.alt} className="work-card-image" />
              </div>
              <div className="work-card-info">
                <div className="work-card-meta">
                  <span className="work-tag">{c.tag}</span>
                  <span className="work-year">{c.year}</span>
                </div>
                <h3 className={c.type === 'full' ? 'heading-md' : 'heading-sm'}>{c.title}</h3>
                {c.description && <p className="body-md">{c.description}</p>}
                <div className="work-card-metric">
                  <span
                    className="metric"
                    style={c.type === 'half' ? { fontSize: 'clamp(36px, 4vw, 56px)' } : undefined}
                  >
                    {c.metricValue}
                  </span>
                  <span className="metric-label">{c.metricLabel}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
