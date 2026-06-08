import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VanillaTilt from 'vanilla-tilt';
gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    initials: 'RK', gradient: 'linear-gradient(135deg, #7B3FE4, #A78BFA)',
    name: 'Rahul Kumar', role: 'Founder, LunaCart',
    quote: "oddwebs didn't just build our website — they rebuilt our entire revenue engine. 320% growth in 6 months speaks for itself. I recommend them to every founder I meet.",
  },
  {
    initials: 'AM', gradient: 'linear-gradient(135deg, #06EFC5, #A78BFA)',
    name: 'Ananya Mehta', role: 'CEO, DataFlow', featured: true,
    quote: "I've worked with 4 agencies before oddwebs. The difference? They actually care about your business outcomes, not just delivering files. Our churn dropped 45% and our revenue grew.",
  },
  {
    initials: 'VP', gradient: 'linear-gradient(135deg, #FFD166, #FF5F57)',
    name: 'Vikram Patel', role: 'Co-Founder, Payze',
    quote: "They built our fintech MVP in 5 weeks flat. It directly helped us close our $2.4M seed round. The ROI of hiring oddwebs was immeasurable.",
  },
];

export default function Testimonials() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    /* Atmospheric particles */
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const isMobile = 'ontouchstart' in window;
    const count = isMobile ? 400 : 800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x7B3FE4, size: 0.02, transparent: true, opacity: 0.15 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;
      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) animate();
      else cancelAnimationFrame(animId);
    }, { threshold: 0.1 });
    observer.observe(sectionRef.current);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geo.dispose(); mat.dispose();
    };
  }, []);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    const ctx = gsap.context(() => {
      gsap.fromTo(cards, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: cards[0], start: 'top 85%' }
      });
    });

    const isMobile = 'ontouchstart' in window;
    if (!isMobile) {
      cards.forEach(card => {
        VanillaTilt.init(card, { max: 8, perspective: 1200, glare: true, 'max-glare': 0.08, speed: 400 });
      });
    }

    return () => {
      ctx.revert();
      cards.forEach(card => { if (card.vanillaTilt) card.vanillaTilt.destroy(); });
    };
  }, []);

  return (
    <section className="testimonials-section" ref={sectionRef} id="testimonials">
      <canvas ref={canvasRef} className="testimonials-canvas" />
      <div className="testimonials-content">
        <div className="section-header">
          <h2 className="section-title">Don't take our word for it.</h2>
          <p className="section-subtitle">Here's what founders say after working with us.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card${t.featured ? ' featured' : ''}`}
              ref={el => cardRefs.current[i] = el}
            >
              <span className="testimonial-quote-mark">"</span>
              <div className="testimonial-header">
                <div className="testimonial-avatar" style={{ background: t.gradient }}>{t.initials}</div>
                <div className="testimonial-info">
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
