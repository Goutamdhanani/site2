import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';

gsap.registerPlugin(ScrollTrigger);



/**
 * Apply scroll-driven transition effects using CSS filters (GPU-accelerated)
 * and a lightweight overlay canvas for the scan line + particles.
 */
function applyScrollTransition(canvas, overlayCtx, overlayCanvas, exitProgress) {
  const { width, height } = overlayCanvas;

  // Clear overlay
  overlayCtx.clearRect(0, 0, width, height);

  // Clamp exit progress between 0 and 1
  const p = Math.max(0, Math.min(1, exitProgress));

  const lerp = (start, end, t) => start + (end - start) * t;

  let brightness = 1;
  let contrast = 1;
  let invert = 0;
  let saturate = 1;
  let blur = 0;

  // ─── Continuous mapping for CSS Filters ───
  if (p < 0.25) {
    // 0.00 -> 0.25: Edge scan (desaturate, contrast bump)
    const phaseP = p / 0.25;
    saturate = lerp(1, 0.6, phaseP);
    contrast = lerp(1, 1.1, phaseP);
  } else if (p < 0.35) {
    // 0.25 -> 0.35: Negative flash spike. Peak at 0.30
    saturate = 0.6;
    const phaseP = (p - 0.25) / 0.10;
    const bell = Math.sin(phaseP * Math.PI);
    invert = bell * 0.85;
    brightness = 1 + bell * 0.8;
    contrast = 1.1 + bell * 0.3;
  } else if (p < 0.55) {
    // 0.35 -> 0.55: Fracture/Dim
    const phaseP = (p - 0.35) / 0.20;
    const eased = phaseP * phaseP; // ease-in
    brightness = lerp(1, 0.3, eased);
    blur = lerp(0, 4, eased);
    saturate = lerp(0.6, 0.2, eased);
    contrast = 1.1;
  } else if (p < 0.75) {
    // 0.55 -> 0.75: Bloom burst
    const phaseP = (p - 0.55) / 0.20;
    const bell = Math.sin(phaseP * Math.PI);
    const baseBrightness = lerp(0.3, 0.8, phaseP);
    brightness = baseBrightness + bell * 1.5;
    blur = lerp(4, 0, phaseP);
    saturate = lerp(0.2, 0.8, phaseP);
    contrast = lerp(1.1, 1.0, phaseP);
  } else {
    // 0.75 -> 1.00: Reassembly
    const phaseP = (p - 0.75) / 0.25;
    const eased = phaseP * phaseP * (3 - 2 * phaseP); // smoothstep
    brightness = lerp(0.8, 1.02, eased);
    contrast = lerp(1.0, 1.05, eased);
    saturate = lerp(0.8, 1.0, eased);
    blur = 0;
  }

  canvas.style.filter = `brightness(${brightness}) contrast(${contrast}) invert(${invert}) saturate(${saturate}) blur(${blur}px)`;

  // ─── OVERLAY: Scan line (0.0 -> 0.25) ───
  if (p > 0 && p < 0.25) {
    const edgeP = p / 0.25;
    const scanY = edgeP * height;

    overlayCtx.save();
    overlayCtx.globalCompositeOperation = 'lighter';

    const glowSize = 40;
    const grad = overlayCtx.createLinearGradient(0, scanY - glowSize, 0, scanY + glowSize);
    grad.addColorStop(0, 'rgba(200, 210, 220, 0)');
    grad.addColorStop(0.5, 'rgba(200, 210, 220, 0.2)');
    grad.addColorStop(1, 'rgba(200, 210, 220, 0)');
    overlayCtx.fillStyle = grad;
    overlayCtx.fillRect(0, scanY - glowSize, width, glowSize * 2);

    overlayCtx.strokeStyle = 'rgba(220, 225, 235, 0.6)';
    overlayCtx.lineWidth = 2;
    overlayCtx.beginPath();
    overlayCtx.moveTo(0, scanY);
    overlayCtx.lineTo(width, scanY);
    overlayCtx.stroke();

    overlayCtx.restore();
  }

  // ─── OVERLAY: Particle dust (0.35 -> 1.0) ───
  if (p > 0.35) {
    const pPhase = (p - 0.35) / 0.65; // 0 to 1 over the remaining time
    const bell = Math.sin(pPhase * Math.PI); 

    overlayCtx.save();
    overlayCtx.globalCompositeOperation = 'lighter';

    const particleCount = 40;
    const cx = width / 2;
    const cy = height / 2;
    const maxSpread = Math.min(width, height) * 0.5;

    for (let i = 0; i < particleCount; i++) {
      const spreadFactor = bell * (0.2 + (i / particleCount) * 0.8);
      const spreadRadius = maxSpread * spreadFactor;
      
      const angle = (i / particleCount) * Math.PI * 6 + pPhase * Math.PI;
      const x = cx + Math.cos(angle) * spreadRadius * (1 + Math.sin(i * 1.7) * 0.3);
      const y = cy + Math.sin(angle) * spreadRadius * (1 + Math.cos(i * 2.3) * 0.3);

      const alpha = Math.max(0, bell * 0.6 * (0.3 + Math.sin(i * 3.1) * 0.3));
      const size = 1 + Math.sin(i * 4.7) * 0.8;

      const pGrad = overlayCtx.createRadialGradient(x, y, 0, x, y, size * 4);
      pGrad.addColorStop(0, `rgba(220, 215, 200, ${alpha})`);
      pGrad.addColorStop(1, 'rgba(220, 215, 200, 0)');
      overlayCtx.fillStyle = pGrad;
      overlayCtx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
    }

    overlayCtx.restore();
  }

  // ─── OVERLAY: Energy bloom ring (0.55 -> 0.75) ───
  if (p > 0.55 && p < 0.75) {
    const bloomP = (p - 0.55) / 0.20;
    overlayCtx.save();
    overlayCtx.globalCompositeOperation = 'lighter';

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.max(width, height) * 0.5;
    const radius = maxR * bloomP;

    const bGrad = overlayCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const bloomIntensity = Math.sin(bloomP * Math.PI) * 0.25;
    bGrad.addColorStop(0, `rgba(240, 235, 225, ${bloomIntensity})`);
    bGrad.addColorStop(0.4, `rgba(220, 215, 210, ${bloomIntensity * 0.4})`);
    bGrad.addColorStop(1, 'rgba(220, 215, 210, 0)');
    overlayCtx.fillStyle = bGrad;
    overlayCtx.fillRect(0, 0, width, height);

    overlayCtx.strokeStyle = `rgba(240, 238, 230, ${bloomIntensity * 0.5})`;
    overlayCtx.lineWidth = 1.5;
    overlayCtx.beginPath();
    overlayCtx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
    overlayCtx.stroke();

    overlayCtx.restore();
  }
}

