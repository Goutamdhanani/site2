import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';
import { trackCTA } from '../utils/analytics';

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

/* ═══════════════════════════════════════════════════════
   HERO — MOBILE VIEW (Static visual, 3D tilt, typed text)
   ═══════════════════════════════════════════════════════ */
function HeroMobile({ startTyping }) {
  const sectionRef = useRef(null);
  const mobileImageRef = useRef(null);
  const mobileGlowRef = useRef(null);
  const glareRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const actionsRef = useRef(null);
  const scrollHintRef = useRef(null);

  // Smooth tilt interaction refs
  const tiltRef = useRef({ x: 0, y: 0 });
  const targetTiltRef = useRef({ x: 0, y: 0 });
  const isUserInteractingRef = useRef(false);

  // Calibration refs for gyroscope
  const baseBetaRef = useRef(null);
  const baseGammaRef = useRef(null);
  const scrollTiltYRef = useRef(0);
  const motionPermissionRef = useRef('unknown');

  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Typing animation states
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [showSubAndActions, setShowSubAndActions] = useState(false);
  const [showEyebrow, setShowEyebrow] = useState(false);

  // Monitor visibility of the Hero section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload single mobile image to trigger loading state cleanly
  useEffect(() => {
    const mobImg = new Image();
    mobImg.src = "https://res.cloudinary.com/dtbdgnh89/image/upload/f_auto,q_auto/Picsart_26-06-24_19-36-17-116_trkcu4";
    mobImg.onload = () => setLoaded(true);
    mobImg.onerror = () => setLoaded(true);
  }, []);

  // Entrance animation for mobile image container
  useEffect(() => {
    if (!loaded) return;

    gsap.fromTo(".hero-mobile-image-container",
      {
        opacity: 0,
        scale: 0.95,
        rotateY: -15,
        rotateX: 10,
      },
      {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        rotateX: 0,
        duration: 1.8,
        ease: 'power3.out',
      }
    );
  }, [loaded]);

  // ─── TYPING ANIMATION SCHEDULER ───
  useEffect(() => {
    if (!startTyping) return;

    const eyebrowTimer = setTimeout(() => setShowEyebrow(true), 0);

    const textToType = "We build\nwebsites, apps\n& AI systems.";
    let currentIdx = 0;

    const typingTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIdx <= textToType.length) {
          setDisplayedText(textToType.substring(0, currentIdx));
          currentIdx++;
        } else {
          clearInterval(interval);
          setTypingDone(true);
          setShowSubAndActions(true);
        }
      }, 70); // Elegant, rapid Apple-style typing

      return () => clearInterval(interval);
    }, 400);

    return () => {
      clearTimeout(eyebrowTimer);
      clearTimeout(typingTimer);
    };
  }, [startTyping]);

  // ─── 3D PERSPECTIVE INTERACTION ───
  useEffect(() => {
    if (!isVisible) return;
    const mobileImg = mobileImageRef.current;
    const sectionEl = sectionRef.current;

    const targetEl = mobileImg;
    if (!targetEl) return;

    // Map pointer coordinate on the hero section to [-1, 1] relative to the center
    const updatePointerTilt = (clientX, clientY) => {
      const rect = sectionEl.getBoundingClientRect();
      const pointerX = clientX - rect.left;
      const pointerY = clientY - rect.top;

      const x = (pointerX / rect.width) * 2 - 1;
      const y = (pointerY / rect.height) * 2 - 1;

      targetTiltRef.current = {
        x: Math.max(-0.8, Math.min(0.8, x)),
        y: Math.max(-0.8, Math.min(0.8, y)),
      };
    };

    const handlePointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      isUserInteractingRef.current = true;
      updatePointerTilt(e.clientX, e.clientY);
    };

    const handlePointerMove = (e) => {
      if (!isUserInteractingRef.current) return;
      updatePointerTilt(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      isUserInteractingRef.current = false;
    };

    // Touch event fallbacks for older devices
    const handleTouchStart = (e) => {
      isUserInteractingRef.current = true;
      const touch = e.touches[0];
      updatePointerTilt(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
      if (!isUserInteractingRef.current) return;
      const touch = e.touches[0];
      updatePointerTilt(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      isUserInteractingRef.current = false;
    };

    // Scroll-based parallax tilt fallback
    const handleScroll = () => {
      if (isUserInteractingRef.current) return;
      const rect = sectionEl.getBoundingClientRect();
      if (rect.top <= 0 && rect.top >= -rect.height) {
        const scrollProgress = Math.abs(rect.top) / rect.height;
        scrollTiltYRef.current = scrollProgress * 0.45; // Max scroll tilt
      } else if (rect.top > 0) {
        scrollTiltYRef.current = 0;
      }
    };

    // Device Orientation handler for Mobile/Tablet (Gyroscope)
    const handleOrientation = (e) => {
      if (isUserInteractingRef.current) return;

      const gamma = e.gamma !== null && e.gamma !== undefined ? e.gamma : 0; // [-90, 90]
      const beta = e.beta !== null && e.beta !== undefined ? e.beta : 0;   // [-180, 180]

      // Initialize baseline if not set yet
      if (baseBetaRef.current === null) {
        baseBetaRef.current = beta;
        baseGammaRef.current = gamma;
        return;
      }

      // Dynamic baseline calibration: slowly drift towards current position (low-pass filter)
      baseBetaRef.current = baseBetaRef.current * 0.98 + beta * 0.02;
      baseGammaRef.current = baseGammaRef.current * 0.98 + gamma * 0.02;

      let diffBeta = beta - baseBetaRef.current;
      let diffGamma = gamma - baseGammaRef.current;

      // Handle wrapping at boundaries
      if (diffBeta > 180) diffBeta -= 360;
      if (diffBeta < -180) diffBeta += 360;
      if (diffGamma > 90) diffGamma -= 180;
      if (diffGamma < -90) diffGamma += 180;

      // Clamp difference to +/- 20 degrees for a beautiful range of motion
      const maxGyroAngle = 20;
      const x = Math.max(-1, Math.min(1, diffGamma / maxGyroAngle));
      const y = Math.max(-1, Math.min(1, diffBeta / maxGyroAngle));

      targetTiltRef.current = { x, y };
    };

    if (sectionEl) {
      sectionEl.addEventListener('pointerdown', handlePointerDown);
      sectionEl.addEventListener('pointermove', handlePointerMove);
      sectionEl.addEventListener('pointerup', handlePointerUp);
      sectionEl.addEventListener('pointercancel', handlePointerUp);

      sectionEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      sectionEl.addEventListener('touchmove', handleTouchMove, { passive: true });
      sectionEl.addEventListener('touchend', handleTouchEnd, { passive: true });
      sectionEl.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Active tracking for DeviceOrientation
    let isListenerActive = false;

    const startOrientationTracking = () => {
      if (isListenerActive) return;
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      window.addEventListener('deviceorientationabsolute', handleOrientation, { passive: true });
      isListenerActive = true;
    };

    const requestOrientationPermission = () => {
      if (motionPermissionRef.current === 'granted' || motionPermissionRef.current === 'denied') {
        if (motionPermissionRef.current === 'granted') startOrientationTracking();
        return;
      }

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            motionPermissionRef.current = state;
            if (state === 'granted') {
               startOrientationTracking();
            }
          })
          .catch((err) => {
            console.warn('DeviceOrientation permission request error:', err);
            motionPermissionRef.current = 'denied';
          });
      } else {
        // Non-iOS or older browsers that don't need explicit permission prompt
        motionPermissionRef.current = 'granted';
        startOrientationTracking();
      }
    };

    // Auto-attempt start tracking if permission not needed or already granted
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function' ||
      motionPermissionRef.current === 'granted'
    ) {
      motionPermissionRef.current = 'granted';
      startOrientationTracking();
    }

    // Register user interaction triggers for iOS permission
    if (motionPermissionRef.current === 'unknown') {
      window.addEventListener('click', requestOrientationPermission, { once: true });
      window.addEventListener('touchstart', requestOrientationPermission, { once: true });
      window.addEventListener('pointerdown', requestOrientationPermission, { once: true });
    }

    // ─── SMOOTH INTERPOLATION LOOP (RAF) ───
    let rafId;
    let time = 0;
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const updateLoop = () => {
      // Continuous float animation wave (subtle drifting effect)
      time += 0.015;
      const floatScale = isUserInteractingRef.current ? 0.15 : 1.0;
      const waveX = Math.sin(time) * 0.06 * floatScale;
      const waveY = Math.cos(time * 0.8) * 0.05 * floatScale;

      const lerpAmt = 0.05;

      // Smooth decay for target tilt when user is NOT interacting
      if (!isUserInteractingRef.current) {
        targetTiltRef.current.x = targetTiltRef.current.x * 0.95;
        targetTiltRef.current.y = targetTiltRef.current.y * 0.95;
      }

      const targetX = targetTiltRef.current.x + waveX;
      const targetY = targetTiltRef.current.y + scrollTiltYRef.current + waveY;

      tiltRef.current.x = lerp(tiltRef.current.x, targetX, lerpAmt);
      tiltRef.current.y = lerp(tiltRef.current.y, targetY, lerpAmt);

      const rotateLimit = 25;    // Degrees max
      const translateLimit = 30; // Pixels max

      const rotateY = tiltRef.current.x * rotateLimit;
      const rotateX = -tiltRef.current.y * rotateLimit;
      const transX = tiltRef.current.x * translateLimit;
      const transY = tiltRef.current.y * translateLimit;

      // 1. Image Transform
      targetEl.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${transX}px, ${transY}px, 0) scale(1.18)`;

      // 2. Glare Transform (moves opposite of rotation for glossy reflection)
      if (glareRef.current) {
        const glareX = -tiltRef.current.x * 45;
        const glareY = -tiltRef.current.y * 45;
        const glareOpacity = Math.max(0.0, Math.min(0.45, 0.22 + tiltRef.current.y * 0.22));
        glareRef.current.style.transform = `translate3d(${glareX}px, ${glareY}px, 0) scale(1.25)`;
        glareRef.current.style.opacity = glareOpacity;
      }

      // 3. Glow Transform (moves opposite for depth separation)
      if (mobileGlowRef.current) {
        const glowX = -transX * 0.8;
        const glowY = -transY * 0.8;
        mobileGlowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      if (sectionEl) {
        sectionEl.removeEventListener('pointerdown', handlePointerDown);
        sectionEl.removeEventListener('pointermove', handlePointerMove);
        sectionEl.removeEventListener('pointerup', handlePointerUp);
        sectionEl.removeEventListener('pointercancel', handlePointerUp);

        sectionEl.removeEventListener('touchstart', handleTouchStart);
        sectionEl.removeEventListener('touchmove', handleTouchMove);
        sectionEl.removeEventListener('touchend', handleTouchEnd);
        sectionEl.removeEventListener('touchcancel', handleTouchEnd);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', requestOrientationPermission);
      window.removeEventListener('touchstart', requestOrientationPermission);
      window.removeEventListener('pointerdown', requestOrientationPermission);
      if (isListenerActive) {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
      }
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  return (
    <section id="hero" ref={sectionRef} data-scene="hero">
      <div className="hero-sticky-container">
        <div className="hero-canvas-container">
          <div className="hero-mobile-image-wrapper">
            <div ref={mobileGlowRef} className="hero-mobile-image-glow" />
            <div className="hero-mobile-image-container">
              <img
                ref={mobileImageRef}
                src="https://res.cloudinary.com/dtbdgnh89/image/upload/f_auto,q_auto/Picsart_26-06-24_19-36-17-116_trkcu4"
                alt="Hero concept"
                className="hero-mobile-image"
              />
              <div ref={glareRef} className="hero-mobile-image-glare" />
            </div>
          </div>

          {/* Visual tilt hint for mobile users */}
          {loaded && (
            <div className="hero-drag-hint" aria-hidden="true">
              <div className="drag-hint-icon" style={{ animation: 'hero-cursor-blink 1.5s infinite ease-in-out' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
                </svg>
              </div>
              <span>Touch or tilt to explore 3D</span>
            </div>
          )}

          <div className="hero-gradient-bg" aria-hidden="true" style={{ opacity: 0.15 }}>
            <div className="hero-noise-overlay" />
          </div>
        </div>

        <div className="hero-ui-layer">
          <div className="hero-content">
            <p ref={eyebrowRef} className={`hero-eyebrow ${showEyebrow ? 'visible' : ''}`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              ✦ WEB DESIGN & APP DEVELOPMENT AGENCY
            </p>

            <h1 ref={headlineRef} className="hero-headline">
              <span className="hero-typed-text" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
                {displayedText.split('\n').map((line, idx, arr) => {
                  const isLastLine = idx === 2;
                  return (
                    <span key={idx} className={isLastLine ? "hero-gradient-text" : ""}>
                      {line}
                      {idx < arr.length - 1 && <br />}
                    </span>
                  );
                })}
              </span>
              <span className={`hero-cursor ${typingDone ? 'done' : ''}`}>|</span>
            </h1>

            <p ref={subRef} className={`hero-sub ${showSubAndActions ? 'visible' : ''}`} style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
              Premium web design, mobile app development, and AI automation services for startups and brands across the United States and Canada. More leads, stronger credibility, real growth.
            </p>

            <div ref={actionsRef} className={`hero-actions ${showSubAndActions ? 'visible' : ''}`}>
              <a
                href="#demo"
                className="btn-primary magnetic"
                onClick={() => trackCTA('hero_demo_mobile', 'click', { position: 'mobile_hero' })}
                onMouseEnter={() => trackCTA('hero_demo_mobile', 'hover', { position: 'mobile_hero' })}
              >
                Schedule Free Demo <span className="btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </a>
              <a
                href="#work"
                className="btn-ghost magnetic"
                onClick={() => trackCTA('hero_work_mobile', 'click', { position: 'mobile_hero' })}
                onMouseEnter={() => trackCTA('hero_work_mobile', 'hover', { position: 'mobile_hero' })}
              >
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>View Work</span>
              </a>
              <p className="hero-small-line" style={{ opacity: 0.6, fontSize: 'var(--text-body-sm)', fontFamily: 'var(--font-mono)', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '0.05em', width: '100%', textAlign: 'center' }}>
                48-hour response time. Clear scope. No fluff.
              </p>
            </div>
          </div>

          <div ref={scrollHintRef} className={`hero-scroll-indicator ${showSubAndActions ? 'visible' : ''}`} style={{ position: 'absolute', bottom: '4vh' }}>
            <div className="scroll-line" style={{ background: 'var(--text-primary)', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }} />
            <span style={{ color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Scroll to Ascend</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO — DESKTOP VIEW (Original full canvas, scroll-scrub sequence)
   ═══════════════════════════════════════════════════════ */
function HeroDesktop() {
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

  // Desktop frames
  const totalFrames = 118;
  const EXIT_START = 0.78;

  // ─── RENDER FRAME ───
  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Find the nearest loaded frame fallback to prevent flash/blank canvas
    let img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      let found = false;
      // Search backwards first
      for (let i = index - 1; i >= 0; i--) {
        if (imagesRef.current[i] && imagesRef.current[i].complete && imagesRef.current[i].naturalWidth > 0) {
          img = imagesRef.current[i];
          found = true;
          break;
        }
      }
      // Search forwards if not found
      if (!found) {
        for (let i = index + 1; i < totalFrames; i++) {
          if (imagesRef.current[i] && imagesRef.current[i].complete && imagesRef.current[i].naturalWidth > 0) {
            img = imagesRef.current[i];
            break;
          }
        }
      }
    }

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
  }, [totalFrames]);

  // ─── DEFERRED PRELOAD FRAMES (after first paint) ───
  useEffect(() => {
    let idleId;
    let timerId;

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
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      // If user prefers reduced motion, we only need the first frame!
      if (prefersReducedMotion()) {
        imagesRef.current = [firstImg];
        setLoaded(true);
      }
    };

    if (prefersReducedMotion()) {
      return () => {
        imagesRef.current = [];
      };
    }

    // 2. Preload remaining frames
    const startPreload = () => {
      let loadedCount = 0;
      const images = [];
      const criticalFramesCount = 10;
      let criticalLoaded = false;

      const handleFrameLoad = () => {
        loadedCount++;
        // Release loader as soon as the first 10 frames are ready for smooth first impression
        if (!criticalLoaded && loadedCount >= Math.min(totalFrames, criticalFramesCount)) {
          criticalLoaded = true;
          setLoaded(true);
        } else if (loadedCount === totalFrames) {
          setLoaded(true);
        }
      };

      for (let i = 0; i < totalFrames; i++) {
        // Reuse first frame if already loaded
        if (i === 0 && imagesRef.current[0]) {
          images.push(imagesRef.current[0]);
          handleFrameLoad();
          continue;
        }
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

    const handleWindowLoad = () => {
      timerId = setTimeout(startPreload, 100);
    };

    if ('requestIdleCallback' in window) {
      idleId = requestIdleCallback(startPreload, { timeout: 3000 });
    } else {
      if (document.readyState === 'complete') {
        timerId = setTimeout(startPreload, 100);
      } else {
        window.addEventListener('load', handleWindowLoad);
      }
    }

    return () => {
      if (idleId) cancelIdleCallback(idleId);
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('load', handleWindowLoad);
      // Cancel active network requests & clean up memory
      imagesRef.current.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      imagesRef.current = [];
    };
  }, [totalFrames]);

  // Scroll Lock during desktop loading sequence to prevent scroll-stutter during preloading
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [loaded]);

  // ─── SCROLL ANIMATION + EXIT TRANSITION ───
  useLayoutEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;
    const overlayCtx = overlay?.getContext('2d');

    // ─── CANVAS SIZING ───
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
        end: '+=180%',
        pin: true,
        scrub: 1.2,
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

      // Camera tilt near end of frame sequence (desktop only)
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

    }, sectionRef);

    const timer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [loaded, renderFrame, totalFrames]);

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
              WEB DESIGN & APP DEVELOPMENT AGENCY
            </p>

            <h1 ref={headlineRef} className="hero-headline">
              {['Custom websites ', 'that turn visitors ', 'into customers.'].map((word, i) => (
                <span className="hero-word-wrap" key={i} style={{ opacity: 0 }}>
                  <span className="hero-word" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{word}</span>
                </span>
              ))}
            </h1>

            <p ref={subRef} className="hero-sub" style={{ opacity: 0, textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
              Premium web design, mobile app development, and AI automation services for startups and brands across the United States and Canada. More leads, stronger credibility, real growth.
            </p>

            <div ref={actionsRef} className="hero-actions" style={{ opacity: 0 }}>
              <a
                href="#demo"
                className="btn-primary magnetic"
                onClick={() => trackCTA('hero_demo_desktop', 'click', { position: 'desktop_hero' })}
                onMouseEnter={() => trackCTA('hero_demo_desktop', 'hover', { position: 'desktop_hero' })}
              >
                Schedule Free Demo <span className="btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </a>
              <a
                href="#work"
                className="btn-ghost magnetic"
                onClick={() => trackCTA('hero_work_desktop', 'click', { position: 'desktop_hero' })}
                onMouseEnter={() => trackCTA('hero_work_desktop', 'hover', { position: 'desktop_hero' })}
              >
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>View Work</span>
              </a>
              <p className="hero-small-line" style={{ opacity: 0.6, fontSize: 'var(--text-body-sm)', fontFamily: 'var(--font-mono)', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '0.05em', width: '100%', textAlign: 'center' }}>
                48-hour response time. Clear scope. No fluff.
              </p>
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

/* ═══════════════════════════════════════════════════════
   HERO — default export switching on mobile/desktop bounds
   ═══════════════════════════════════════════════════════ */
export default function Hero({ startTyping = true }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? (
    <HeroMobile startTyping={startTyping} />
  ) : (
    <HeroDesktop />
  );
}
