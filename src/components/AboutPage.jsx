import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function AboutPage({ onViewChange }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const eyeFrameRef = useRef(null);
  
  // Interactive Gaze Simulation Telemetry
  const [telemetry, setTelemetry] = useState({
    x: 0,
    y: 0,
    velocity: 0,
    resonance: 0,
    friction: 0.1,
    activeNode: 'Retinal Calibration'
  });

  const lastPos = useRef({ x: 0, y: 0, time: Date.now() });

  // ─── ENTRANCE ANIMATIONS ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main title & header slide-in
      gsap.fromTo('.ab-eyebrow', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      gsap.fromTo('.ab-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
      gsap.fromTo('.ab-lead', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      
      // Eye artwork frame fade & breathing tilt
      gsap.fromTo('.ab-eye-frame', { opacity: 0, scale: 0.95, filter: 'blur(10px)' }, {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 1.2, ease: 'power2.out', delay: 0.3
      });

      // Poetic manifesto items stagger
      gsap.fromTo('.manifesto-item', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, stagger: 0.15,
        duration: 0.8, ease: 'power3.out', delay: 0.4
      });

      // Simulation panel fade-in
      gsap.fromTo('.gaze-simulator-panel', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.6
      });
    }, containerRef);

    // Eye artwork breathing float
    if (!isLite) {
      gsap.to('.ab-eye-image', {
        y: -10,
        rotate: 0.5,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }

    return () => ctx.revert();
  }, []);

  // ─── INTERACTIVE GAZE TRACKER DRAWING ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle resizing
    const resizeCanvas = () => {
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height || 360;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Points representing focal UI hubs in the simulator grid
    const uiNodes = [
      { id: 'Brand Logo', x: 0.25, y: 0.25, label: '01 / BRAND IDENTITY' },
      { id: 'Value Headline', x: 0.5, y: 0.4, label: '02 / VALUE PROPOSITION' },
      { id: 'Primary CTA Button', x: 0.5, y: 0.7, label: '03 / CALL TO ACTION' },
      { id: 'Outcome Stats', x: 0.75, y: 0.5, label: '04 / TRUST SIGNALS' }
    ];

    // Smooth tracking coordinates
    const pointer = { x: canvas.width / 2, y: canvas.height / 2 };
    const current = { x: canvas.width / 2, y: canvas.height / 2 };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Grid Lines (Luxury Technical Blueprint)
      ctx.strokeStyle = 'rgba(199, 154, 75, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Render Focal UI Nodes
      uiNodes.forEach(node => {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
        
        // Check distance to cursor
        const dx = current.x - nx;
        const dy = current.y - ny;
        const dist = Math.hypot(dx, dy);
        const active = dist < 70;

        // Draw node bracket/outer ring
        ctx.strokeStyle = active ? 'rgba(199, 154, 75, 0.35)' : 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.arc(nx, ny, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Draw node core dot
        ctx.fillStyle = active ? 'var(--accent-ember)' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fill();

        // Text label
        ctx.fillStyle = active ? 'var(--text-primary)' : 'var(--text-muted)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny - 24);
      });

      // 3. Smooth Lerp Cursor Movement
      current.x += (pointer.x - current.x) * 0.12;
      current.y += (pointer.y - current.y) * 0.12;

      // 4. Draw Gaze Aperture (Pupil / Iris representation)
      const grad = ctx.createRadialGradient(current.x, current.y, 0, current.x, current.y, 60);
      grad.addColorStop(0, 'rgba(199, 154, 75, 0.18)');
      grad.addColorStop(0.5, 'rgba(199, 154, 75, 0.03)');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(current.x, current.y, 60, 0, Math.PI * 2);
      ctx.fill();

      // Outer gold iris circle
      ctx.strokeStyle = 'rgba(199, 154, 75, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(current.x, current.y, 25, 0, Math.PI * 2);
      ctx.stroke();

      // Inner retina core point
      ctx.fillStyle = 'var(--text-primary)';
      ctx.beginPath();
      ctx.arc(current.x, current.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Dotted scanner guidelines
      ctx.strokeStyle = 'rgba(199, 154, 75, 0.08)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(current.x, 0); ctx.lineTo(current.x, canvas.height);
      ctx.moveTo(0, current.y); ctx.lineTo(canvas.width, current.y);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      animationFrameId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    // Mouse Move Handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;

      // Telemetry Calculations
      const now = Date.now();
      const dt = now - lastPos.current.time;
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      const dist = Math.hypot(dx, dy);
      const velocity = dt > 0 ? Math.round((dist / dt) * 100) : 0;

      // Check active node intersection
      let matchedNode = 'Saccadic Drift';
      uiNodes.forEach(node => {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
        const distance = Math.hypot(x - nx, y - ny);
        if (distance < 70) matchedNode = node.id;
      });

      // Calculate emotional resonance based on smooth hovering
      const resonance = Math.min(99.8, Math.max(78.2, 98.4 - (velocity * 0.01)));
      const friction = Math.max(0.01, Math.min(0.85, 0.05 + (velocity * 0.0003))).toFixed(2);

      setTelemetry({
        x: Math.round(x),
        y: Math.round(y),
        velocity: Math.min(950, velocity),
        resonance: resonance.toFixed(1),
        friction,
        activeNode: matchedNode
      });

      lastPos.current = { x, y, time: now };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3D Parallax Tilt for Eye Artwork
  const handleEyeParallax = (e) => {
    if (isLite) return;
    const frame = eyeFrameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to('.ab-eye-image', {
      rotateX: -y * 15,
      rotateY: x * 15,
      x: x * 8,
      y: y * 8,
      duration: 0.4,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  };

  const handleEyeMouseLeave = () => {
    if (isLite) return;
    gsap.to('.ab-eye-image', {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  return (
    <div ref={containerRef} className="about-page-wrapper">
      <div className="section-glow-line" aria-hidden="true" />
      <div className="about-bg-glow" />

      <div className="container about-container">
        {/* Poetic Intro Block */}
        <header className="about-header">
          <div className="about-grid-top">
            {/* Left Column: Visual focal point of the Eye */}
            <div 
              ref={eyeFrameRef}
              className="ab-eye-frame"
              onMouseMove={handleEyeParallax}
              onMouseLeave={handleEyeMouseLeave}
            >
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="ab-eye-artwork-wrap">
                <img 
                  src="/assets/gaze_eye_artwork.png" 
                  alt="Human Gaze Resonance Artwork" 
                  className="ab-eye-image"
                  draggable="false"
                />
              </div>
              <div className="ab-eye-label">[ COGNITIVE GAZE FOCAL POINT ]</div>
            </div>

            {/* Right Column: High-Impact Perception Philosophy */}
            <div className="ab-hero-text">
              <span className="ab-eyebrow eyebrow">THE PSYCHOLOGY OF GAZE</span>
              <h1 className="ab-title display-sm">Designed for the Human Eye.</h1>
              <p className="ab-lead body-lg">
                We do not build for bots or cold statistics. We design for the human eye—the split-second psychological threshold where light hits the retina, and a human heart makes a choice.
              </p>
              <p className="ab-text body-md">
                In an era of generic templates and mechanical optimization, we return to the biology of sight. By combining deep cognitive science, sensory ergonomics, and luxurious dark-mode aesthetics, we craft digital portals that capture attention within 50ms and convert that attention into brand devotion.
              </p>
            </div>
          </div>
        </header>

        {/* Cognitive Manifesto Pillars */}
        <section className="about-manifesto-section">
          <div className="about-section-header">
            <span className="eyebrow">COGNITIVE BLUEPRINT</span>
            <h2 className="heading-md">The Pillars of Visual Love</h2>
          </div>

          <div className="manifesto-grid">
            {/* Pillar 1 */}
            <div className="manifesto-item">
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="manifesto-inner">
                <span className="manifesto-num">01 // ATTENTION APERTURE</span>
                <h3 className="manifesto-label">The 50ms Impression</h3>
                <p className="manifesto-desc body-sm">
                  First impressions are neurological, not logical. We utilize high-contrast champagne vectors, rich atmospheric depth, and purposeful kinetic transitions to trigger instant release of dopamine, establishing an immediate visceral connection.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="manifesto-item">
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="manifesto-inner">
                <span className="manifesto-num">02 // EASE & RESONANCE</span>
                <h3 className="manifesto-label">Cognitive Calm</h3>
                <p className="manifesto-desc body-sm">
                  Clutter induces visual exhaust. We structure spatial layout using luxurious spacing tokens, elegant serif typography, and balanced visual weights to lower cognitive load. When using a site feels effortless, interaction feels peaceful and premium.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="manifesto-item">
              <div className="hud-brackets" aria-hidden="true">
                <div className="hud-corner-r tl" />
                <div className="hud-corner-r tr" />
                <div className="hud-corner-r bl" />
                <div className="hud-corner-r br" />
              </div>
              <div className="manifesto-inner">
                <span className="manifesto-num">03 // INTENTIONAL ACTION</span>
                <h3 className="manifesto-label">Earning the Choice</h3>
                <p className="manifesto-desc body-sm">
                  Conversions are a byproduct of resonance, not surveillance or force. By leading users through clear spatial storytelling and respectful UX, we transform standard leads into deliberate commitments, resulting in higher qualified conversion rates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Gaze Attention Simulator Panel */}
        <section className="about-interactive-section">
          <div className="gaze-simulator-panel">
            <div className="hud-brackets" aria-hidden="true">
              <div className="hud-corner-r tl" />
              <div className="hud-corner-r tr" />
              <div className="hud-corner-r bl" />
              <div className="hud-corner-r br" />
            </div>

            <div className="simulator-grid">
              {/* Left Column: Interactive Canvas */}
              <div className="simulator-stage-wrap">
                <canvas ref={canvasRef} className="simulator-canvas" />
                <div className="simulator-overlay-label">// GAZE SIMULATION FIELD (HOVER & MOVE MOUSE)</div>
              </div>

              {/* Right Column: Real-Time Cognitive Telemetry */}
              <div className="simulator-telemetry-wrap">
                <span className="eyebrow">// REAL-TIME COGNITIVE SCANNERS</span>
                <h3 className="sim-title">Retinal Perception Telemetry</h3>
                <p className="sim-desc body-sm">
                  Move your cursor across the focus grid to observe how visual layout elements hook the eye and shape the gaze.
                </p>

                <div className="telemetry-hud-rows">
                  <div className="hud-row">
                    <span className="hud-lbl">FOCAL ANCHOR</span>
                    <span className="hud-val text-accent">{telemetry.activeNode}</span>
                  </div>
                  <div className="hud-row">
                    <span className="hud-lbl">COGNITIVE POSITION</span>
                    <span className="hud-val">[X: {telemetry.x}px // Y: {telemetry.y}px]</span>
                  </div>
                  <div className="hud-row">
                    <span className="hud-lbl">GAZE ACCURACY</span>
                    <span className="hud-val">{telemetry.activeNode !== 'Saccadic Drift' ? '100% (LOCKED)' : 'Saccadic Search'}</span>
                  </div>
                  <div className="hud-row">
                    <span className="hud-lbl">RETINAL VELOCITY</span>
                    <span className="hud-val">{telemetry.velocity} px/s</span>
                  </div>
                  <div className="hud-row">
                    <span className="hud-lbl">COGNITIVE FRICTION</span>
                    <span className="hud-val" style={{ color: telemetry.friction > 0.4 ? 'var(--accent-ember)' : 'inherit' }}>
                      {telemetry.friction} ms
                    </span>
                  </div>
                  <div className="hud-row text-highlight">
                    <span className="hud-lbl" style={{ color: 'var(--accent-ember)' }}>EMOTIONAL RESONANCE</span>
                    <span className="hud-val" style={{ color: 'var(--accent-ember)', fontWeight: 'bold' }}>{telemetry.resonance}%</span>
                  </div>
                </div>

                <div className="sim-footer-note">
                  * Dotted crosshairs represent the saccadic scanner grid simulating retinal focus zones.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Poetic Closing & Action Section */}
        <section className="about-footer-cta">
          <div className="about-cta-card">
            <h2 className="heading-md about-cta-heading">Ready to capture the gaze?</h2>
            <p className="body-md about-cta-sub">
              Let us map your business's visual strategy and build a premium digital asset that commands respect, interest, and conversions.
            </p>
            <div className="about-cta-actions">
              <button 
                onClick={() => onViewChange('demo')}
                className="btn-primary"
              >
                BOOK FREE TECHNICAL ROADMAP <span className="btn-arrow">↗</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
