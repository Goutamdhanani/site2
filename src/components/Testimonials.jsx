import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "'oddwebs rebuilt our entire revenue engine. 320% growth in 6 months. I recommend them to every founder I meet.'",
    name: 'Rahul Kumar',
    role: 'Founder, LunaCart',
    avatar: '/assets/avatar_rahul.png',
    color: 'var(--accent-ember)',
  },
  {
    quote: "'I've worked with 4 agencies before oddwebs. They're the only ones who actually care about your outcomes.'",
    name: 'Ananya Mehta',
    role: 'CEO, DataFlow',
    avatar: '/assets/avatar_ananya.png',
    featured: true,
    color: 'var(--accent-gold)',
  },
  {
    quote: "'They built our fintech MVP in 5 weeks. It directly helped us close our $2.4M seed round.'",
    name: 'Vikram Patel',
    role: 'Co-Founder, Payze',
    avatar: '/assets/avatar_vikram.png',
    color: 'var(--accent-bright)',
  }
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (isLite) {
      // Show testimonial cards immediately on mobile
      gsap.set('.testimonial-card', {
        opacity: 1,
        rotateY: 0,
        y: 0,
        filter: 'blur(0px)'
      });
      return;
    }

    const ctx = gsap.context(() => {

      // ─── SCENIC PARALLAX ANIMATION ───
      gsap.to('.mountain-silhouette--back', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.mountain-silhouette--front', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.scenic-celestial', {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // ─── TESTIMONIAL CARDS: 3D flip stagger from center ───
      const cards = gsap.utils.toArray('.testimonial-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          {
            opacity: 0,
            rotateY: 15,
            y: 50,
            transformPerspective: 800,
            transformOrigin: 'center center',
            filter: 'blur(6px)',
          },
          {
            opacity: 1,
            rotateY: 0,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.0,
            ease: 'power3.out',
            stagger: {
              each: 0.15,
              from: 'center', // middle card first, then outward
            },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
      
      // Individual interactions
      cards.forEach((card, i) => {

        // Parallax vertical float difference
        gsap.to(card, {
          y: -20 * (i + 1) * 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        // 3D hover tilt
        const handleMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateX: y * -10,
            rotateY: x * 10,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 1000,
          });
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
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
    <section id="testimonials" ref={sectionRef} data-scene="testimonials" className="ts-section" style={{ perspective: '1200px' }}>
      <div className="section-glow-line" aria-hidden="true" />

      {/* Scenic Twilight Landscape Background */}
      <div className="scenic-landscape" aria-hidden="true">
        {/* Layer 1: Celestial Moon/Sun Orb */}
        <div className="scenic-celestial" />

        {/* Layer 2: Drifting clouds/fog */}
        <div className="scenic-fog-layer scenic-fog--1" />
        <div className="scenic-fog-layer scenic-fog--2" />

        {/* Layer 3: Mount Fuji Silhouette with Snow Cap (Ukiyo-e Woodblock Style) */}
        <svg className="mountain-silhouette mountain-silhouette--back" viewBox="0 0 1440 320" preserveAspectRatio="none">
          {/* Mount Fuji Base */}
          <path d="M 0,320 L 120,320 C 350,320 580,160 660,75 L 665,70 L 775,70 L 780,75 C 860,160 1090,320 1320,320 L 1440,320 Z" fill="#090504" />
          {/* Glowing Snow Cap */}
          <path d="M 622,118 C 640,105 665,70 665,70 L 775,70 C 775,70 800,105 818,118 C 790,135 775,110 755,130 C 735,108 715,135 695,122 C 675,112 650,132 622,118 Z" fill="var(--accent-gold)" fillOpacity="0.85" />
        </svg>

        {/* Layer 4: Foreground Woodblock Pine Forest Silhouette */}
        <svg className="mountain-silhouette mountain-silhouette--front" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M 0,280 C 100,280 150,250 220,250 C 300,250 380,285 460,260 C 560,230 640,275 720,245 C 800,215 880,265 980,235 C 1080,205 1180,255 1280,225 C 1350,225 1390,240 1440,230 L 1440,320 L 0,320 Z" fill="#040201" />
        </svg>
        
        {/* Layer 5: Glowing Horizon Mist */}
        <div className="scenic-horizon-glow" />
      </div>

      <div className="container ts-container">
        <div className="testimonials-header">
          <p className="eyebrow">Client Voices</p>
          <SplitHeading text="Voices" className="testimonials-big-title" />
          <p className="testimonials-subtitle">
            Partnering with visionary founders to build scalable platforms that redefine online standards.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card ${t.featured ? 'testimonial-card--featured' : ''}`}
              style={{ 
                '--testimonial-color': t.color, 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div className="testimonial-card__quote-mark">“</div>
              <p className="testimonial-card__quote">{t.quote}</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar-wrapper">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="testimonial-card__avatar-img" />
                  ) : (
                    <div
                      className="testimonial-card__avatar-fallback"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
                    >
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="testimonial-card__avatar-ring" style={{ '--ring-color': t.color }} />
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
