import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLite } from './utils/device';

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

  // ─── LENIS SMOOTH SCROLL (desktop only) ───
  useEffect(() => {
    // Lite mode: skip Lenis entirely — use native scroll
    if (isLite) return;

    // Dynamic import Lenis only when needed (desktop)
    let lenis = null;
    let onTick = null;
    let handleAnchorClick = null;

    import('@studio-freight/lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      lenis.on('scroll', ScrollTrigger.update);

      // ─── VELOCITY-BASED DISTORTION (desktop only) ───
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
      const runPortalTeleport = (targetElement) => {
        const overlay = document.querySelector('.teleport-portal-overlay');
        const portal = document.querySelector('.teleport-portal');
        const flash = document.querySelector('.teleport-flash');
        const heroUI = document.querySelector('#hero .hero-ui-layer');
        const heroCanvas = document.querySelector('#hero .hero-canvas-container');

        if (!overlay || !portal || !flash) {
          lenis.scrollTo(targetElement, {
            offset: 0,
            duration: 1.6,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          return;
        }

        // Disable scroll
        lenis.stop();

        // GSAP Timeline
        const tl = gsap.timeline({
          onComplete: () => {
            // Reset Hero UI styles for scroll-back visibility
            gsap.set(heroUI, { scale: 1, y: 0, opacity: 1, filter: 'none' });
            gsap.set(heroCanvas, { scale: 1, opacity: 1, filter: 'none' });
            gsap.set(overlay, { opacity: 0, pointerEvents: 'none' });
            // Enable scroll
            lenis.start();
          }
        });

        // 1. Setup overlay visibility
        tl.set(overlay, { opacity: 1, pointerEvents: 'auto' });

        // 2. Zoom & fade out Hero components
        tl.to([heroUI, heroCanvas], {
          scale: 0.75,
          opacity: 0,
          filter: 'blur(20px) brightness(2.0)',
          duration: 0.8,
          ease: 'power2.inOut'
        }, 0);

        // 3. Expand portal circle from center
        tl.to(portal, {
          scale: 30,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.in'
        }, 0);

        // 4. White flash transition peak
        tl.to(flash, {
          opacity: 1,
          duration: 0.15,
          ease: 'power1.out'
        }, 0.75);

        // 5. Snap scroll and setup Case Studies target state
        tl.add(() => {
          lenis.scrollTo(targetElement, { immediate: true });
          gsap.set(targetElement, {
            scale: 0.85,
            filter: 'blur(15px) brightness(1.6)',
            transformOrigin: 'center center'
          });
        }, 0.85);

        // 6. Fade out flash and reveal Case Studies with clean zoom-in
        tl.to(flash, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0.9);

        tl.to(portal, {
          opacity: 0,
          scale: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0.9);

        tl.to(targetElement, {
          scale: 1,
          filter: 'blur(0px) brightness(1)',
          clearProps: 'scale,filter,transformOrigin',
          duration: 1.0,
          ease: 'power3.out'
        }, 0.9);
      };

      handleAnchorClick = (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href;
          if (targetId === '#') return;

          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            if (targetId === '#work' && window.scrollY < window.innerHeight * 0.5) {
              runPortalTeleport(targetElement);
            } else {
              lenis.scrollTo(targetElement, {
                offset: 0,
                duration: 1.6,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              });
            }
          }
        }
      };

      document.addEventListener('click', handleAnchorClick);

      onTick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      if (onTick) gsap.ticker.remove(onTick);
      if (handleAnchorClick) document.removeEventListener('click', handleAnchorClick);
      if (lenis) lenis.destroy();
    };
  }, []);

  // ─── SECTION TRANSITIONS + GLOBAL EFFECTS ───
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

      // ─── MAGNETIC BUTTONS (desktop only) ───
      if (!isLite) {
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

      // ─── EYEBROW LABELS ───
      gsap.utils.toArray('.eyebrow').forEach(el => {
        if (el.closest('#hero')) return;
        gsap.fromTo(el, {
          x: -30, opacity: 0,
          letterSpacing: '0.25em',
        }, {
          x: 0, opacity: 1,
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
      //  SECTION TRANSITIONS
      //  Desktop: cinematic blur/clip-path/filter transitions
      //  Lite: cheap opacity + translateY (transform/opacity only)
      // ═══════════════════════════════════════════════════════

      if (!isLite) {
        // ─── DESKTOP TRANSITIONS (original cinematic effects) ───

        // TRANSITION 1: Marquee — Clip-path unmask from bottom
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

        // TRANSITION 2: CaseStudies — Zoom-in reveal with blur dissolve
        const workEl = document.querySelector('[data-scene="work"]');
        if (workEl) {
          const trackEl = workEl.querySelector('.cs-track');
          if (trackEl) {
            gsap.fromTo(trackEl, {
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
        }

        // TRANSITION 3: Services — Split from center (horizontal wipe)
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

        // TRANSITION 4: Metrics — 3D Page flip rotation
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

        // TRANSITION 5: Process — Radial circle expand
        const processWrapper = document.querySelector('.process-pin-wrapper');
        const processSection = document.querySelector('#process');
        if (processWrapper && processSection) {
          gsap.fromTo(processSection, {
            clipPath: 'circle(0% at 50% 50%)',
            opacity: 0,
          }, {
            clipPath: 'circle(150% at 50% 50%)',
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: processWrapper,
              start: 'top 90%',
              end: 'top 30%',
              scrub: 1,
            },
          });
        }

        // TRANSITION 6: Testimonials — Vertical blinds reveal
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

        // TRANSITION 7: FinalCTA — Zoom + white flash
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

        // TRANSITION 8: Footer — Rise from depth
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

      } else {
        // ─── LITE MODE: No section transitions needed ───
        // CSS @media (max-width: 900px) forces all [data-scene] to
        // opacity:1, transform:none, filter:none, clip-path:none.
        // Sections are visible natively — zero GSAP overhead on scroll.
      }

      // Refresh ScrollTrigger after all content mounts
      setTimeout(() => ScrollTrigger.refresh(), 300);

    });

    return () => ctx.revert();
  }, [siteVisible]);

  // ─── REFRESH SCROLLTRIGGER ON LAYOUT SHIFTS (images, fonts) ───
  useEffect(() => {
    if (!siteVisible) return;

    // Refresh when fonts are loaded and layout shifts occur
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    // Refresh when images finish loading (capturing phase)
    const handleImageLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleImageLoad, true);

    // Occasional periodic refreshes during initial seconds to catch late renders
    const intervals = [500, 1000, 2000, 4000].map(delay => 
      setTimeout(() => ScrollTrigger.refresh(), delay)
    );

    return () => {
      window.removeEventListener('load', handleImageLoad, true);
      intervals.forEach(clearTimeout);
    };
  }, [siteVisible]);

  return (
    <>
      {/* Preloader */}
      {loading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Scroll progress bar */}
      <div className="scroll-bar" style={{ opacity: siteVisible ? 1 : 0 }} />

      {/* Teleport Portal Overlay */}
      <div className="teleport-portal-overlay" style={{ opacity: 0, pointerEvents: 'none' }}>
        <div className="teleport-portal" />
        <div className="teleport-flash" />
      </div>

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
          <CaseStudies />
          <Marquee />
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
