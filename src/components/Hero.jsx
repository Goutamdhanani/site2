import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Logo from './Logo';

const cyclingWords = ['Websites.', 'Mobile Apps.', 'AI Systems.', 'Automations.', 'Growth Engines.'];

const avatarColors = [
  'linear-gradient(135deg, #7B3FE4, #A78BFA)',
  'linear-gradient(135deg, #06EFC5, #A78BFA)',
  'linear-gradient(135deg, #FFD166, #FF5F57)',
  'linear-gradient(135deg, #A78BFA, #6B21A8)',
  'linear-gradient(135deg, #06EFC5, #7B3FE4)',
];
const avatarInitials = ['PK', 'AM', 'RK', 'SJ', 'VP'];

const orbitCards = [
  { icon: '🌐', label: 'Websites', color: '#06EFC5' },
  { icon: '📱', label: 'Mobile Apps', color: '#A78BFA' },
  { icon: '⚡', label: 'AI Systems', color: '#FFD166' },
  { icon: '⚙️', label: 'Automations', color: '#7B3FE4' },
  { icon: '📊', label: 'Dashboards', color: '#06EFC5' },
];

export default function Hero() {
  const canvasRef = useRef(null);
  const [typedWord, setTypedWord] = useState('');
  const [orbitsVisible, setOrbitsVisible] = useState(false);
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);

  useEffect(() => {
    /* Three.js hero background */
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const isMobile = 'ontouchstart' in window;
    const particleMultiplier = isMobile ? 0.5 : 1;

    // Object A — Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x7B3FE4, wireframe: true, transparent: true, opacity: 0.15 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(3, 0, -1);
    scene.add(ico);

    // Object B — Particle sphere
    const pCount = Math.floor(3000 * particleMultiplier);
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 0.5;
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xA78BFA, size: 0.02, transparent: true, opacity: 0.6 });
    const pSphere = new THREE.Points(pGeo, pMat);
    pSphere.position.set(3, 0, -1);
    scene.add(pSphere);

    // Object C — Torus ring
    const torusGeo = new THREE.TorusGeometry(2.2, 0.015, 8, 100);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x06EFC5, transparent: true, opacity: 0.3 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 3;
    torus.position.set(3, 0, -1);
    scene.add(torus);

    // Object D — Star field
    const starCount = Math.floor(5000 * particleMultiplier);
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.4 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isMobile) window.addEventListener('mousemove', onMouseMove);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      ico.rotation.x += 0.003;
      ico.rotation.y += 0.005;
      pSphere.rotation.y += 0.001;
      torus.rotation.z += 0.002;
      stars.rotation.y += 0.0002;

      // Camera parallax
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (!isMobile) window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      icoGeo.dispose(); icoMat.dispose();
      pGeo.dispose(); pMat.dispose();
      torusGeo.dispose(); torusMat.dispose();
      starGeo.dispose(); starMat.dispose();
    };
  }, []);

  // GSAP hero entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 3.0 });
    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo('.hero-headline .char', { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.018, duration: 0.8, ease: 'power4.out' }, 0.2)
      .to('.hero-subtitle-wrap', { opacity: 1, duration: 0.5 }, 1.0)
      .fromTo('.hero-ctas', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 1.2)
      .to('.hero-social-proof', { opacity: 1, duration: 0.6 }, 1.5)
      .add(() => setOrbitsVisible(true), 1.0);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const type = () => {
      const currentWord = cyclingWords[wordIndex.current];
      if (!isDeleting.current) {
        charIndex.current++;
        setTypedWord(currentWord.substring(0, charIndex.current));
        if (charIndex.current === currentWord.length) {
          isDeleting.current = true;
          setTimeout(type, 1500);
          return;
        }
        setTimeout(type, 60);
      } else {
        charIndex.current--;
        setTypedWord(currentWord.substring(0, charIndex.current));
        if (charIndex.current === 0) {
          isDeleting.current = false;
          wordIndex.current = (wordIndex.current + 1) % cyclingWords.length;
          setTimeout(type, 300);
          return;
        }
        setTimeout(type, 30);
      }
    };
    const timeout = setTimeout(type, 3800);
    return () => clearTimeout(timeout);
  }, []);

  // Counter animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.metric-number');
          counters.forEach(el => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const duration = 2;
            gsap.fromTo(el, { innerText: 0 }, {
              innerText: target,
              duration,
              snap: { innerText: target % 1 === 0 ? 1 : 0.1 },
              ease: 'power2.out',
              onUpdate: function () {
                const val = parseFloat(gsap.getProperty(el, 'innerText'));
                el.textContent = prefix + (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
              }
            });
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const metricsEl = document.querySelector('.hero-metrics');
    if (metricsEl) observer.observe(metricsEl);
    return () => observer.disconnect();
  }, []);

  const headlineText = 'We build digital';
  const highlightText = 'powerhouses.';

  return (
    <section className="hero" id="hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-eyebrow" style={{ transform: 'translateY(-10px)' }}>
            ◆&nbsp; WEB · MOBILE · AI · AUTOMATION
          </div>

          <h1 className="hero-headline">
            {headlineText.split('').map((c, i) => (
              <span className="char" key={i}>{c === ' ' ? '\u00A0' : c}</span>
            ))}
            <br />
            <span className="highlight">
              {highlightText.split('').map((c, i) => (
                <span className="char" key={`h-${i}`}>{c}</span>
              ))}
            </span>
          </h1>

          <div className="hero-subtitle-wrap" style={{ opacity: 0 }}>
            <p className="hero-subtitle">
              We design, develop and scale{' '}
              <span className="typing-word">{typedWord}</span>
              <span className="typing-cursor" />
            </p>
          </div>

          <div className="hero-ctas" style={{ opacity: 0 }}>
            <a href="#cta" className="btn-primary magnetic">Book a Free Call →</a>
            <a href="#case-studies" className="btn-secondary magnetic">View Our Work ▶</a>
          </div>

          <div className="hero-social-proof">
            <div className="avatar-stack">
              {avatarInitials.map((init, i) => (
                <div key={i} className="avatar-circle" style={{ background: avatarColors[i], zIndex: 5 - i }}>
                  {init}
                </div>
              ))}
            </div>
            <div>
              <div className="social-text">50+ startups trust oddwebs</div>
              <div>
                <span className="social-stars">★★★★★</span>
                <span className="social-text" style={{ marginLeft: 6 }}>4.9/5 from 127 reviews</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-cluster">
            <div className="hub-card">
              <div className="hub-glow" />
              <Logo size={60} />
            </div>
            {orbitCards.map((card, i) => (
              <div key={i} className={`orbit-card${orbitsVisible ? ' visible' : ''}`} style={{ transitionDelay: `${i * 0.1}s`, transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <span className="orbit-icon">{card.icon}</span>
                <span style={{ color: card.color }}>{card.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-metrics">
        <div className="metric-item">
          <span className="metric-icon">📦</span>
          <div>
            <div className="metric-number" data-target="120" data-suffix="+">0</div>
            <div className="metric-label">Projects Delivered</div>
          </div>
        </div>
        <div className="metric-divider" />
        <div className="metric-item">
          <span className="metric-icon">😊</span>
          <div>
            <div className="metric-number" data-target="98" data-suffix="%">0</div>
            <div className="metric-label">Client Satisfaction</div>
          </div>
        </div>
        <div className="metric-divider" />
        <div className="metric-item">
          <span className="metric-icon">⏱</span>
          <div>
            <div className="metric-number" data-target="3" data-suffix="+">0</div>
            <div className="metric-label">Years Experience</div>
          </div>
        </div>
        <div className="metric-divider" />
        <div className="metric-item">
          <span className="metric-icon">🌍</span>
          <div>
            <div className="metric-number" data-target="21" data-suffix="">0</div>
            <div className="metric-label">Countries Served</div>
          </div>
        </div>
      </div>
    </section>
  );
}