/* ═══════════════════════════════════════════════════════════
   HERO — LITE MODE (static poster, immediate text)
   ═══════════════════════════════════════════════════════════ */
function HeroLite() {
  return (
    <section id="hero" data-scene="hero">
      <div className="hero-sticky-container">
        <div className="hero-canvas-container">
          {/* Static poster — loads instantly, no 118-frame sequence */}
          <img
            src="/assets/sequence/frame_0001.webp"
            alt="Hero visual"
            className="hero-canvas"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              display: 'block',
            }}
            fetchPriority="high"
          />
          <div className="hero-gradient-bg" aria-hidden="true" style={{ opacity: 0.15 }}>
            <div className="hero-noise-overlay" />
          </div>
        </div>

        <div className="hero-ui-layer">
          <div className="hero-content">
            <p className="hero-eyebrow" style={{ opacity: 1, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              Modern AI Agency
            </p>

            <h1 className="hero-headline">
              {['A', 'Peaceful', 'Ascension.'].map((word, i) => (
                <span className="hero-word-wrap" key={i} style={{ opacity: 1 }}>
                  <span className="hero-word" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{word}</span>
                </span>
              ))}
            </h1>

            <p className="hero-sub" style={{ opacity: 1, textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
              Transforming the world through cinematic <br />
              storytelling and intelligent design.
            </p>

            <div className="hero-actions" style={{ opacity: 1 }}>
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
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — FULL MODE (118-frame canvas, scroll-scrub, exit FX)
   ═══════════════════════════════════════════════════════════ */
function HeroFull() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const contextRef = useRef(null);
  const imagesRef = useRef([]);
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const actionsRef = useRef(null);
  const scrollHintRef = useRef(null);
  const currentFrameRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const totalFrames = 118;

  // Where the frame sequence ends and exit transition begins (0→1 of scroll)
  const EXIT_START = 0.78;

  // ─── RENDER FRAME ───
  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const img = imagesRef.current[index];
    if (!img || !img.width || !img.height) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let dw = canvas.width, dh = canvas.height, ox = 0, oy = 0;

    if (imgRatio > canvasRatio) {
      dw = canvas.height * imgRatio;
      ox = (canvas.width - dw) / 2;
    } else {
      dh = canvas.width / imgRatio;
      oy = (canvas.height - dh) / 2;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(img, ox, oy, dw, dh);
  }, []);

  // ─── DEFERRED PRELOAD FRAMES (after first paint) ───
  useEffect(() => {
    // Defer heavy preload to after first paint using requestIdleCallback
    const startPreload = () => {
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
    };

    // Use requestIdleCallback where available, else fall back to after 'load'
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(startPreload, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback: wait for page load + small delay
      const onLoad = () => setTimeout(startPreload, 100);
      if (document.readyState === 'complete') {
        const timer = setTimeout(startPreload, 100);
        return () => clearTimeout(timer);
      } else {
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
      }
    }
  }, []);

  // ─── SCROLL ANIMATION + EXIT TRANSITION ───
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    contextRef.current = context;
    const overlayCtx = overlay?.getContext('2d');

    // ─── CANVAS SIZING (DPR capped at 2) ───
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';

      if (overlay) {
        overlay.width = canvas.width;
        overlay.height = canvas.height;
        overlay.style.width = canvas.style.width;
        overlay.style.height = canvas.style.height;
      }

      renderFrame(currentFrameRef.current);
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    if (prefersReducedMotion()) {
      renderFrame(0);
      gsap.set('.hero-ui-layer', { opacity: 1 });
      return () => window.removeEventListener('resize', resizeCanvas);
    }

    // ─── SINGLE UNIFIED SCROLL TRIGGER ───
    const ctx = gsap.context(() => {

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=180%',   // Smooth pinning duration (1.8x viewport height)
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // ═══ FRAME SEQUENCE (0 → EXIT_START) ═══
          // Map scroll 0→EXIT_START to full frame range
          const frameProgress = Math.min(1, progress / EXIT_START);
          const frame = Math.round(frameProgress * (totalFrames - 1));
          currentFrameRef.current = frame;
          renderFrame(frame);

          // ═══ TEXT REVEALS (mapped to frame progress) ═══
          if (eyebrowRef.current) {
            const eyeOp = gsap.utils.clamp(0, 1, (frameProgress - 0.17) / 0.15);
            const eyeY = gsap.utils.mapRange(0.17, 0.32, 20, 0, gsap.utils.clamp(0.17, 0.32, frameProgress));
            gsap.set(eyebrowRef.current, { opacity: eyeOp, y: eyeY });
          }

          if (headlineRef.current) {
            const words = headlineRef.current.querySelectorAll('.hero-word-wrap');
            words.forEach((w, i) => {
              const wordStart = 0.42 + i * 0.08;
              const wordEnd = wordStart + 0.12;
              const wordOp = gsap.utils.clamp(0, 1, (frameProgress - wordStart) / (wordEnd - wordStart));
              const wordY = gsap.utils.mapRange(wordStart, wordEnd, 30, 0, gsap.utils.clamp(wordStart, wordEnd, frameProgress));
              gsap.set(w, { opacity: wordOp, y: wordY });
            });
          }

          if (subRef.current) {
            const subOp = gsap.utils.clamp(0, 1, (frameProgress - 0.68) / 0.15);
            const subY = gsap.utils.mapRange(0.68, 0.83, 20, 0, gsap.utils.clamp(0.68, 0.83, frameProgress));
            gsap.set(subRef.current, { opacity: subOp, y: subY });
          }

          if (actionsRef.current) {
            const actOp = gsap.utils.clamp(0, 1, (frameProgress - 0.85) / 0.1);
            const actY = gsap.utils.mapRange(0.85, 0.95, 30, 0, gsap.utils.clamp(0.85, 0.95, frameProgress));
            gsap.set(actionsRef.current, { opacity: actOp, y: actY });
          }

          if (scrollHintRef.current) {
            gsap.set(scrollHintRef.current, { opacity: 1 - frameProgress * 5 });
          }

          // ═══ EXIT TRANSITION (EXIT_START → 1.0) ═══
          if (progress > EXIT_START && overlayCtx) {
            const exitProgress = (progress - EXIT_START) / (1 - EXIT_START);

            // Show overlay
            overlay.style.opacity = '1';

            // Fade out UI layer elements during exit
            const textFade = Math.max(0, 1 - exitProgress * 2.5);
            if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: textFade });
            if (headlineRef.current) gsap.set(headlineRef.current, { opacity: textFade });
            if (subRef.current) gsap.set(subRef.current, { opacity: textFade });
            if (actionsRef.current) gsap.set(actionsRef.current, { opacity: textFade });

            // Apply the scroll-driven cinematic transition
            applyScrollTransition(canvas, overlayCtx, overlay, exitProgress);

            // Smoothly fade out the canvas container at the end of transition to blend with CaseStudies
            const containerOpacity = Math.max(0, 1 - Math.max(0, (exitProgress - 0.5) / 0.5));
            const canvasContainer = document.querySelector('.hero-canvas-container');
            if (canvasContainer) {
              canvasContainer.style.opacity = containerOpacity;
            }
          } else {
            // Normal state — no filters, overlay hidden
            canvas.style.filter = 'none';
            if (overlay) overlay.style.opacity = '0';
            if (overlayCtx) overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            const canvasContainer = document.querySelector('.hero-canvas-container');
            if (canvasContainer) {
              canvasContainer.style.opacity = 1;
            }
          }
        },
      });

      // ─── Camera tilt near end of frame sequence ───
      gsap.fromTo(canvas, { scale: 1 }, {
        scale: 1.05,
        y: '-5vh',
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '60% top',
          end: '78% top',
          scrub: 1.8,
        },
      });

      // Force GSAP to recalculate all triggers on the page now that this pin exists
      setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 50);

    }, sectionRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [loaded, renderFrame]);

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
          {/* FX Overlay — hidden by default, shown only during exit transition */}
          <canvas
            ref={overlayCanvasRef}
            className="hero-fx-canvas"
            aria-hidden="true"
          />
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

/* ═══════════════════════════════════════════════════════════
   HERO — Route to lite or full based on device capability
   ═══════════════════════════════════════════════════════════ */
export default function Hero() {
  return isLite ? <HeroLite /> : <HeroFull />;
}
