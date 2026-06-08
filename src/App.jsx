import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import PainSolution from './components/PainSolution';
import Services from './components/Services';
import Showcase from './components/Showcase';
import Metrics from './components/Metrics';
import CaseStudies from './components/CaseStudies';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CustomCursor from './components/CustomCursor';
import SectionDots from './components/SectionDots';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [siteVisible, setSiteVisible] = useState(false);

  const handlePreloaderComplete = () => {
    setLoading(false);
    setTimeout(() => setSiteVisible(true), 50);
  };

  useEffect(() => {
    if (!siteVisible) return;

    // Magnetic button effect
    const magneticBtns = document.querySelectorAll('.magnetic');
    const isMobile = 'ontouchstart' in window;

    if (!isMobile) {
      magneticBtns.forEach(btn => {
        const handleMove = (e) => {
          const rect = btn.getBoundingClientRect();
          const relX = e.clientX - rect.left - rect.width / 2;
          const relY = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: relX * 0.35, y: relY * 0.35, duration: 0.6, ease: 'power4.out' });
        };
        const handleLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
        };
        btn.addEventListener('mousemove', handleMove);
        btn.addEventListener('mouseleave', handleLeave);
      });
    }

    // Generic section heading animations
    gsap.utils.toArray('.section-title, .section-header h2').forEach(el => {
      gsap.fromTo(el, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });

    gsap.utils.toArray('.section-subtitle, .section-pill').forEach(el => {
      gsap.fromTo(el, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
  }, [siteVisible]);

  return (
    <>
      {loading && <Preloader onComplete={handlePreloaderComplete} />}
      <div style={{ opacity: siteVisible ? 1 : 0, transform: siteVisible ? 'none' : 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
        <Navbar />
        <SectionDots />
        <main>
          <Hero />
          <Marquee />
          <PainSolution />
          <Services />
          <Showcase />
          <Metrics />
          <CaseStudies />
          <Process />
          <Testimonials />
          <FinalCTA />
        </main>
        <Footer />
        <Toast />
        <CustomCursor />
      </div>
    </>
  );
}
