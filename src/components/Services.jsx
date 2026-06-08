import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VanillaTilt from 'vanilla-tilt';
gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    num: '01', title: 'Web Development',
    icon: '</>', iconBg: 'rgba(6,239,197,0.12)', iconColor: '#06EFC5',
    desc: 'Lightning-fast websites built for performance and conversion.',
    tags: ['Next.js', 'React', 'Webflow', 'SEO-Ready'],
  },
  {
    num: '02', title: 'Mobile Development',
    icon: '📱', iconBg: 'rgba(123,63,228,0.12)', iconColor: '#A78BFA',
    desc: 'Beautiful native apps. Seamless cross-platform experiences.',
    tags: ['iOS', 'Android', 'React Native', 'Flutter'],
  },
  {
    num: '03', title: 'AI & Automation',
    icon: '⚡', iconBg: 'rgba(255,209,102,0.12)', iconColor: '#FFD166',
    desc: 'Smarter workflows powered by AI. Higher productivity, lower cost.',
    tags: ['GPT-4o', 'LangChain', 'n8n', 'Make'],
  },
  {
    num: '04', title: 'UI/UX Design',
    icon: '✦', iconBg: 'rgba(255,95,87,0.12)', iconColor: '#FF5F57',
    desc: 'Interfaces that engage emotionally and convert commercially.',
    tags: ['Figma', 'Prototyping', 'Design Systems', 'Branding'],
  },
  {
    num: '05', title: 'Dashboards & Analytics',
    icon: '📊', iconBg: 'rgba(6,239,197,0.12)', iconColor: '#06EFC5',
    desc: 'Real-time data intelligence. Decisions driven by truth.',
    tags: ['Custom BI', 'Data Viz', 'Reporting', 'APIs'],
  },
  {
    num: '06', title: 'Growth & SEO',
    icon: '📈', iconBg: 'rgba(255,209,102,0.12)', iconColor: '#FFD166',
    desc: 'Rank higher. Convert better. Grow faster.',
    tags: ['Technical SEO', 'CRO', 'Analytics', 'A/B Tests'],
  },
];

export default function Services() {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    const ctx = gsap.context(() => {
      gsap.fromTo(cards, { y: 70, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 85%' }
      });
    });

    // VanillaTilt
    const isMobile = 'ontouchstart' in window;
    if (!isMobile) {
      cards.forEach(card => {
        VanillaTilt.init(card, {
          max: 10, perspective: 1200, glare: true, 'max-glare': 0.12, speed: 400,
        });
      });
    }

    return () => {
      ctx.revert();
      cards.forEach(card => {
        if (card.vanillaTilt) card.vanillaTilt.destroy();
      });
    };
  }, []);

  return (
    <section className="services-section" id="services">
      <div className="section-header">
        <span className="section-pill">[ WHAT WE DO ]</span>
        <h2 className="section-title">
          End-to-end digital solutions that <span className="highlight">scale.</span>
        </h2>
        <p className="section-subtitle">
          From idea to launch and beyond — we are your digital growth partner.
        </p>
      </div>
      <div className="services-grid" ref={gridRef}>
        {services.map((s, i) => (
          <div
            key={i}
            className="service-card"
            ref={el => cardRefs.current[i] = el}
          >
            <div className="service-card-header">
              <div className="service-icon-wrap" style={{ background: s.iconBg }}>
                <span style={{ color: s.iconColor, fontSize: s.icon.length > 2 ? 18 : 16 }}>{s.icon}</span>
              </div>
              <span className="service-number">{s.num}</span>
            </div>
            <h3 className="service-title">{s.title}</h3>
            <p className="service-desc">{s.desc}</p>
            <div className="service-tags">
              {s.tags.map(tag => <span key={tag} className="service-tag">[{tag}]</span>)}
            </div>
            <a href="#cta" className="service-link">
              Learn More <span className="arrow">→</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
