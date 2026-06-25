import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
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
  if (!canvas || !overlayCtx || !overlayCanvas) return;
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
    const phaseP = p / 0.25;
    saturate = lerp(1, 0.6, phaseP);
    contrast = lerp(1, 1.1, phaseP);
  } else if (p < 0.35) {
    saturate = 0.6;
    const phaseP = (p - 0.25) / 0.10;
    const bell = Math.sin(phaseP * Math.PI);
    invert = bell * 0.85;
    brightness = 1 + bell * 0.8;
    contrast = 1.1 + bell * 0.3;
  } else if (p < 0.55) {
    const phaseP = (p - 0.35) / 0.20;
    const eased = phaseP * phaseP;
    brightness = lerp(1, 0.3, eased);
    blur = lerp(0, 4, eased);
    saturate = lerp(0.6, 0.2, eased);
    contrast = 1.1;
  } else if (p < 0.75) {
    const phaseP = (p - 0.55) / 0.20;
    const bell = Math.sin(phaseP * Math.PI);
    const baseBrightness = lerp(0.3, 0.8, phaseP);
    brightness = baseBrightness + bell * 1.5;
    blur = lerp(4, 0, phaseP);
    saturate = lerp(0.2, 0.8, phaseP);
    contrast = lerp(1.1, 1.0, phaseP);
  } else {
    const phaseP = (p - 0.75) / 0.25;
    const eased = phaseP * phaseP * (3 - 2 * phaseP);
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
    const pPhase = (p - 0.35) / 0.65;
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

export default function Hero() {
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

  // Mobile optimization: Cap preloaded frames to 30 on mobile/lite mode, 118 on desktop
  const totalFrames = isLite ? 30 : 118;
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
    context.imageSmoothingQuality = isLite ? 'medium' : 'high';
    context.drawImage(img, ox, oy, dw, dh);
  }, []);

  // ─── DEFERRED PRELOAD FRAMES (after first paint) ───
  useEffect(() => {
    // 1. Load and render first frame immediately on mount to prevent blank canvas
    const firstImg = new Image();
    firstImg.src = '/assets/sequence/frame_0001.webp';
    firstImg.onload = () => {
      if (imagesRef.current.length === 0) {
        imagesRef.current[0] = firstImg;
      }
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (canvas && context && currentFrameRef.current === 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, isLite ? 1.5 : 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        const imgRatio = firstImg.width / firstImg.height;
        const canvasRatio = canvas.width / canvas.height;
        let dw = canvas.width, dh = canvas.height, ox = 0, oy = 0;
        if (imgRatio > canvasRatio) {
          dw = canvas.height * imgRatio;
          ox = (canvas.width - dw) / 2;
        } else {
          dh = canvas.width / imgRatio;
          oy = (canvas.height - dh) / 2;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(firstImg, ox, oy, dw, dh);
      }
    };

    // 2. Preload remaining frames
    const startPreload = () => {
      let loadedCount = 0;
      const images = [];

      const handleFrameLoad = () => {
        loadedCount++;
        if (loadedCount === totalFrames) setLoaded(true);
      };

      const frameStep = isLite ? Math.ceil(118 / totalFrames) : 1;

      for (let i = 0; i < totalFrames; i++) {
        // Reuse first frame if already loaded
        if (i === 0 && imagesRef.current[0]) {
          images.push(imagesRef.current[0]);
          handleFrameLoad();
          continue;
        }
        const img = new Image();
        const originalFrameNum = isLite ? (i * frameStep + 1) : (i + 1);
        const clampedFrameNum = Math.min(originalFrameNum, 118);
        const frameNum = String(clampedFrameNum).padStart(4, '0');
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

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(startPreload, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      const onLoad = () => setTimeout(startPreload, 100);
      if (document.readyState === 'complete') {
        const timer = setTimeout(startPreload, 100);
        return () => clearTimeout(timer);
      } else {
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
      }
    }
  }, [totalFrames]);

  // ─── MOBILE ENTRANCE ANIMATIONS (Immediate & Preload Auto-play) ───
  useEffect(() => {
    if (!isLite) return;

    // Fade in text immediately on mount so the screen is never blank
    const tl = gsap.timeline({
      defaults: { duration: 0.9, ease: 'power3.out' }
    });

    tl.fromTo(eyebrowRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, 0.1);

    const words = headlineRef.current?.querySelectorAll('.hero-word-wrap') || [];
    if (words.length > 0) {
      tl.fromTo(words,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08 },
        0.2
      );
    }

    tl.fromTo(subRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, 0.5);
    tl.fromTo(actionsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, 0.7);
    tl.fromTo(scrollHintRef.current, { opacity: 0 }, { opacity: 1 }, 1.0);
  }, [isLite]);

  useEffect(() => {
    if (!isLite || !loaded) return;

    // Play the 3D model entrance rotation spin once the frames are ready in memory
    const animObj = { frame: 0 };
    gsap.to(animObj, {
      frame: totalFrames - 1,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        renderFrame(Math.round(animObj.frame));
      }
    });
  }, [loaded, isLite, totalFrames, renderFrame]);

  // ─── SCROLL ANIMATION + EXIT TRANSITION ───
  useLayoutEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: isLite });
    contextRef.current = context;
    const overlayCtx = overlay?.getContext('2d');

    // ─── CANVAS SIZING (Ignore mobile height-only changes to prevent scroll-jank!) ───
    let lastWidth = window.innerWidth;
    const resizeCanvas = () => {
      if (isLite && window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      const maxDpr = isLite ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
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

    if (isLite) {
      // Size canvas and listen to resize on mobile, but do NOT run pinning/ScrollTrigger
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }

    // ─── SINGLE UNIFIED SCROLL TRIGGER ───
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: isLite ? '+=120%' : '+=180%',   // Shorter scroll pin on mobile for app-like clean flow
        pin: true,
        scrub: isLite ? 0.8 : 1.2,           // Snappier response on mobile
        anticipatePin: 1,
        onUpdate: (self) => {
          if (!self || typeof self.progress !== 'number' || isNaN(self.progress)) return;
          const progress = self.progress;

          // ═══ FRAME SEQUENCE (0 → EXIT_START) ═══
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
          if (progress > EXIT_START) {
            const exitProgress = (progress - EXIT_START) / (1 - EXIT_START);

            if (isLite) {
              // Mobile: High-performance opacity fade (no heavy filters or overlay context operations)
              const canvasContainer = document.querySelector('.hero-canvas-container');
              if (canvasContainer) {
                canvasContainer.style.opacity = Math.max(0, 1 - exitProgress * 1.5);
              }
              const textFade = Math.max(0, 1 - exitProgress * 2.0);
              if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: textFade });
              if (headlineRef.current) gsap.set(headlineRef.current, { opacity: textFade });
              if (subRef.current) gsap.set(subRef.current, { opacity: textFade });
              if (actionsRef.current) gsap.set(actionsRef.current, { opacity: textFade });
            } else {
              // Desktop: original cinematic effects
              if (overlay) overlay.style.opacity = '1';
              const textFade = Math.max(0, 1 - exitProgress * 2.5);
              if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: textFade });
              if (headlineRef.current) gsap.set(headlineRef.current, { opacity: textFade });
              if (subRef.current) gsap.set(subRef.current, { opacity: textFade });
              if (actionsRef.current) gsap.set(actionsRef.current, { opacity: textFade });
              if (canvas && overlayCtx && overlay) {
                applyScrollTransition(canvas, overlayCtx, overlay, exitProgress);
              }
              const containerOpacity = Math.max(0, 1 - Math.max(0, (exitProgress - 0.5) / 0.5));
              const canvasContainer = document.querySelector('.hero-canvas-container');
              if (canvasContainer) {
                canvasContainer.style.opacity = containerOpacity;
              }
            }
          } else {
            // Reset transition styles
            if (canvas) canvas.style.filter = 'none';
            if (overlay) overlay.style.opacity = '0';
            if (overlayCtx && overlay) overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            const canvasContainer = document.querySelector('.hero-canvas-container');
            if (canvasContainer) {
              canvasContainer.style.opacity = 1;
            }
          }
        },
      });

      // Camera tilt near end of frame sequence (desktop only for performance)
      if (!isLite) {
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
      }

      setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 50);

    }, sectionRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [loaded, renderFrame, totalFrames]);

  return (
    <section id="hero" ref={sectionRef} data-scene="hero">
      {!loaded && !isLite && (
        <div className="hero-loading-overlay">
          <span>Loading Sequence...</span>
        </div>
      )}

      <div className="hero-sticky-container">
        <div className="hero-canvas-container">
          <canvas ref={canvasRef} className="hero-canvas" />
          {/* FX Overlay — hidden by default, desktop only */}
          {!isLite && (
            <canvas
              ref={overlayCanvasRef}
              className="hero-fx-canvas"
              aria-hidden="true"
            />
          )}
          <div className="hero-gradient-bg" aria-hidden="true" style={{ opacity: 0.15 }}>
            <div className="hero-noise-overlay" />
          </div>
        </div>

        <div className="hero-ui-layer">
          <div className="hero-content">
            <p ref={eyebrowRef} className="hero-eyebrow" style={{ opacity: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              MODERN AI AGENCY
            </p>

            <h1 ref={headlineRef} className="hero-headline">
              {['Premium websites ', 'that turn visitors ', 'into customers.'].map((word, i) => (
                <span className="hero-word-wrap" key={i} style={{ opacity: 0 }}>
                  <span className="hero-word" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{word}</span>
                </span>
              ))}
            </h1>

            <p ref={subRef} className="hero-sub" style={{ opacity: 0, textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
              We design and build fast, high-trust websites, apps, and AI systems for founders who want more leads, stronger credibility, and real growth.
            </p>

            <div ref={actionsRef} className="hero-actions" style={{ opacity: 0 }}>
              <a href="#demo" className="btn-primary magnetic">
                Schedule Free Demo <span className="btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </a>
              <a href="#work" className="btn-ghost magnetic">
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>View Work</span>
              </a>
              <p className="hero-small-line" style={{ opacity: 0.6, fontSize: 'var(--text-body-sm)', fontFamily: 'var(--font-mono)', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '0.05em', width: '100%', textAlign: 'center' }}>
                48-hour response time. Clear scope. No fluff.
              </p>
            </div>
          </div>

          <div ref={scrollHintRef} className="hero-scroll-indicator" style={{ position: 'absolute', bottom: '4vh' }}>
            <div className="scroll-line" style={{ background: 'var(--text-primary)', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
