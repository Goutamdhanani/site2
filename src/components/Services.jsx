import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, prefersReducedMotion } from '../utils/motion';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: 'Web Development',
    desc: 'Lightning-fast websites built for performance, SEO, and conversion. Next.js, React, Webflow — whatever the job requires.',
    tags: ['Next.js', 'React', 'Webflow', 'SEO'],
    color: 'var(--accent-ember)',
  },
  {
    title: 'Mobile Development',
    desc: 'Native and cross-platform mobile apps that feel at home on every device. iOS, Android, React Native.',
    tags: ['iOS', 'Android', 'React Native'],
    color: 'var(--accent-amber)',
  },
  {
    title: 'Brand & UI/UX',
    desc: 'Distinctive brand identities and pixel-perfect interfaces. Not just pretty — strategically designed to convert.',
    tags: ['Branding', 'Figma', 'Prototyping'],
    color: 'var(--accent-gold)',
  },
  {
    title: 'CMS & Automation',
    desc: 'Content management systems tailored to your workflow. Webflow, Contentful, or custom React admin panels.',
    tags: ['Webflow', 'Contentful', 'Headless CMS'],
    color: 'var(--accent-lacquer)',
  },
  {
    title: 'SEO & Performance',
    desc: 'Speed optimization, core web vitals, and search-optimized copy. Get found and load instantly.',
    tags: ['SEO', 'Analytics', 'Optimization'],
    color: 'var(--accent-bright)',
  },
];

function ServiceRow({ service, index }) {
  const rowRef = useRef(null);
  const numRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rowRef.current,
        start: 'top 75%',
        onEnter: () => {
          // Clip-path unmask
          gsap.fromTo(
            rowRef.current,
            { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0, y: 40 },
            { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0, duration: DUR.slow, ease: EASE.out }
          );

          // Number count up
          if (numRef.current) {
            gsap.fromTo(
              { val: 0 },
              { val: 0 },
              {
                val: index + 1,
                duration: DUR.mid,
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
    <div ref={rowRef} className="sv-row" style={{ '--service-color': service.color }}>
      <div className="sv-row-header">
        <span ref={numRef} className="sv-num">00</span>
        <h3 className="sv-title">{service.title}</h3>
      </div>
      <div className="sv-row-body">
        <p>{service.desc}</p>
        <div className="sv-tags">
          {service.tags.map((tag, j) => (
            <span key={j}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const sectionRef = useRef(null);
  const itemsRef = useRef(null);

  return (
    <section id="services" ref={sectionRef} data-scene="services" className="sv-section">
      <div className="container sv-grid">
        {/* Left Sticky Column */}
        <div className="sv-sticky-wrapper">
          <div className="sv-sticky">
            <span className="sv-label eyebrow">WHAT WE DO</span>
            <SplitHeading text="Services" className="sv-heading" />
            <p className="sv-sub">
              End-to-end digital solutions that <em>scale.</em>
            </p>
          </div>
        </div>

        {/* Right Scrolling Column */}
        <div className="sv-items" ref={itemsRef}>
          {services.map((s, i) => (
            <ServiceRow key={i} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
