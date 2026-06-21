import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "'oddwebs rebuilt our entire revenue engine. 320% growth in 6 months. I recommend them to every founder I meet.'",
    name: 'Rahul Kumar',
    role: 'Founder, LunaCart',
    initials: 'RK',
    color: 'var(--accent-ember)',
  },
  {
    quote: "'I've worked with 4 agencies before oddwebs. They're the only ones who actually care about your outcomes.'",
    name: 'Ananya Mehta',
    role: 'CEO, DataFlow',
    initials: 'AM',
    featured: true,
    color: 'var(--accent-gold)',
  },
  {
    quote: "'They built our fintech MVP in 5 weeks. It directly helped us close our $2.4M seed round.'",
    name: 'Vikram Patel',
    role: 'Co-Founder, Payze',
    initials: 'VP',
    color: 'var(--accent-bright)',
  }
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── TESTIMONIAL CARDS: 3D flip stagger from center ───
      const cards = gsap.utils.toArray('.testimonial-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          {
            opacity: 0,
            rotateY: 15,
            y: 40,
            transformPerspective: 800,
            transformOrigin: 'center center',
            filter: 'blur(4px)',
          },
          {
            opacity: 1,
            rotateY: 0,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            stagger: {
              each: 0.12,
              from: 'center', // middle card first, then outward
            },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
      
      // Individual interactions
      cards.forEach((card, i) => {

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
          <SplitHeading text="Voices" className="testimonials-big-title" />
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
