import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';
import { isLite } from '../utils/device';
import SplitHeading from './SplitHeading';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { 
    value: 320, 
    suffix: '%', 
    label: 'Revenue Growth', 
    color: 'var(--accent-ember)',
    desc: 'Rebuilt LunaCart\'s headless checkout and AI fashion recommendations, generating 320% growth.',
    icon: (
      <svg className="stat-micro-graphic" viewBox="0 0 80 30" fill="none">
        <circle cx="15" cy="15" r="4" fill="var(--accent-ember)" className="pulse-node" />
        <circle cx="40" cy="8" r="4.5" fill="var(--bg-primary)" stroke="var(--accent-ember)" strokeWidth="1.5" />
        <circle cx="65" cy="20" r="4" fill="var(--accent-ember)" className="pulse-node-delay" />
        <line x1="19" y1="14" x2="36" y2="9" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="44" y1="10" x2="61" y2="18" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </svg>
    )
  },
  { 
    value: 45, 
    suffix: '%', 
    label: 'Churn Reduced', 
    color: 'var(--accent-amber)',
    desc: 'Optimized DataFlow\'s real-time SaaS analytics dashboards, reducing customer churn by 45%.',
    icon: (
      <svg className="stat-micro-graphic stat-micro-graphic--circle" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="16" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
        <circle cx="20" cy="20" r="16" stroke="var(--accent-amber)" strokeWidth="3" 
          strokeDasharray="100.5" strokeDashoffset="2" strokeLinecap="round" className="stat-progress-ring" />
      </svg>
    )
  },
  { 
    value: 2.4, 
    suffix: 'M', 
    label: 'Funding Secured', 
    decimals: 1, 
    color: 'var(--accent-gold)',
    desc: 'Engineered Payze\'s mobile banking MVP in 5 weeks, helping them secure $2.4M in seed funding.',
    icon: (
      <svg className="stat-micro-graphic" viewBox="0 0 80 35" fill="none">
        <defs>
          <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,32 Q18,25 36,18 T72,4 L80,4 L80,35 L0,35 Z" fill="url(#roiGrad)" />
        <path d="M0,32 Q18,25 36,18 T72,4" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="72" cy="4" r="3" fill="var(--accent-gold)" />
      </svg>
    )
  },
  { 
    value: 80, 
    suffix: '%', 
    label: 'Work Automation', 
    color: 'var(--accent-lacquer)',
    desc: 'Built VoyageAI\'s automated webhook and LLM pipelines, eliminating 80% of manual entry.',
    icon: (
      <svg className="stat-micro-graphic" viewBox="0 0 80 30" fill="none">
        <path d="M0,15 H20 L25,5 L30,25 L35,12 L40,18 L45,15 H80" 
          fill="none" stroke="var(--accent-lacquer)" strokeWidth="1.5" className="stat-heartbeat" />
      </svg>
    )
  },
];

