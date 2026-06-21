import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const imagesRef = useRef([]);
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const actionsRef = useRef(null);
  const scrollHintRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const totalFrames = 118;

  // ─── PRELOAD FRAMES ───
  useEffect(() => {
    let loadedCount = 0;
    const images = [];

    const handleFrameLoad = () => {
      loadedCount++;
      if (loadedCount === totalFrames) setLoaded(true);
    };

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, '0');
      img.src = `/assets/sequence/frame_${frameNum}.webp`;
      img.onload = handleFrameLoad;
      img.onerror = () => {
        console.warn(`Frame ${frameNum} failed — skipping`);
        handleFrameLoad();
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // ─── SCROLL ANIMATION ───
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderFrame(0);
    };

    const renderFrame = (index) => {
      const img = imagesRef.current[index];
      if (!img || !img.width || !img.height) return;

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let dw = canvas.width, dh = canvas.height, ox = 0, oy = 0;

      if (imgRatio > canvasRatio) {
        dh = canvas.width / imgRatio;
        oy = (canvas.height - dh) / 2;
      } else {
        dw = canvas.height * imgRatio;
        ox = (canvas.width - dw) / 2;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(img, ox, oy, dw, dh);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (prefersReducedMotion()) {
      renderFrame(0);
      gsap.set('.hero-ui-layer', { opacity: 1 });
      return () => window.removeEventListener('resize', resizeCanvas);
    }

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1.8,        // Shopify-style inertia lag
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const frame = Math.round(progress * (totalFrames - 1));
          renderFrame(frame);

          // ─── TEXT SYNC TO FRAME MILESTONES ───
          // Frame 0–20: establishing shot, nothing visible
          // Frame 20–50: eyebrow fades in
          if (eyebrowRef.current) {
            const eyeOp = gsap.utils.clamp(0, 1, (progress - 0.17) / 0.15);
            const eyeY = gsap.utils.mapRange(0.17, 0.32, 20, 0, gsap.utils.clamp(0.17, 0.32, progress));
            gsap.set(eyebrowRef.current, { opacity: eyeOp, y: eyeY });
          }

          // Frame 50–80: headline word-by-word
          if (headlineRef.current) {
            const words = headlineRef.current.querySelectorAll('.hero-word-wrap');
            words.forEach((w, i) => {
              const wordStart = 0.42 + i * 0.08;
              const wordEnd = wordStart + 0.12;
              const wordOp = gsap.utils.clamp(0, 1, (progress - wordStart) / (wordEnd - wordStart));
              const wordY = gsap.utils.mapRange(wordStart, wordEnd, 30, 0, gsap.utils.clamp(wordStart, wordEnd, progress));
              gsap.set(w, { opacity: wordOp, y: wordY });
            });
          }

          // Frame 80–100: subtitle
          if (subRef.current) {
            const subOp = gsap.utils.clamp(0, 1, (progress - 0.68) / 0.15);
            const subY = gsap.utils.mapRange(0.68, 0.83, 20, 0, gsap.utils.clamp(0.68, 0.83, progress));
            gsap.set(subRef.current, { opacity: subOp, y: subY });
          }

          // Frame 100–117: CTA buttons slide up
          if (actionsRef.current) {
            const actOp = gsap.utils.clamp(0, 1, (progress - 0.85) / 0.1);
            const actY = gsap.utils.mapRange(0.85, 0.95, 30, 0, gsap.utils.clamp(0.85, 0.95, progress));
            gsap.set(actionsRef.current, { opacity: actOp, y: actY });
          }

          // Scroll hint fades out
          if (scrollHintRef.current) {
            gsap.set(scrollHintRef.current, { opacity: 1 - progress * 5 });
          }
        },
      });

      // ─── Camera tilt at end ───
      gsap.fromTo(canvas, { scale: 1 }, {
        scale: 1.05,
        y: '-5vh',
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '80% top',
          end: '100% top',
          scrub: 1.8,
        },
      });

    }, sectionRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [loaded]);

  return (
    <section id="hero" ref={sectionRef} data-scene="hero">
      {!loaded && (
        <div className="hero-loading-overlay">
          <span>Loading Sequence...</span>
        </div>
      )}

      <div className="hero-sticky-container">
        <div className="hero-canvas-container">
          <canvas ref={canvasRef} className="hero-canvas" />
          <div className="hero-gradient-bg" aria-hidden="true" style={{ opacity: 0.15 }}>
            <div className="hero-noise-overlay" />
          </div>
        </div>

        <div className="hero-ui-layer">
          <div className="hero-content">
            <p ref={eyebrowRef} className="hero-eyebrow" style={{ opacity: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              Modern AI Agency
            </p>

            <h1 ref={headlineRef} className="hero-headline">
              {['A', 'Peaceful', 'Ascension.'].map((word, i) => (
                <span className="hero-word-wrap" key={i} style={{ opacity: 0 }}>
                  <span className="hero-word" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{word}</span>
                </span>
              ))}
            </h1>

            <p ref={subRef} className="hero-sub" style={{ opacity: 0, textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
              Transforming the world through cinematic <br />
              storytelling and intelligent design.
            </p>

            <div ref={actionsRef} className="hero-actions" style={{ opacity: 0 }}>
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

          <div ref={scrollHintRef} className="hero-scroll-indicator" style={{ position: 'absolute', bottom: '4vh' }}>
            <div className="scroll-line" style={{ background: 'var(--text-primary)', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }} />
            <span style={{ color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Scroll to Ascend</span>
          </div>
        </div>
      </div>
    </section>
  );
}
