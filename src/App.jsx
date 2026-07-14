import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
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
import AboutPage from './components/AboutPage';
import ProcessPage from './components/ProcessPage';
import BookingFlow from './components/BookingFlow';
import ServicesPage from './components/ServicesPage';
import NotFoundPage from './components/NotFoundPage';
import ComplianceBanner from './components/ComplianceBanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { trackEvent, trackPageView } from './utils/analytics';
import { ANALYTICS_EVENTS } from './utils/analyticsEvents';

const AtmosphericCanvas = lazy(() => import('./components/AtmosphericCanvas'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [siteVisible, setSiteVisible] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#portfolio') return 'portfolio';
    if (hash === '#about') return 'about';
    if (hash === '#process') return 'process';
    if (hash === '#demo') return 'demo';
    if (hash === '#services-page') return 'services-page';
    if (hash === '#analytics') return 'analytics';
    if (hash === '#admin') return 'admin';
    if (hash === '' || hash === '#home') return 'home';
    return '404';
  });
  const [adminUser, setAdminUser] = useState(null);
  const lenisRef = useRef(null);

  // Check active admin session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAdminUser(data);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkSession();
  }, []);

  // Hash-based view switching listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Kill all GSAP ScrollTriggers BEFORE React unmounts components
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
      } else if (hash === '#about') {
        setCurrentView('about');
      } else if (hash === '#process') {
        setCurrentView('process');
      } else if (hash === '#demo') {
        setCurrentView('demo');
      } else if (hash === '#services-page') {
        setCurrentView('services-page');
      } else if (hash === '#analytics') {
        setCurrentView('analytics');
      } else if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '' || hash === '#home') {
        setCurrentView('home');
      } else {
        setCurrentView('404');
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
    } else if (view === 'analytics') {
      window.location.hash = '#analytics';
    } else if (view === 'admin') {
      window.location.hash = '#admin';
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

  // Track page view on currentView changes
  useEffect(() => {
    if (!loading) {
      trackPageView(currentView);
    }
  }, [currentView, loading]);

  // Track scroll depth
  useEffect(() => {
    if (!siteVisible || currentView === 'analytics') return;

    let trackedDepths = { 25: false, 50: false, 75: false, 100: false };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const percentage = Math.round((scrollTop / scrollHeight) * 100);

      [25, 50, 75, 100].forEach(depth => {
        if (percentage >= depth && !trackedDepths[depth]) {
          trackedDepths[depth] = true;
          trackEvent(ANALYTICS_EVENTS.SCROLL_DEPTH, {
            depth_percentage: depth,
            page_path: currentView
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [siteVisible, currentView]);

  const handlePreloaderComplete = useCallback(() => {
    setLoading(false);
    setSiteVisible(true);
    trackEvent(ANALYTICS_EVENTS.SITE_LOADED);
  }, []);

  // ─── GLOBAL SAFETY NET ───
  // If preloader or hero frames stall for any reason (network, GSAP error, HMR race),
  // force the site visible after 6 seconds so the user never sees a blank screen.
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!siteVisible) {
        console.warn('[Safety] Forcing site visible after 6s timeout');
        setLoading(false);
        setSiteVisible(true);
      }
    }, 6000);
    return () => clearTimeout(safetyTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── LENIS SMOOTH SCROLL (desktop only) ───
  useEffect(() => {
    // Only initialize Lenis when the preloader has finished and the site is visible
    if (isLite || !siteVisible) return;

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
      window.lenis = lenis;

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
      if (lenis) {
        lenis.destroy();
        window.lenis = null;
      }
    };
  }, [siteVisible]);

  // ─── SECTION TRANSITIONS + GLOBAL EFFECTS ───
  useEffect(() => {
    if (!siteVisible) return;
    // Only register home-page section animations when the home view is active.
    // Skipping this for other views prevents re-setting opacity:0 on sections
    // that are still in DOM (or were rendered previously).

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

      // ─── SECTION GLOW LINES + EYEBROW: Draw in (home view only) ───
      if (currentView === 'home') {
      gsap.utils.toArray('.section-glow-line').forEach(line => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: line.closest('section') || line.parentElement,
            start: 'top 80%',
            once: true,
            invalidateOnRefresh: true,
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
          clearProps: 'all',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });
      } // end if (currentView === 'home') for glow lines + eyebrows

      // ═══════════════════════════════════════════════════════
      //  SECTION TRANSITIONS (home view only)
      //  Desktop: cinematic fade/scale transitions
      //  Lite: simple opacity + translateY
      // ═══════════════════════════════════════════════════════
      if (currentView === 'home') {
      if (!isLite) {
        // ─── DESKTOP TRANSITIONS ───
        // Each section starts hidden and animates in when scrolled into view.
        // invalidateOnRefresh: true ensures scroll positions recalculate after
        // images/fonts load (which shift layout). onEnter also fires if section
        // is already in view when ScrollTrigger is created.

        const makeSectionTween = (el, fromVars, toVars, triggerStart = 'top 90%') => {
          if (!el) return;
          gsap.fromTo(el, fromVars, {
            ...toVars,
            clearProps: 'all',
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              toggleActions: 'play none none none',
              invalidateOnRefresh: true,
              onEnter: () => {
                // If already in view when registered, play immediately
                gsap.to(el, { ...toVars, clearProps: 'all', duration: toVars.duration || 0.8 });
              },
            },
          });
        };

        // TRANSITION 1: Marquee
        makeSectionTween(
          document.querySelector('[data-scene="marquee"]'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          'top 95%'
        );

        // TRANSITION 2: CaseStudies track
        const workEl = document.querySelector('[data-scene="work"]');
        if (workEl) {
          const trackEl = workEl.querySelector('.cs-track');
          if (trackEl) {
            gsap.fromTo(trackEl,
              { scale: 0.96, opacity: 0 },
              {
                scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out',
                clearProps: 'all',
                scrollTrigger: {
                  trigger: workEl,
                  start: 'top 90%',
                  toggleActions: 'play none none none',
                  invalidateOnRefresh: true,
                },
              }
            );
          }
        }

        // TRANSITION 3: Services
        makeSectionTween(
          document.querySelector('[data-scene="services"]'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          'top 90%'
        );

        // TRANSITION 4: Metrics
        makeSectionTween(
          document.querySelector('[data-scene="metrics"]'),
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
          'top 90%'
        );

        // TRANSITION 5: Process
        const processSection = document.querySelector('#process');
        if (processSection) {
          const processTrigger = document.querySelector('.process-pin-wrapper') || processSection;
          gsap.fromTo(processSection,
            { scale: 0.96, opacity: 0 },
            {
              scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out',
              clearProps: 'all',
              scrollTrigger: {
                trigger: processTrigger,
                start: 'top 90%',
                toggleActions: 'play none none none',
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // TRANSITION 6: Testimonials
        makeSectionTween(
          document.querySelector('[data-scene="testimonials"]'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          'top 90%'
        );

        // TRANSITION 7: FinalCTA
        makeSectionTween(
          document.querySelector('[data-scene="cta"]'),
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
          'top 90%'
        );

        // TRANSITION 8: Footer
        makeSectionTween(
          document.querySelector('[data-scene="footer"]'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          'top 98%'
        );

      } else {
        // ─── LITE MODE: Simple fade-in only (no scrub — scrub can get stuck mid-animation) ───
        // On mobile, scrub animations lock at an intermediate opacity if ScrollTrigger
        // miscalculates positions. Use play-once instead.

        const makeLiteTween = (el, triggerStart = 'top 95%') => {
          if (!el) return;
          // Set initial hidden state via JS (not CSS so it's always overridable)
          gsap.set(el, { opacity: 0, y: 20 });
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all',
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              toggleActions: 'play none none none',
              invalidateOnRefresh: true,
            },
          });
        };

        makeLiteTween(document.querySelector('[data-scene="marquee"]'), 'top 95%');
        makeLiteTween(document.querySelector('[data-scene="work"]'), 'top 95%');
        makeLiteTween(document.querySelector('[data-scene="services"]'), 'top 95%');
        makeLiteTween(document.querySelector('[data-scene="metrics"]'), 'top 95%');
        makeLiteTween(document.querySelector('#process'), 'top 95%');
        makeLiteTween(document.querySelector('[data-scene="testimonials"]'), 'top 95%');
        makeLiteTween(document.querySelector('[data-scene="cta"]'), 'top 95%');
        makeLiteTween(document.querySelector('[data-scene="footer"]'), 'top 99%');
      } // end if(!isLite) / else

      } // end if (currentView === 'home') for section transitions

      // ─── AGGRESSIVE REFRESH SCHEDULE ───
      // Images and fonts shift layout long after mount; refresh repeatedly
      // to ensure all scroll positions are accurate.
      [100, 300, 600, 1200, 2500, 4000].forEach(delay =>
        setTimeout(() => ScrollTrigger.refresh(), delay)
      );

      // ─── SAFETY NET: Clear any stuck GSAP inline styles after 5s ───
      // If a ScrollTrigger never fires (rare race condition), elements would
      // stay invisible. This guarantee ensures content is always visible.
      setTimeout(() => {
        const safetyTargets = [
          '[data-scene="marquee"]',
          '[data-scene="work"]',
          '[data-scene="services"]',
          '[data-scene="metrics"]',
          '#process',
          '[data-scene="testimonials"]',
          '[data-scene="cta"]',
          '[data-scene="footer"]',
          '.cs-track',
          '.eyebrow',
          '.section-glow-line',
        ];
        safetyTargets.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            // Only clear if element looks stuck invisible
            const style = el.style;
            if (style.opacity === '0' || (style.opacity && parseFloat(style.opacity) < 0.5)) {
              gsap.set(el, { clearProps: 'all' });
            }
          });
        });
      }, 5000);

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

  if (currentView === 'admin') {
    return (
      <Suspense fallback={<div className="skeleton-loading-full">Loading CRM Control Centre...</div>}>
        {adminUser ? (
          <AdminLayout adminUser={adminUser} onLogout={() => setAdminUser(null)} />
        ) : (
          <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />
        )}
        <div className="film-grain" aria-hidden="true" />
      </Suspense>
    );
  }

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
              <FinalCTA onViewChange={handleViewChange} />
            </>
          ) : currentView === 'portfolio' ? (
            <PortfolioPage onViewChange={handleViewChange} />
          ) : currentView === 'about' ? (
            <AboutPage onViewChange={handleViewChange} />
          ) : currentView === 'process' ? (
            <ProcessPage onViewChange={handleViewChange} />
          ) : currentView === 'services-page' ? (
            <ServicesPage onViewChange={handleViewChange} />
          ) : currentView === 'analytics' ? (
            <AnalyticsDashboard onViewChange={handleViewChange} adminUser={adminUser} />
          ) : currentView === 'demo' ? (
            <BookingFlow onViewChange={handleViewChange} />
          ) : (
            <NotFoundPage onViewChange={handleViewChange} />
          )}
        </main>

        <Footer currentView={currentView} onViewChange={handleViewChange} />

        {/* Consent Banner */}
        <ComplianceBanner />

        {/* Cursor */}
        <CustomCursor />
      </div>

      {/* Film grain overlay */}
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
