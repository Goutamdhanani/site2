import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import CaseStudies from './components/CaseStudies';
import Services from './components/Services';
import Metrics from './components/Metrics';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';

const AtmosphericCanvas = lazy(() => import('./components/AtmosphericCanvas'));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [siteVisible, setSiteVisible] = useState(false);
  const lenisRef = useRef(null);

  const handlePreloaderComplete = () => {
    setLoading(false);
    requestAnimationFrame(() => {
      setSiteVisible(true);
    });
  };

  // ─── LENIS SMOOTH SCROLL ───
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    // ─── VELOCITY-BASED DISTORTION ───
    lenis.on('scroll', ({ velocity }) => {
      const absVel = Math.min(Math.abs(velocity), 5);
      const norm = absVel / 5; // 0→1

      // Marquee skews with velocity
      const marquee = document.querySelector('.marquee-strip');
      if (marquee) {
        gsap.to(marquee, {
          skewX: velocity * 1.2,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      // Background blobs stretch with velocity
      gsap.utils.toArray('.atmos-grad-blob').forEach(blob => {
        gsap.to(blob, {
          scaleY: 1 + norm * 0.3,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    });

    // ─── ANCHOR LINK CLICK INTERCEPTOR FOR SMOOTH SCROLLING ───
    const handleAnchorClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href;
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: 0,
            duration: 1.6,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  // ─── AWWWARDS-LEVEL SECTION TRANSITIONS + GLOBAL EFFECTS ───
  useEffect(() => {
    if (!siteVisible) return;

    const ctx = gsap.context(() => {

      // ─── Scroll progress bar ───
      const onScroll = () => {
        const scrollH = document.body.scrollHeight - window.innerHeight;
        if (scrollH <= 0) return;
        const prog = window.scrollY / scrollH;
        const bar = document.querySelector('.scroll-bar');
        if (bar) bar.style.width = (prog * 100) + '%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      // ─── MAGNETIC BUTTONS ───
      const isMobile = 'ontouchstart' in window || window.innerWidth < 900;
      if (!isMobile) {
        const btns = document.querySelectorAll('.magnetic');
        btns.forEach(btn => {
          const move = (e) => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, {
              x: (e.clientX - r.left - r.width / 2) * 0.35,
              y: (e.clientY - r.top - r.height / 2) * 0.35,
              duration: 0.4,
              ease: 'power2.out',
            });
          };
          const leave = () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
          };
          btn.addEventListener('mousemove', move);
          btn.addEventListener('mouseleave', leave);
        });
      }

      // ─── SECTION GLOW LINES: Draw in ───
      gsap.utils.toArray('.section-glow-line').forEach(line => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: line.closest('section') || line.parentElement,
            start: 'top 80%',
            once: true,
          },
        });
      });

      // ─── EYEBROW LABELS: Line draws + tracking animation ───
      gsap.utils.toArray('.eyebrow').forEach(el => {
        if (el.closest('#hero')) return;
        gsap.fromTo(el, {
          x: -30, opacity: 0, filter: 'blur(4px)',
          letterSpacing: '0.25em',
        }, {
          x: 0, opacity: 1, filter: 'blur(0px)',
          letterSpacing: '0.12em',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });

      // ═══════════════════════════════════════════════════════
      //  AWWWARDS SECTION TRANSITIONS
      //  Each section has a unique scroll-driven entrance
      // ═══════════════════════════════════════════════════════

      // ─── TRANSITION 1: Marquee — Clip-path unmask from bottom ───
      const marqueeEl = document.querySelector('[data-scene="marquee"]');
      if (marqueeEl) {
        gsap.fromTo(marqueeEl, {
          clipPath: 'inset(100% 0 0 0)',
          opacity: 0.5,
        }, {
          clipPath: 'inset(0% 0 0 0)',
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: marqueeEl,
            start: 'top 95%',
            end: 'top 60%',
            scrub: 1,
          },
        });
      }

      // ─── TRANSITION 2: CaseStudies — Zoom-in reveal with blur dissolve ───
      const workEl = document.querySelector('[data-scene="work"]');
      if (workEl) {
        gsap.fromTo(workEl, {
          scale: 0.82,
          opacity: 0,
          filter: 'blur(16px) brightness(1.8)',
          transformOrigin: 'center center',
        }, {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          ease: 'none',
          scrollTrigger: {
            trigger: workEl,
            start: 'top 95%',
            end: 'top 45%',
            scrub: 1.2,
          },
        });
      }

      // ─── TRANSITION 3: Services — Split from center (horizontal wipe) ───
      const servicesEl = document.querySelector('[data-scene="services"]');
      if (servicesEl) {
        gsap.fromTo(servicesEl, {
          clipPath: 'inset(0 50% 0 50%)',
          opacity: 0,
        }, {
          clipPath: 'inset(0 0% 0 0%)',
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: servicesEl,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 1,
          },
        });
      }

      // ─── TRANSITION 4: Metrics — 3D Page flip rotation ───
      const metricsEl = document.querySelector('[data-scene="metrics"]');
      if (metricsEl) {
        gsap.fromTo(metricsEl, {
          rotateX: -10,
          scale: 0.88,
          opacity: 0,
          transformOrigin: 'center bottom',
          filter: 'blur(8px)',
        }, {
          rotateX: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: metricsEl,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 1,
          },
        });
      }

      // ─── TRANSITION 5: Process — Radial circle expand ───
      const processEl = document.querySelector('[data-scene="process"]');
      if (processEl) {
        gsap.fromTo(processEl, {
          clipPath: 'circle(0% at 50% 50%)',
          opacity: 0,
        }, {
          clipPath: 'circle(150% at 50% 50%)',
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: processEl,
            start: 'top 90%',
            end: 'top 30%',
            scrub: 1,
          },
        });
      }

      // ─── TRANSITION 6: Testimonials — Vertical blinds reveal ───
      const testimonialsEl = document.querySelector('[data-scene="testimonials"]');
      if (testimonialsEl) {
        gsap.fromTo(testimonialsEl, {
          clipPath: 'inset(0 0 100% 0)',
          y: 80,
          opacity: 0,
          filter: 'blur(6px)',
        }, {
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: testimonialsEl,
            start: 'top 90%',
            end: 'top 35%',
            scrub: 1,
          },
        });
      }

      // ─── TRANSITION 7: FinalCTA — Zoom + white flash ───
      const ctaEl = document.querySelector('[data-scene="cta"]');
      if (ctaEl) {
        gsap.fromTo(ctaEl, {
          scale: 0.7,
          opacity: 0,
          filter: 'blur(20px) brightness(2.5)',
        }, {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          ease: 'none',
          scrollTrigger: {
            trigger: ctaEl,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 1.2,
          },
        });
      }

      // ─── TRANSITION 8: Footer — Rise from depth ───
      const footerEl = document.querySelector('[data-scene="footer"]');
      if (footerEl) {
        gsap.fromTo(footerEl, {
          y: 100,
          opacity: 0,
          filter: 'blur(8px)',
        }, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: footerEl,
            start: 'top 95%',
            end: 'top 60%',
            scrub: 1,
          },
        });
      }

      // Refresh ScrollTrigger after all content mounts
      setTimeout(() => ScrollTrigger.refresh(), 300);

    });

    return () => ctx.revert();
  }, [siteVisible]);

  return (
    <>
      {/* Preloader */}
      {loading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Scroll progress bar */}
      <div className="scroll-bar" style={{ opacity: siteVisible ? 1 : 0 }} />

      {/* Layer 0: Animated atmospheric canvas — persistent, behind everything */}
      <Suspense fallback={null}>
        <AtmosphericCanvas />
      </Suspense>

      {/* Main content layers */}
      <div
        className="cinematic-wrapper"
        style={{
          opacity: siteVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Fixed navbar */}
        <Navbar />

        {/* Scenes flow as one continuous spatial journey */}
        <main className="cinematic-main">
          <Hero />
          <Marquee />
          <CaseStudies />
          <Services />
          <Metrics />
          <Process />
          <Testimonials />
          <FinalCTA />
        </main>

        <Footer />

        {/* Cursor */}
        <CustomCursor />
      </div>

      {/* Film grain overlay */}
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
