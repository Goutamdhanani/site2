import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: '"oddwebs rebuilt our entire revenue engine. 320% growth in 6 months. I recommend them to every founder I meet."',
    name: 'Rahul Kumar',
    role: 'Founder, LunaCart',
    initials: 'RK',
    color: '#8b5cf6',
  },
  {
    quote: '"I\'ve worked with 4 agencies before oddwebs. They\'re the only ones who actually care about your outcomes."',
    name: 'Ananya Mehta',
    role: 'CEO, DataFlow',
    initials: 'AM',
    featured: true,
    color: '#14b8a6',
  },
  {
    quote: '"They built our fintech MVP in 5 weeks. It directly helped us close our $2.4M seed round."',
    name: 'Vikram Patel',
    role: 'Co-Founder, Payze',
    initials: 'VP',
    color: '#f59e0b',
  }
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── TITLE: Unmask reveal ───
      gsap.fromTo('.section-title-reveal', {
        y: 100, opacity: 0, scale: 0.85, filter: 'blur(10px)',
        clipPath: 'inset(100% 0 0 0)',
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.4, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      // ─── TESTIMONIAL CARDS: Emerge from darkness with spotlight ───
      gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
        // Each card emerges from a different angle
        const rotations = [
          { x: 15, y: -10 },
          { x: -8, y: 5 },
          { x: 12, y: 10 },
        ];
        const rot = rotations[i] || { x: 10, y: -5 };

        gsap.fromTo(card, {
          opacity: 0,
          y: 100,
          scale: 0.8,
          rotateX: rot.x,
          rotateY: rot.y,
          filter: 'blur(8px) brightness(0.3)',
          transformPerspective: 1200,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          filter: 'blur(0px) brightness(1)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true,
          },
          delay: i * 0.2,
        });

        // Parallax depth
        gsap.to(card, {
          y: -25 * (i + 1) * 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        // 3D hover tilt
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
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.5)',
          });
        };

        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="testimonials" ref={sectionRef} data-scene="testimonials" style={{ perspective: '1200px' }}>
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container">
        <div className="testimonials-header">
          <p className="eyebrow">Testimonials</p>
          <h2 className="section-title-reveal testimonials-big-title">
            Voices
          </h2>
          <p className="testimonials-subtitle">
            Don't take our word for it — hear from our clients.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card ${t.featured ? 'testimonial-card--featured' : ''}`}
              style={{ '--testimonial-color': t.color, transformStyle: 'preserve-3d' }}
            >
              <div className="testimonial-card__quote-mark">"</div>
              <p className="testimonial-card__quote">{t.quote}</p>
              <div className="testimonial-card__author">
                <div
                  className="testimonial-card__avatar"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
                >
                  {t.initials}
                </div>
                <div>
                  <span className="testimonial-card__name">{t.name}</span>
                  <span className="testimonial-card__role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
