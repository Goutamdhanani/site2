import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FinalCTA() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Large wireframe sphere
    const sphereGeo = new THREE.SphereGeometry(4, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x7B3FE4, wireframe: true, transparent: true, opacity: 0.08 });
    const bigSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(bigSphere);

    // Inner core
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 3);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x06EFC5, wireframe: true, transparent: true, opacity: 0.6 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Two torus rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x7B3FE4, transparent: true, opacity: 0.15 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06EFC5, transparent: true, opacity: 0.12 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.02, 8, 100), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.02, 8, 100), ringMat2);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring1, ring2);

    // Orbiting particles
    const isMobile = 'ontouchstart' in window;
    const pCount = isMobile ? 1000 : 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const offsets = new Float32Array(pCount);
    const radii = new Float32Array(pCount * 2);
    for (let i = 0; i < pCount; i++) {
      offsets[i] = Math.random() * Math.PI * 2;
      radii[i * 2] = 2 + Math.random() * 4;
      radii[i * 2 + 1] = 1.5 + Math.random() * 3;
      pPos[i * 3] = Math.sin(offsets[i]) * radii[i * 2];
      pPos[i * 3 + 1] = Math.cos(offsets[i]) * radii[i * 2 + 1];
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xA78BFA, size: 0.02, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let t = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;
      bigSphere.rotation.y += 0.002;
      bigSphere.rotation.x += 0.001;
      core.rotation.y += 0.01;
      core.rotation.x += 0.007;
      ring1.rotation.z += 0.002;
      ring2.rotation.z -= 0.003;

      // Orbit particles
      const positions = pGeo.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3] = Math.sin(t + offsets[i]) * radii[i * 2];
        positions[i * 3 + 1] = Math.cos(t * 0.7 + offsets[i]) * radii[i * 2 + 1];
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) animate();
      else cancelAnimationFrame(animId);
    }, { threshold: 0.1 });
    const section = canvas.closest('.final-cta');
    if (section) observer.observe(section);

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
      sphereGeo.dispose(); sphereMat.dispose();
      coreGeo.dispose(); coreMat.dispose();
      ringMat1.dispose(); ringMat2.dispose();
      pGeo.dispose(); pMat.dispose();
    };
  }, []);

  return (
    <section className="final-cta" id="cta">
      <canvas ref={canvasRef} className="cta-canvas" />
      <div className="cta-content">
        <div className="cta-label">[ LET'S BUILD SOMETHING AMAZING ]</div>
        <h2 className="cta-headline">
          Ready to launch your next <span className="gradient-text">big idea?</span>
        </h2>
        <p className="cta-sub">
          Book a free 30-minute call with our experts. No pitch decks. No fluff. Just honest advice.
        </p>
        <div className="cta-buttons">
          <a href="#" className="cta-btn-primary magnetic">Schedule Free Call →</a>
          <a
            href="https://wa.me/+91XXXXXXXXXX?text=Hi!%20I%20want%20to%20discuss%20a%20project%20with%20oddwebs."
            className="cta-btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Or Chat on WhatsApp 💬
          </a>
        </div>
        <div className="urgency-badge">⚡ Only 3 client slots left this month</div>
        <div className="response-time">Typically replies within 2 hours</div>
      </div>
      <div className="cta-contact-strip">
        <a href="mailto:hello@oddwebs.com">📧 hello@oddwebs.com</a>
        <span>|</span>
        <a href="https://wa.me/+91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">📱 WhatsApp Us</a>
        <span>|</span>
        <a href="https://www.oddwebs.com" target="_blank" rel="noopener noreferrer">🌐 www.oddwebs.com</a>
        <span>|</span>
        <a href="https://instagram.com/oddwebs" target="_blank" rel="noopener noreferrer">📸 @oddwebs</a>
      </div>
    </section>
  );
}