export default function Metrics() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeStat, setActiveStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Monitor visibility of the section to pause the rendering loop when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ─── CANVAS HOLOGRAPHIC GRAPHICS ───
  useEffect(() => {
    if (prefersReducedMotion() || !canvasRef.current || !isVisible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = 380;
    let height = canvas.height = 380;
    let time = 0;

    // Handle resizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width * window.devicePixelRatio;
      height = canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      width = rect.width;
      height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Initialize particles
    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.005,
        orbitRadius: Math.random() * 90 + 30,
      });
    }

    // Color transition interpolation
    let currentRGB = { r: 249, g: 87, b: 56 }; // Start Ember
    const getTargetRGB = (index) => {
      if (index === 0) return { r: 249, g: 87, b: 56 };  // Ember
      if (index === 1) return { r: 238, g: 155, b: 0 };  // Amber
      if (index === 2) return { r: 233, g: 216, b: 166 }; // Gold
      return { r: 174, g: 32, b: 18 };                    // Lacquer
    };

    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth color transition interpolation
      const targetRGB = getTargetRGB(activeStat);
      currentRGB.r += (targetRGB.r - currentRGB.r) * 0.08;
      currentRGB.g += (targetRGB.g - currentRGB.g) * 0.08;
      currentRGB.b += (targetRGB.b - currentRGB.b) * 0.08;

      const r = Math.round(currentRGB.r);
      const g = Math.round(currentRGB.g);
      const b = Math.round(currentRGB.b);
      const activeColor = `rgb(${r}, ${g}, ${b})`;

      // ─── STATE DRAWING ROUTINES ───
      if (activeStat === 0) {
        // STATE 0: Constellation map (Projects)
        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;

          // Bounce walls
          if (p.x < 10 || p.x > width - 10) p.vx *= -1;
          if (p.y < 10 || p.y > height - 10) p.vy *= -1;

          // Draw node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
          ctx.fill();

          // Connect close nodes
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 60) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.18 * (1 - dist / 60)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });

        // Center hub glow
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 10 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

      } else if (activeStat === 1) {
        // STATE 1: Concentric Breathing Ripples (Satisfaction)
        const centerX = width / 2;
        const centerY = height / 2;

        // Ripples
        for (let i = 0; i < 4; i++) {
          const rippleRadius = ((time * 40 + i * 40) % 150) + 15;
          const alpha = 1 - rippleRadius / 165;
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.25})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Circular orbiting nodes
        particles.forEach((p) => {
          p.angle += p.speed * 0.7;
          const px = centerX + Math.cos(p.angle) * p.orbitRadius;
          const py = centerY + Math.sin(p.angle) * p.orbitRadius;

          ctx.beginPath();
          ctx.arc(px, py, p.radius * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
          ctx.fill();

          // Connect to center core
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.04)`;
          ctx.stroke();
        });

        // Glowing center sun
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (activeStat === 2) {
        // STATE 2: Rising Exponential Wave (ROI)
        ctx.beginPath();
        ctx.moveTo(10, height - 20);

        const points = [];
        const resolution = 24;
        for (let i = 0; i <= resolution; i++) {
          const px = 10 + (i / resolution) * (width - 20);
          const ratio = i / resolution;
          // Exponential curve formula
          const baseHeight = height - 20 - Math.pow(ratio, 2.5) * (height - 80);
          const py = baseHeight + Math.sin(ratio * 8 + time * 2.5) * 6;
          points.push({ x: px, y: py });
        }

        // Draw fill under curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - 20);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - 20);
        ctx.closePath();
        
        const graphGrad = ctx.createLinearGradient(0, 40, 0, height);
        graphGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
        graphGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = graphGrad;
        ctx.fill();

        // Draw main line path
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw vertical columns
        points.forEach((p, idx) => {
          if (idx % 3 === 0 && idx > 0 && idx < points.length - 1) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y + 4);
            ctx.lineTo(p.x, height - 20);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Tiny column head dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = activeColor;
            ctx.fill();
          }
        });

      } else {
        // STATE 3: Cybernetic Dial (Uptime)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 90;

        // Ring dial border
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
        ctx.lineWidth = 5;
        ctx.stroke();

        // Active spinning segments
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, time * 0.8, time * 0.8 + Math.PI * 0.6);
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dial ticks
        ctx.save();
        ctx.translate(centerX, centerY);
        const ticks = 30;
        for (let i = 0; i < ticks; i++) {
          ctx.beginPath();
          ctx.moveTo(0, -radius + 8);
          ctx.lineTo(0, -radius + 14);
          ctx.strokeStyle = i % 5 === 0 ? `rgba(${r}, ${g}, ${b}, 0.5)` : `rgba(255, 255, 255, 0.08)`;
          ctx.lineWidth = i % 5 === 0 ? 1.5 : 1;
          ctx.stroke();
          ctx.rotate((Math.PI * 2) / ticks);
        }
        ctx.restore();

        // Pulsing status heartbeat node
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15 + Math.sin(time * 3) * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = activeColor;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeStat, isVisible]);

  // ─── SCROLL REVEALS & COUNT-UP ANIMATIONS ───
  useEffect(() => {
    if (prefersReducedMotion) {
      // Fallback for reduced motion: set values immediately
      const statsEl = document.querySelectorAll('.stat-val-counter');
      statsEl.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals) || 0;
        el.textContent = target.toFixed(decimals);
      });
      // Force cards to be visible
      const cards = document.querySelectorAll('.met-card');
      gsap.set(cards, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)'
      });
      return;
    }

    const ctx = gsap.context(() => {
      if (isLite) {
        // ─── MOBILE LITE CHEAP REVEALS & COUNT-UPS ───
        // Card reveals (simple opacity + y)
        gsap.utils.toArray('.met-card').forEach((card) => {
          gsap.fromTo(card, {
            y: 30,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            }
          });
        });

        // Number counters count-up
        const numbers = gsap.utils.toArray('.stat-val-counter');
        numbers.forEach((el) => {
          const target = parseFloat(el.dataset.target);
          const decimals = parseInt(el.dataset.decimals) || 0;

          gsap.fromTo({ val: 0 }, { val: 0 }, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
            onUpdate() {
              el.textContent = this.targets()[0].val.toFixed(decimals);
            },
          });
        });

        return;
      }

      // ─── DESKTOP CINEMATIC REVEALS & COUNT-UPS ───
      // Card reveals
      gsap.utils.toArray('.met-card').forEach((card) => {
        gsap.fromTo(card, {
          y: 70,
          opacity: 0,
          scale: 0.88,
          rotateX: 10,
          filter: 'blur(6px)',
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            once: true,
          },
          stagger: 0.08,
        });
      });

      // Number counters count-up
      const numbers = gsap.utils.toArray('.stat-val-counter');
      numbers.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals) || 0;

        gsap.fromTo({ val: 0 }, { val: 0 }, {
          val: target,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent = this.targets()[0].val.toFixed(decimals);
          },
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} data-scene="metrics" className="met-section">
      <div className="section-glow-line" aria-hidden="true" />

      <div className="container">
        {/* Header */}
        <div className="metrics-header">
          <p className="eyebrow">The Metrics</p>
          <SplitHeading text="Results" className="metrics-big-title" />
          <p className="metrics-subtitle">
            Strategic digital interventions that generate provable commercial traction.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="met-layout-grid">
          {/* Left Column: Interactive Sci-fi HUD Visualizer */}
          <div className="metrics-visualizer-col">
            <div 
              className="visualizer-hud-panel" 
              style={{ '--active-stat-color': stats[activeStat].color }}
            >
              {/* Background scanlines & grid */}
              <div className="hud-backplane" />
              <div className="hud-lines" />
              
              {/* Rotating radar graphic */}
              <canvas ref={canvasRef} className="metrics-canvas" />

              {/* Live HUD Readouts */}
              <div className="vis-hud-data-feed">
                <span className="feed-title">CORE_SYS // MATRIX_D</span>
                <div className="feed-metrics">
                  <span>SCALE: 1.0x</span>
                  <span>RATE: 60Hz</span>
                  <span>INDEX: 0x{activeStat}FD</span>
                </div>
              </div>

              {/* Crosshair indicator */}
              <div className="hud-crosshair" />
            </div>
          </div>

          {/* Right Column: Asymmetric Glass Cards */}
          <div className="metrics-cards-col">
            <div className="metrics-asym-grid">
              {stats.map((stat, i) => (
                <div 
                  key={i} 
                  className={`met-card met-card--${i} ${activeStat === i ? 'met-card--active' : ''}`}
                  style={{ '--stat-color': stat.color }}
                  onMouseEnter={() => setActiveStat(i)}
                >
                  <div className="met-card-header">
                    <span className="met-card-badge">{stat.label}</span>
                    {stat.icon}
                  </div>

                  <div className="met-card-body">
                    <div className="met-value-row">
                      <span 
                        className="stat-val-counter"
                        data-target={stat.value}
                        data-decimals={stat.decimals || 0}
                      >
                        0
                      </span>
                      <span className="met-suffix">{stat.suffix}</span>
                    </div>
                    <p className="met-desc">{stat.desc}</p>
                  </div>
                  
                  <div className="met-card-glow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
