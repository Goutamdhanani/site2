import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const imagesRef = useRef([]);
  const [loaded, setLoaded] = useState(false);
  const totalFrames = 118; // Extracted frames

  useEffect(() => {
    // 1. Preload images with load error protection
    let loadedCount = 0;
    const images = [];

    const handleFrameLoad = () => {
      loadedCount++;
      if (loadedCount === totalFrames) {
        setLoaded(true);
      }
    };
    
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, '0');
      img.src = `/assets/sequence/frame_${frameNum}.webp`;
      
      img.onload = handleFrameLoad;
      img.onerror = () => {
        console.warn(`Failed to load frame_${frameNum}.webp - skipping to prevent page freeze.`);
        handleFrameLoad();
      };
      
      images.push(img);
    }
    
    imagesRef.current = images;
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    // Responsive Canvas Resizing using client bounding rect of container parent
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      renderFrame(0);
    };

    const renderFrame = (index) => {
      const img = imagesRef.current[index];
      if (!img || !img.width || !img.height) return; // Protect against invalid/empty images
      
      // Draw image to cover canvas (object-fit: cover logic)
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgRatio > canvasRatio) {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial draw

    // 2. Set up ScrollTrigger Animation
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%', // Pin for 3 times the screen height
          scrub: 0.15, // Butter-smooth scroll catch-up
          pin: true, // Native GSAP pinning locks the section in viewport
          pinSpacing: true,
        }
      });

      // Frame scrubbing runs full duration (10s)
      const frameObj = { frame: 0 };
      tl.to(frameObj, {
        frame: totalFrames - 1,
        ease: 'none',
        duration: 10,
        onUpdate: () => {
          const currentFrame = Math.round(frameObj.frame);
          renderFrame(currentFrame);
        }
      }, 0);
      
      // UI fading out early (0 to 3.5s)
      tl.to('.hero-ui-layer', {
        opacity: 0,
        y: -100,
        filter: 'blur(10px)',
        ease: 'power1.inOut',
        duration: 3.5
      }, 0);
      
      // Final Camera Tilt (8.5s to 10s)
      tl.fromTo(canvas, {
        scale: 1,
        y: '0vh'
      }, {
        scale: 1.05,
        y: '-8vh',
        ease: 'power2.inOut',
        duration: 1.5
      }, 8.5);

    }, sectionRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [loaded]);

  const headlineWords = ['A', 'Peaceful', 'Ascension.'];

  return (
    <section id="hero" ref={sectionRef} data-scene="hero">
      {!loaded && (
        <div className="hero-loading-overlay">
          <span>Loading Sequence...</span>
        </div>
      )}

      <div className="hero-sticky-container">
        
        {/* Sequence Canvas Layer */}
        <div className="hero-canvas-container">
          <canvas ref={canvasRef} className="hero-canvas" />
          
          {/* Subtle noise/gradient to blend with site dark mode */}
          <div className="hero-gradient-bg" aria-hidden="true" style={{ opacity: 0.2 }}>
             <div className="hero-noise-overlay" />
          </div>
        </div>
        
        {/* UI Overlay Layer */}
        <div className="hero-ui-layer">
          <div className="hero-content">
            <p className="hero-eyebrow" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              Modern AI Agency
            </p>

            <h1 className="hero-headline">
              {headlineWords.map((word, i) => (
                <span className="hero-word-wrap" key={i}>
                  <span className="hero-word" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{word}</span>
                </span>
              ))}
            </h1>

            <p className="hero-sub" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
              Transforming the world through cinematic <br />
              storytelling and intelligent design.
            </p>

            <div className="hero-actions">
              <a href="#contact" className="btn-primary magnetic">
                Explore the Future <span className="btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </a>
              <a href="#work" className="btn-ghost magnetic">
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Discover More</span>
              </a>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="hero-scroll-indicator" style={{ position: 'absolute', bottom: '4vh' }}>
            <div className="scroll-line" style={{ background: 'var(--text-primary)', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }} />
            <span style={{ color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Scroll to Ascend</span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
