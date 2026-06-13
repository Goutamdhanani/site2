import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const testimonials = [
  {
    quote: '"oddwebs rebuilt our entire revenue engine. 320% growth in 6 months. I recommend them to every founder I meet."',
    name: 'Rahul Kumar',
    role: 'Founder, LunaCart',
    avatar: '🚀'
  },
  {
    quote: '"I\'ve worked with 4 agencies before oddwebs. They\'re the only ones who actually care about your outcomes."',
    name: 'Ananya Mehta',
    role: 'CEO, DataFlow',
    avatar: '⭐',
    featured: true
  },
  {
    quote: '"They built our fintech MVP in 5 weeks. It directly helped us close our $2.4M seed round."',
    name: 'Vikram Patel',
    role: 'Co-Founder, Payze',
    avatar: '💎'
  }
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Giant title
      gsap.fromTo('#testimonials .section-title-reveal', {
        y: 80, opacity: 0, scale: 0.9, filter: 'blur(4px)'
      }, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#testimonials', start: 'top 75%', once: true }
      });

      // Testimonial cards stagger
      gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
        gsap.fromTo(card, {
          opacity: 0, y: 60, scale: 0.95
        }, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          delay: i * 0.15
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="testimonials" ref={sectionRef}>
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
            >
              <div className="testimonial-card__quote-mark">"</div>
              <p className="testimonial-card__quote">{t.quote}</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.avatar}</div>
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
