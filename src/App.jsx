import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
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

  // ─── LENIS SMOOTH SCROLL: Cinematic momentum ───
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.8, // Slower for cinematic feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Bridge Lenis → GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  // ─── GLOBAL SCROLL EFFECTS ───
  useEffect(() => {
    if (!siteVisible) return;

    const ctx = gsap.context(() => {

      // Scroll progress bar
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

      // ─── SECTION GLOW LINES ───
      gsap.utils.toArray('.section-glow-line').forEach(line => {
        gsap.fromTo(line, {
          scaleX: 0,
        }, {
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
          x: -30, opacity: 0, filter: 'blur(4px)',
        }, {
          x: 0, opacity: 1, filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });

      // ─── SCENE TRANSITIONS: Cross-dissolve between scenes ───
      const scenes = gsap.utils.toArray('[data-scene]');
      scenes.forEach((scene) => {
        if (scene.id === 'hero') return;

        // Each scene fades/scales slightly as it enters
        gsap.fromTo(scene, {
          opacity: 0.3,
        }, {
          opacity: 1,
          duration: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: scene,
            start: 'top 90%',
            end: 'top 50%',
            scrub: 1,
          },
        });
      });

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

      {/* Layer 0: Three.js atmospheric canvas — persistent, behind everything */}
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
        {/* Layer 5: UI — fixed navbar */}
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

        {/* Layer 5: Cursor */}
        <CustomCursor />
      </div>

      {/* Film grain overlay — always on top */}
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
