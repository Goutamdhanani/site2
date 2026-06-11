import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function FinalCTA() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 65%',
          once: true
        }
      });

      // Eyebrow fades in
      ctaTl.fromTo('#contact .eyebrow', {
        opacity: 0, y: 15
      }, {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power2.out'
      });

      // Headline — dramatic line-by-line clip reveal
      ctaTl.fromTo('.cta-headline', {
        opacity: 0,
        y: 80,
        clipPath: 'inset(100% 0 0 0)',
        filter: 'blur(6px)'
      }, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power4.out'
      }, '-=0.2');

      // Subtitle
      ctaTl.fromTo('.cta-sub', {
        opacity: 0, y: 30
      }, {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out'
      }, '-=0.6');

      // CTA buttons — pop with scale
      ctaTl.fromTo('.cta-actions', {
        opacity: 0, y: 25, scale: 0.95
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, ease: 'back.out(1.5)'
      }, '-=0.4');

      // Note
      ctaTl.fromTo('.cta-note', {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.5, ease: 'power2.out'
      }, '-=0.2');

      // Urgency badge — scale bounce
      ctaTl.fromTo('.cta-urgency', {
        opacity: 0, scale: 0.8
      }, {
        opacity: 1, scale: 1,
        duration: 0.6, ease: 'elastic.out(1, 0.5)'
      }, '-=0.2');

      // ─── FLOATING ASTEROID IN CTA BACKGROUND ───
      gsap.fromTo('.cta-asteroid', {
        opacity: 0,
        rotation: -20,
        scale: 0.6
      }, {
        opacity: 0.08,
        rotation: 0,
        scale: 1,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 60%',
          once: true
        }
      });

      // Asteroid subtle float on scroll
      gsap.to('.cta-asteroid', {
        yPercent: -20,
        rotation: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef}>
      {/* Dark decorative blobs */}
      <div className="cta-blobs" aria-hidden="true">
        <div className="blob blob--dark-primary cta-blob-1" data-parallax="0.2" />
        <div className="blob blob--dark-secondary cta-blob-2" data-parallax="0.15" />
      </div>

      {/* Background asteroid from user's uploaded media */}
      <img
        src="/assets/asteroid.png"
        alt=""
        className="cta-asteroid"
        aria-hidden="true"
      />

      <div className="cta-inner">
        <p className="eyebrow" style={{ textAlign: 'center' }}>Start a Project</p>

        <h2 className="cta-headline">
          Ready to build<br />
          something<br />
          <em>extraordinary?</em>
        </h2>

        <p className="cta-sub">
          Book a free 30-minute call. No pitch decks.<br />
          No fluff. Just honest advice.
        </p>

        <div className="cta-actions">
          <a href="#" className="btn-primary btn-large magnetic">
            Book a Free Call ↗
          </a>
          <a href="https://wa.me/" className="btn-ghost">
            Or chat on WhatsApp
          </a>
        </div>

        <p className="cta-note">Typically replies within 2 hours · hello@oddwebs.com</p>

        <div className="cta-urgency">
          Only 3 client slots open this month
        </div>
      </div>
    </section>
  );
}
