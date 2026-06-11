import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const services = [
  {
    num: '01',
    title: 'Web Development',
    desc: 'Lightning-fast websites built for performance, SEO, and conversion. Next.js, React, Webflow — whatever the job requires.',
    tags: ['Next.js', 'React', 'Webflow', 'SEO']
  },
  {
    num: '02',
    title: 'Mobile Development',
    desc: 'Native and cross-platform mobile apps that feel at home on every device. iOS, Android, React Native.',
    tags: ['iOS', 'Android', 'React Native']
  },
  {
    num: '03',
    title: 'AI & Automation',
    desc: 'Intelligent workflows and AI-powered tools that eliminate manual work and scale your operations.',
    tags: ['GPT-4o', 'LangChain', 'n8n', 'Make']
  },
  {
    num: '04',
    title: 'UI/UX Design',
    desc: 'Interfaces that convert visitors into customers. Every pixel intentional, every interaction considered.',
    tags: ['Figma', 'Prototyping', 'Design Systems']
  },
  {
    num: '05',
    title: 'Growth & SEO',
    desc: 'Technical SEO, conversion optimisation, and analytics setup that turns traffic into revenue.',
    tags: ['SEO', 'CRO', 'Analytics', 'A/B Tests']
  }
];

export default function Services() {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── SECTION HEADER ENTRANCE ───
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: '#services', start: 'top 75%', once: true }
      });

      headerTl
        .fromTo('#services .eyebrow', {
          opacity: 0, x: -20
        }, {
          opacity: 1, x: 0,
          duration: 0.6, ease: 'power3.out'
        })
        .fromTo('#services .heading-lg', {
          opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)'
        }, {
          opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
          duration: 1, ease: 'power4.out'
        }, '-=0.3');

      // ─── SERVICE ROWS — STAGGERED SLIDE-IN ───
      gsap.utils.toArray('.service-row').forEach((row, i) => {
        gsap.fromTo(row, {
          opacity: 0,
          x: -40,
          clipPath: 'inset(0 100% 0 0)'
        }, {
          opacity: 1,
          x: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            once: true
          },
          delay: i * 0.05
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);

    // Animate the body open with GSAP for smoother transition
    const row = document.querySelectorAll('.service-row')[i];
    if (row && openIndex !== i) {
      const body = row.querySelector('.service-row-body');
      if (body) {
        gsap.fromTo(body.children, {
          opacity: 0,
          y: 15
        }, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.15
        });
      }
    }
  };

  return (
    <section id="services" ref={sectionRef}>
      {/* Decorative blobs */}
      <div className="section__blobs" aria-hidden="true">
        <div className="blob blob--primary" data-parallax="0.2" style={{ top: '-10%', left: '-15%' }} />
        <div className="blob blob--secondary" data-parallax="0.15" style={{ bottom: '-10%', right: '-10%' }} />
      </div>

      <div className="container">
        <p className="eyebrow" data-animate="fade-up">What We Do</p>
        <h2 className="heading-lg">End-to-end digital<br />solutions that <em>scale.</em></h2>

        <div className="services-list" data-animate="line-draw">
          {services.map((s, i) => (
            <div key={i} className={`service-row ${openIndex === i ? 'open' : ''}`}>
              <div className="service-row-header" onClick={() => toggle(i)}>
                <span className="service-num">{s.num}</span>
                <h3 className="service-title">{s.title}</h3>
                <span className="service-arrow">→</span>
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
