import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const testimonials = [
  {
    quote: '"oddwebs rebuilt our entire revenue engine. 320% growth in 6 months. I recommend them to every founder I meet."',
    name: 'Rahul Kumar',
    role: 'Founder, LunaCart',
    featured: false
  },
  {
    quote: '"I\'ve worked with 4 agencies before oddwebs. They\'re the only ones who actually care about your outcomes."',
    name: 'Ananya Mehta',
    role: 'CEO, DataFlow',
    featured: true
  },
  {
    quote: '"They built our fintech MVP in 5 weeks. It directly helped us close our $2.4M seed round."',
    name: 'Vikram Patel',
    role: 'Co-Founder, Payze',
    featured: false
  }
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── EYEBROW ───
      gsap.fromTo('#testimonials .eyebrow', {
        opacity: 0, x: -20
      }, {
        opacity: 1, x: 0,
        duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '#testimonials', start: 'top 80%', once: true }
      });

      // ─── TESTIMONIAL BLOCKS — PREMIUM REVEAL ───
      gsap.utils.toArray('.testimonial-block').forEach((block, i) => {
        const quote = block.querySelector('.testimonial-quote');
        const author = block.querySelector('.testimonial-author');

        const blockTl = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: 'top 85%',
            once: true
          }
        });

        // Quote text — clip-path reveal + blur dissolve
        blockTl.fromTo(quote, {
          opacity: 0,
          y: 40,
          clipPath: 'inset(100% 0 0 0)',
          filter: 'blur(3px)'
        }, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0 0 0)',
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power4.out'
        });

        // Author slides in
        blockTl.fromTo(author, {
          opacity: 0,
          x: -30
        }, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=0.4');

        // Border line draws in (bottom)
        blockTl.fromTo(block, {
          borderBottomColor: 'transparent'
        }, {
          borderBottomColor: 'rgba(10,10,8,0.12)',
          duration: 0.8,
          ease: 'power2.out'
        }, '-=0.6');
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="testimonials" ref={sectionRef}>
      <div className="container">
        <p className="eyebrow">What They Say</p>

        <div className="testimonials-list">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-block ${t.featured ? 'testimonial-block--featured' : ''}`}
            >
              <p className={`testimonial-quote ${t.featured ? 'testimonial-quote--lg' : ''}`}>
                {t.quote}
              </p>
              <div className="testimonial-author">
                <span className="author-name">{t.name}</span>
                <span className="author-sep">—</span>
                <span className="author-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
