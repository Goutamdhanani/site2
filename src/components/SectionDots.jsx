import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'services', label: 'Services' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'process', label: 'Process' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'cta', label: 'Contact' },
];

export default function SectionDots() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers = [];
    sections.forEach((section, i) => {
      const el = document.getElementById(section.id);
      if (!el) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActive(i);
      }, { threshold: 0.3 });
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="section-dots">
      {sections.map((s, i) => (
        <div
          key={s.id}
          className={`section-dot${active === i ? ' active' : ''}`}
          onClick={() => scrollToSection(s.id)}
        >
          <span className="tooltip">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
