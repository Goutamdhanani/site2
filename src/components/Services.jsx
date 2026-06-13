import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const services = [
  {
    num: '01',
    title: 'Web Development',
    desc: 'Lightning-fast websites built for performance, SEO, and conversion. Next.js, React, Webflow — whatever the job requires.',
    tags: ['Next.js', 'React', 'Webflow', 'SEO'],
    icon: '⚡',
    color: '#8b5cf6'
  },
  {
    num: '02',
    title: 'Mobile Development',
    desc: 'Native and cross-platform mobile apps that feel at home on every device. iOS, Android, React Native.',
    tags: ['iOS', 'Android', 'React Native'],
    icon: '📱',
    color: '#3b82f6'
  },
  {
    num: '03',
    title: 'AI & Automation',
    desc: 'Intelligent workflows and AI-powered tools that eliminate manual work and scale your operations.',
    tags: ['GPT-4o', 'LangChain', 'n8n', 'Make'],
    icon: '🧠',
    color: '#14b8a6'
  },
  {
    num: '04',
    title: 'UI/UX Design',
    desc: 'Interfaces that convert visitors into customers. Every pixel intentional, every interaction considered.',
    tags: ['Figma', 'Prototyping', 'Design Systems'],
    icon: '🎨',
    color: '#ec4899'
  },
  {
    num: '05',
    title: 'Growth & SEO',
    desc: 'Technical SEO, conversion optimisation, and analytics setup that turns traffic into revenue.',
    tags: ['SEO', 'CRO', 'Analytics', 'A/B Tests'],
    icon: '📈',
    color: '#f59e0b'
  }
];

export default function Services() {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Giant section title reveal
      gsap.fromTo('#services .section-title-reveal', {
        y: 100, opacity: 0, scale: 0.9, filter: 'blur(6px)'
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '#services', start: 'top 75%', once: true }
      });

      // Service rows — cinematic staggered reveal
      gsap.utils.toArray('.service-row').forEach((row, i) => {
        gsap.fromTo(row, {
          opacity: 0,
          x: i % 2 === 0 ? -60 : 60,
          clipPath: i % 2 === 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)'
        }, {
          opacity: 1, x: 0,
          clipPath: 'inset(0 0% 0 0%)',
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            once: true
          },
          delay: i * 0.08
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
    const row = document.querySelectorAll('.service-row')[i];
    if (row && openIndex !== i) {
      const body = row.querySelector('.service-row-body');
      if (body) {
        gsap.fromTo(body.children, { opacity: 0, y: 15 }, {
          opacity: 1, y: 0,
          duration: 0.5, stagger: 0.08,
          ease: 'power2.out', delay: 0.15
        });
      }
    }
  };

  return (
    <section id="services" ref={sectionRef}>
      {/* Decorative glow line */}
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="services-header">
          <p className="eyebrow">What We Do</p>
          <h2 className="section-title-reveal services-big-title">
            Services
          </h2>
          <p className="services-subtitle">
            End-to-end digital solutions that <em>scale.</em>
          </p>
        </div>

        <div className="services-list">
          {services.map((s, i) => (
            <div
              key={i}
              className={`service-row ${openIndex === i ? 'open' : ''}`}
              style={{ '--service-color': s.color }}
            >
              <div className="service-row-header" onClick={() => toggle(i)}>
                <span className="service-icon">{s.icon}</span>
                <span className="service-num">{s.num}</span>
                <h3 className="service-title">{s.title}</h3>
                <div className="service-arrow-wrap">
                  <span className="service-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
              <div className="service-row-body">
                <p>{s.desc}</p>
                <div className="service-tags">
                  {s.tags.map((tag, j) => <span key={j}>{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
