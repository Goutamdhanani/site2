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
import PortfolioPage from './components/PortfolioPage';
import BookingFlow from './components/BookingFlow';
import ServicesPage from './components/ServicesPage';

const AtmosphericCanvas = lazy(() => import('./components/AtmosphericCanvas'));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [siteVisible, setSiteVisible] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#portfolio') return 'portfolio';
    if (hash === '#demo') return 'demo';
    if (hash === '#services-page') return 'services-page';
    return 'home';
  });
  const lenisRef = useRef(null);

  // Hash-based view switching listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Kill all GSAP ScrollTriggers BEFORE React unmounts components
      // This removes .pin-spacer wrappers so React's DOM tree matches expectations
      ScrollTrigger.getAll().forEach(t => t.kill());

      // Reset scroll position immediately to prevent page bottom scroll clamp bugs
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        lenis.resize();
      }
      window.scrollTo(0, 0);

      if (hash === '#portfolio') {
        setCurrentView('portfolio');
      } else if (hash === '#demo') {
        setCurrentView('demo');
      } else if (hash === '#services-page') {
        setCurrentView('services-page');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleViewChange = (view, targetAnchor = null) => {
    // Kill all GSAP ScrollTriggers BEFORE React unmounts components
    // This removes .pin-spacer wrappers so React's DOM tree matches expectations
    ScrollTrigger.getAll().forEach(t => t.kill());

    // Reset scroll position immediately before routing to prevent layout clipping
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
    }
    window.scrollTo(0, 0);

    // Sync state directly first
    setCurrentView(view);

    if (view === 'home') {
      if (targetAnchor) {
        window.location.hash = targetAnchor;
      } else {
        window.location.hash = '';
      }
    } else if (view === 'portfolio') {
      window.location.hash = '#portfolio';
    } else if (view === 'demo') {
      window.location.hash = '#demo';
    } else if (view === 'services-page') {
      window.location.hash = '#services-page';
    }
  };

  // Reset scroll position and recalculate layouts after view updates
  useEffect(() => {
    if (!siteVisible) return;
    const lenis = lenisRef.current;
    const hash = window.location.hash;

    // Reset scroll first when switching views to prevent off-screen translations
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
    }
    window.scrollTo(0, 0);

    if (currentView === 'home' && hash && hash !== '#portfolio' && hash !== '#demo') {
      const target = document.querySelector(hash);
      if (target) {
        const timer = setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(target, { offset: 0, duration: 1.4 });
            lenis.resize();
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => {
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
          lenis.resize();
        }
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentView, siteVisible]);

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

    let onScroll = null;
    let cleanupMagnetic = null;

    const ctx = gsap.context(() => {

      // ─── Scroll progress bar ───
      onScroll = () => {
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
        const activeListeners = [];

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
          activeListeners.push({ btn, move, leave });
        });

        cleanupMagnetic = () => {
          activeListeners.forEach(({ btn, move, leave }) => {
            btn.removeEventListener('mousemove', move);
            btn.removeEventListener('mouseleave', leave);
          });
        };
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
        // ─── DESKTOP TRANSITIONS (rewritten to trigger-once for performance and smooth scroll) ───

        // TRANSITION 1: Marquee — Smooth fade and slide up
        const marqueeEl = document.querySelector('[data-scene="marquee"]');
        if (marqueeEl) {
          gsap.fromTo(marqueeEl, {
            y: 30,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: marqueeEl,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          });
        }

        // TRANSITION 2: CaseStudies — Smooth scale up & fade in
        const workEl = document.querySelector('[data-scene="work"]');
        if (workEl) {
          const trackEl = workEl.querySelector('.cs-track');
          if (trackEl) {
            gsap.fromTo(trackEl, {
              scale: 0.94,
              opacity: 0,
            }, {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: workEl,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            });
          }
        }

        // TRANSITION 3: Services — Smooth slide up & fade in
        const servicesEl = document.querySelector('[data-scene="services"]');
        if (servicesEl) {
          gsap.fromTo(servicesEl, {
            y: 40,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: servicesEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        }

        // TRANSITION 4: Metrics — Smooth scale up & fade in
        const metricsEl = document.querySelector('[data-scene="metrics"]');
        if (metricsEl) {
          gsap.fromTo(metricsEl, {
            scale: 0.94,
            opacity: 0,
          }, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: metricsEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        }

        // TRANSITION 5: Process — Smooth scale up & fade in
        const processWrapper = document.querySelector('.process-pin-wrapper');
        const processSection = document.querySelector('#process');
        if (processWrapper && processSection) {
          gsap.fromTo(processSection, {
            scale: 0.94,
            opacity: 0,
          }, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: processWrapper,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        }

        // TRANSITION 6: Testimonials — Smooth slide up & fade in
        const testimonialsEl = document.querySelector('[data-scene="testimonials"]');
        if (testimonialsEl) {
          gsap.fromTo(testimonialsEl, {
            y: 40,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: testimonialsEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        }

        // TRANSITION 7: FinalCTA — Smooth scale up & fade in
        const ctaEl = document.querySelector('[data-scene="cta"]');
        if (ctaEl) {
          gsap.fromTo(ctaEl, {
            scale: 0.94,
            opacity: 0,
          }, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        }

        // TRANSITION 8: Footer — Smooth slide up & fade in
        const footerEl = document.querySelector('[data-scene="footer"]');
        if (footerEl) {
          gsap.fromTo(footerEl, {
            y: 30,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footerEl,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
          });
        }

      } else {
        // ─── LITE MODE: High-performance mobile scroll transitions ───

        // 1. Marquee: fade in & scale in
        const marqueeEl = document.querySelector('[data-scene="marquee"]');
        if (marqueeEl) {
          gsap.fromTo(marqueeEl, { opacity: 0.3, scale: 0.96 }, {
            opacity: 1, scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: marqueeEl,
              start: 'top 95%',
              end: 'top 65%',
              scrub: 1,
            }
          });
        }

        // 2. CaseStudies: simple fade-in of the work section container (since cards slide horizontally)
        const workEl = document.querySelector('[data-scene="work"]');
        if (workEl) {
          gsap.fromTo(workEl, { opacity: 0.4 }, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: workEl,
              start: 'top 95%',
              end: 'top 65%',
              scrub: 1,
            }
          });
        }

        // 3. Services: fade in and slide up
        const servicesEl = document.querySelector('[data-scene="services"]');
        if (servicesEl) {
          gsap.fromTo(servicesEl, { opacity: 0.3, y: 30 }, {
            opacity: 1, y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: servicesEl,
              start: 'top 95%',
              end: 'top 70%',
              scrub: 1,
            }
          });
        }

        // 4. Metrics: fade in and scale in
        const metricsEl = document.querySelector('[data-scene="metrics"]');
        if (metricsEl) {
          gsap.fromTo(metricsEl, { opacity: 0.3, scale: 0.96 }, {
            opacity: 1, scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: metricsEl,
              start: 'top 95%',
              end: 'top 70%',
              scrub: 1,
            }
          });
        }

        // 5. Process: fade in
        const processSection = document.querySelector('#process');
        if (processSection) {
          gsap.fromTo(processSection, { opacity: 0.3 }, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: processSection,
              start: 'top 95%',
              end: 'top 70%',
              scrub: 1,
            }
          });
        }

        // 6. Testimonials: fade in and slide up
        const testimonialsEl = document.querySelector('[data-scene="testimonials"]');
        if (testimonialsEl) {
          gsap.fromTo(testimonialsEl, { opacity: 0.3, y: 30 }, {
            opacity: 1, y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: testimonialsEl,
              start: 'top 95%',
              end: 'top 70%',
              scrub: 1,
            }
          });
        }

        // 7. FinalCTA: fade in and scale in
        const ctaEl = document.querySelector('[data-scene="cta"]');
        if (ctaEl) {
          gsap.fromTo(ctaEl, { opacity: 0.3, scale: 0.95 }, {
            opacity: 1, scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaEl,
              start: 'top 90%',
              end: 'top 70%',
              scrub: 1,
            }
          });
        }

        // 8. Footer: fade in and slide up
        const footerEl = document.querySelector('[data-scene="footer"]');
        if (footerEl) {
          gsap.fromTo(footerEl, { opacity: 0.3, y: 25 }, {
            opacity: 1, y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footerEl,
              start: 'top 98%',
              end: 'top 80%',
              scrub: 1,
            }
          });
        }
      }

      // Refresh ScrollTrigger after all content mounts
      setTimeout(() => ScrollTrigger.refresh(), 300);

    });

    return () => {
      if (onScroll) window.removeEventListener('scroll', onScroll);
      if (cleanupMagnetic) cleanupMagnetic();
      ctx.revert();
    };
  }, [siteVisible, currentView]);

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
        <Navbar currentView={currentView} onViewChange={handleViewChange} />

        {/* Scenes flow as one continuous spatial journey */}
        <main className="cinematic-main">
          {currentView === 'home' ? (
            <>
              <Hero />
              <CaseStudies />
              <Marquee />
              <Services />
              <Metrics />
              <Process />
              <Testimonials />
              <FinalCTA />
            </>
          ) : currentView === 'portfolio' ? (
            <PortfolioPage onViewChange={handleViewChange} />
          ) : currentView === 'services-page' ? (
            <ServicesPage onViewChange={handleViewChange} />
          ) : (
            <BookingFlow onViewChange={handleViewChange} />
          )}
        </main>

        <Footer currentView={currentView} onViewChange={handleViewChange} />

        {/* Cursor */}
        <CustomCursor />
      </div>

      {/* Film grain overlay */}
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
