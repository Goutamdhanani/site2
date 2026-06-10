import React, { useState, useEffect, useRef } from 'react';
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

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [siteVisible, setSiteVisible] = useState(false);
  const lenisRef = useRef(null);

  const handlePreloaderComplete = () => {
    setLoading(false);
    // Small delay for DOM to paint
    requestAnimationFrame(() => {
      setSiteVisible(true);
    });
  };

  // Initialize Lenis immediately but keep it paused until site is visible
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
      touchMultiplier: 1.5
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ticker
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!siteVisible) return;

    // Scroll progress bar
    const onScroll = () => {
      const scrollH = document.body.scrollHeight - window.innerHeight;
      if (scrollH <= 0) return;
      const prog = window.scrollY / scrollH;
      const bar = document.querySelector('.scroll-bar');
      if (bar) bar.style.width = (prog * 100) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Magnetic buttons
    const isMobile = 'ontouchstart' in window || window.innerWidth < 900;
    if (!isMobile) {
      const btns = document.querySelectorAll('.magnetic');
      const handlers = [];
      btns.forEach(btn => {
        const move = (e) => {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width / 2) * 0.3,
            y: (e.clientY - r.top - r.height / 2) * 0.3,
            duration: 0.5, ease: 'power4.out'
          });
        };
        const leave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        };
        btn.addEventListener('mousemove', move);
        btn.addEventListener('mouseleave', leave);
        handlers.push({ btn, move, leave });
      });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [siteVisible]);

  return (
    <>
      {loading && <Preloader onComplete={handlePreloaderComplete} />}
      <div className="scroll-bar" style={{ opacity: siteVisible ? 1 : 0 }} />
      <div style={{
        opacity: siteVisible ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}>
        <Navbar />
        <main>
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
        <CustomCursor />
      </div>
    </>
  );
}
