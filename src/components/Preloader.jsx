import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Logo from './Logo';

export default function Preloader({ onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    /* Three.js preloader scene */
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 4;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // TorusKnot
    const tkGeo = new THREE.TorusKnotGeometry(1, 0.3, 200, 20);
    const tkMat = new THREE.MeshBasicMaterial({ color: 0x7B3FE4, wireframe: true, transparent: true, opacity: 0 });
    const tk = new THREE.Mesh(tkGeo, tkMat);
    tk.scale.set(0, 0, 0);
    scene.add(tk);

    // Particle ring
    const ringGeo = new THREE.BufferGeometry();
    const ringCount = 300;
    const rPos = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      rPos[i * 3] = Math.cos(angle) * 2;
      rPos[i * 3 + 1] = Math.sin(angle) * 2;
      rPos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    ringGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
    const ringMat = new THREE.PointsMaterial({ color: 0xA78BFA, size: 0.025, transparent: true, opacity: 0.5 });
    const ring = new THREE.Points(ringGeo, ringMat);
    scene.add(ring);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      tk.rotation.x += 0.008;
      tk.rotation.y += 0.012;
      ring.rotation.z += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    /* GSAP Timeline */
    const tl = gsap.timeline({
      onComplete: () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
        tkGeo.dispose();
        tkMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        if (onComplete) onComplete();
      }
    });

    tl.to(tk.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'power2.out' }, 0)
      .to(tkMat, { opacity: 0.3, duration: 1.0, ease: 'power2.out' }, 0)
      .to('.preloader-logo', { scale: 1, opacity: 1, duration: 1.0, ease: 'elastic.out(1,0.6)' }, 0.3)
      .to('.preloader-wordmark', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.0)
      .to('.preloader-line', { width: '200px', duration: 0.6, ease: 'power3.inOut' }, 1.4)
      .to('.preloader-text', { opacity: 1, duration: 0.4 }, 1.8)
      .to(containerRef.current, { y: '-100vh', duration: 0.8, ease: 'power4.in' }, 2.4);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div className="preloader" ref={containerRef}>
      <canvas ref={canvasRef} className="preloader-canvas" />
      <div className="preloader-content">
        <div className="preloader-glow" />
        <div className="preloader-logo">
          <Logo size={80} />
        </div>
        <div className="preloader-wordmark">
          <span className="odd">odd</span>
          <span className="webs">webs</span>
        </div>
        <div className="preloader-line" />
        <div className="preloader-text">Crafting your experience...</div>
      </div>
      <div className="preloader-dots">
        {Array.from({ length: 16 }).map((_, i) => <span key={i} />)}
      </div>
    </div>
  );
}
