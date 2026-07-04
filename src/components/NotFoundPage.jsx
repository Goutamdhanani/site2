import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';

export default function NotFoundPage({ onViewChange }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  
  // Dynamic portal theme based on hovered action
  const [activeTheme, setActiveTheme] = useState('void'); // 'void', 'home', 'portfolio', 'demo'

  // ─── GRAVITY GALAXY PHYSICS SIMULATION ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const particles = [];
    const particleCount = isLite ? 60 : 180;
    const mouse = { x: -1000, y: -1000, active: false, radius: 150 };
    const shockwaves = [];

    // Resize canvas to fill the parent container bounds
    const resizeCanvas = () => {
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize Particles
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.6;
        
        // Base orbit settings
        this.angle = Math.random() * Math.PI * 2;
        this.orbitSpeed = (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
        this.orbitRadius = Math.random() * 80 + 30;
        
        // Velocity for drift when cursor is absent
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.3 ? 'rgba(199, 154, 75, ' : 'rgba(249, 87, 56, '; // gold or ember
      }

      update() {
        // 1. Shockwave Ripple Physics
        shockwaves.forEach(wave => {
          const dx = this.x - wave.x;
          const dy = this.y - wave.y;
          const dist = Math.hypot(dx, dy);
          if (dist < wave.currentRadius && dist > wave.currentRadius - 30) {
            const force = (1 - dist / wave.maxRadius) * wave.force;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
          }
        });

        // 2. Gravitational pull toward mouse position
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 1.5;
            const angle = Math.atan2(dy, dx);
            
            // Orbiting effect around gravity point
            this.x += Math.cos(angle + Math.PI / 2) * this.orbitSpeed * dist * 0.2;
            this.y += Math.sin(angle + Math.PI / 2) * this.orbitSpeed * dist * 0.2;
            
            // Subtle pull
            this.x += Math.cos(angle) * force * 0.5;
            this.y += Math.sin(angle) * force * 0.5;
          } else {
            this.x += this.vx;
            this.y += this.vy;
          }
        } else {
          this.x += this.vx;
          this.y += this.vy;
        }

        // Boundary wrap
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `${this.color}${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Populate
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Simulation Loop
    const loop = () => {
      ctx.fillStyle = 'rgba(7, 5, 4, 0.15)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render grid coordinates overlay
      ctx.strokeStyle = 'rgba(199, 154, 75, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
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

      // Draw active gravity radius indicator
      if (mouse.active && !isLite) {
        ctx.strokeStyle = 'rgba(199, 154, 75, 0.04)';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update and Draw Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const wave = shockwaves[i];
        wave.currentRadius += wave.speed;
        
        // Draw expanding light ring
        ctx.strokeStyle = `rgba(249, 87, 56, ${(1 - wave.currentRadius / wave.maxRadius) * 0.18})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (wave.currentRadius >= wave.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // Update and Draw Particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    // Event Listeners
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Trigger shockwave pulse pushing particles away
      shockwaves.push({
        x: clickX,
        y: clickY,
        currentRadius: 0,
        maxRadius: 280,
        speed: 8,
        force: 18
      });
      
      // Flash animation on page content
      gsap.fromTo('.nf-content-inner', { filter: 'brightness(2) contrast(1.5)' }, {
        filter: 'brightness(1) contrast(1)',
        duration: 0.4,
        ease: 'power2.out'
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ─── ENTRANCE ANIMATIONS ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Glitch header reveal
      gsap.fromTo('.nf-num', { opacity: 0, scale: 0.9, y: 30 }, {
        opacity: 1, scale: 1, y: 0,
        duration: 1.0, ease: 'elastic.out(1, 0.75)'
      });

      gsap.fromTo('.nf-eyebrow', { opacity: 0, y: 15 }, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2
      });

      gsap.fromTo('.nf-title', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3
      });

      gsap.fromTo('.nf-desc', { opacity: 0, y: 15 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4
      });

      // Actions buttons fade-in
      gsap.fromTo('.nf-portal-item', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out', delay: 0.5
      });
    }, containerRef);

    // Continuous text glitch flicker
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.82) {
        gsap.fromTo('.nf-num', { skewX: () => Math.random() * 20 - 10, x: () => Math.random() * 10 - 5 }, {
          skewX: 0, x: 0, duration: 0.15, ease: 'power1.inOut'
        });
      }
    }, 400);

    return () => {
      ctx.revert();
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className={`not-found-wrapper theme-${activeTheme}`}>
      {/* Background Interactive Gravity Field */}
      <div className="nf-physics-container">
        <canvas ref={canvasRef} className="nf-canvas" />
      </div>

      {/* Atmospheric Color Blooms */}
      <div className="nf-glow nf-glow--champagne" aria-hidden="true" />
      <div className="nf-glow nf-glow--accent" aria-hidden="true" />

      {/* Main Content Layout */}
      <div className="nf-content">
        <div className="nf-content-inner">
          {/* Poetic Telemetry Brackets */}
          <div className="hud-brackets" aria-hidden="true">
            <div className="hud-corner-r tl" />
            <div className="hud-corner-r tr" />
            <div className="hud-corner-r bl" />
            <div className="hud-corner-r br" />
          </div>

          <div className="nf-telemetry-header">
            <span>[ WARNING: UNKNOWN COORDINATES ]</span>
            <span>SYSTEM STATE: DRIFTING</span>
          </div>

          <div className="nf-num-wrap">
            <div ref={titleRef} className="nf-num" data-text="404">404</div>
          </div>

          <span className="nf-eyebrow eyebrow">OUT OF RANGE</span>
          <h1 className="nf-title heading-md">Dimensional Drift.</h1>
          <p className="nf-desc body-md">
            The page you are looking for has been decoupled from the network or has ceased to exist. Move your cursor across the grid below to gather drift elements, or select a portal destination.
          </p>

          {/* Interactive Portal Navigation Options */}
          <div className="nf-portal-actions">
            <button
              className="nf-portal-item btn-outline"
              onClick={() => onViewChange('home')}
              onMouseEnter={() => setActiveTheme('home')}
              onMouseLeave={() => setActiveTheme('void')}
            >
              <span className="portal-indicator">[ 01 ]</span> ORBIT HOME
            </button>
            <button
              className="nf-portal-item btn-outline"
              onClick={() => onViewChange('portfolio')}
              onMouseEnter={() => setActiveTheme('portfolio')}
              onMouseLeave={() => setActiveTheme('void')}
            >
              <span className="portal-indicator">[ 02 ]</span> EXPLORE WORK
            </button>
            <button
              className="nf-portal-item btn-outline highlight"
              onClick={() => onViewChange('demo')}
              onMouseEnter={() => setActiveTheme('demo')}
              onMouseLeave={() => setActiveTheme('void')}
            >
              <span className="portal-indicator">[ 03 ]</span> CONSULT ENGINEER
            </button>
          </div>

          <div className="nf-telemetry-footer">// CLICK CANVAS FIELD TO EMIT SHOCKWAVE DISPLACEMENT</div>
        </div>
      </div>
    </div>
  );
}
