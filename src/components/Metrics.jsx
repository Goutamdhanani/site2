import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const metrics = [
  { value: '₹4.2Cr+', label: 'Revenue Generated for Clients' },
  { value: '47+', label: 'Projects Delivered' },
  { value: '4.9 ★', label: 'Average Client Rating' },
  { value: '18', label: 'Industries Served' },
];

export default function Metrics() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    /* Three.js particle background */
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const isMobile = 'ontouchstart' in window;
    const count = isMobile ? 750 : 1500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      velocities[i] = 0.001 + Math.random() * 0.002;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x7B3FE4, size: 0.02, transparent: true, opacity: 0.3
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const positions = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += velocities[i];
        if (positions[i * 3 + 1] > 5) positions[i * 3 + 1] = -5;
      }
      geo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    // Only animate when visible
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) animate();
      else cancelAnimationFrame(animId);
    }, { threshold: 0.1 });
    observer.observe(sectionRef.current);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geo.dispose(); mat.dispose();
    };
  }, []);

  // Animate bar on scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.featured-impact',
        start: 'top 80%',
        onEnter: () => {
          if (barRef.current) barRef.current.style.width = '45%';
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="metrics-section" ref={sectionRef} id="metrics">
      <canvas ref={canvasRef} className="metrics-canvas" />
      <div className="metrics-content">
        <div className="section-header">
          <span className="section-pill">[ PROOF IN NUMBERS ]</span>
          <h2 className="section-title">Results that <span className="highlight">speak.</span></h2>
        </div>

        <div className="metrics-grid">
          {metrics.map((m, i) => (
            <div className="metric-card" key={i}>
              <div className="metric-card-number">{m.value}</div>
              <div className="metric-card-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="featured-impact">
          <div>
            <div className="featured-label">[ FEATURED IMPACT ]</div>
            <div className="featured-project">DataFlow</div>
            <div className="featured-type">SaaS Analytics Platform</div>
            <div className="featured-metric">45%</div>
            <div className="featured-caption">Churn rate reduced in 90 days</div>
            <div className="featured-bar-wrap">
              <div className="featured-bar" ref={barRef} />
            </div>
          </div>
          <div>
            <div className="review-badges" style={{ flexDirection: 'column' }}>
              <div className="review-badge">
                <span className="review-badge-stars">★★★★★</span>
                <span className="review-badge-score">4.9/5</span>
                <span className="review-badge-text">Google Reviews</span>
              </div>
              <div className="review-badge">
                <span style={{ fontSize: 18 }}>🏆</span>
                <span className="review-badge-text">Top Agency India 2024 — Clutch</span>
              </div>
              <div className="review-badge" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #7B3FE4, #A78BFA)', width: 28, height: 28, fontSize: 9, marginLeft: 0 }}>RK</div>
                  <span style={{ fontSize: 12, color: '#9B8EC4' }}>"320% revenue growth in 6 months"</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #06EFC5, #A78BFA)', width: 28, height: 28, fontSize: 9, marginLeft: 0 }}>AM</div>
                  <span style={{ fontSize: 12, color: '#9B8EC4' }}>"Churn dropped 45% — game changer"</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #FFD166, #FF5F57)', width: 28, height: 28, fontSize: 9, marginLeft: 0 }}>VP</div>
                  <span style={{ fontSize: 12, color: '#9B8EC4' }}>"Built our MVP in 5 weeks flat"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
