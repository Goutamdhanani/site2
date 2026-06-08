import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const tabs = [
  { num: '01', title: 'Web Development', desc: 'Lightning-fast sites that convert.' },
  { num: '02', title: 'Mobile Apps', desc: 'Native performance, cross-platform reach.' },
  { num: '03', title: 'AI & Automation', desc: 'Intelligent systems that scale.' },
  { num: '04', title: 'Growth Systems', desc: 'Data-driven growth engines.' },
];

export default function Showcase() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const meshRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.z = 4;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    updateSize();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const mat = new THREE.MeshBasicMaterial({
      color: 0x7B3FE4, wireframe: true, transparent: true, opacity: 0.5
    });

    const geometries = [
      new THREE.IcosahedronGeometry(1.8, 2),
      new THREE.CylinderGeometry(0, 1.5, 3, 8, 1),
      new THREE.TorusKnotGeometry(1.2, 0.4, 128, 16),
      new THREE.OctahedronGeometry(1.8, 0),
    ];

    const mesh = new THREE.Mesh(geometries[0], mat);
    meshRef.current = mesh;
    scene.add(mesh);

    // Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      pPos[i * 3] = Math.cos(angle) * 2.5;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pPos[i * 3 + 2] = Math.sin(angle) * 2.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xA78BFA, size: 0.03, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Torus ring
    const torusGeo = new THREE.TorusGeometry(2.5, 0.01, 8, 80);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x06EFC5, transparent: true, opacity: 0.25 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 4;
    scene.add(torus);

    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.008;
      particles.rotation.y += 0.002;
      torus.rotation.z -= 0.003;
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.03;
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', updateSize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
      geometries.forEach(g => g.dispose());
      mat.dispose();
      pGeo.dispose(); pMat.dispose();
      torusGeo.dispose(); torusMat.dispose();
    };
  }, []);

  // Handle tab change — swap geometry
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometries = [
      new THREE.IcosahedronGeometry(1.8, 2),
      new THREE.CylinderGeometry(0, 1.5, 3, 8, 1),
      new THREE.TorusKnotGeometry(1.2, 0.4, 128, 16),
      new THREE.OctahedronGeometry(1.8, 0),
    ];

    gsap.to(mesh.scale, {
      x: 0, y: 0, z: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        mesh.geometry.dispose();
        mesh.geometry = geometries[activeTab];
        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' });
      }
    });
  }, [activeTab]);

  return (
    <section className="showcase-section" id="showcase">
      <div className="showcase-tabs">
        {tabs.map((tab, i) => (
          <div
            key={i}
            className={`showcase-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
            onMouseEnter={() => setActiveTab(i)}
          >
            <div className="showcase-tab-number">{tab.num}</div>
            <div className="showcase-tab-title">{tab.title}</div>
            <div className="showcase-tab-desc">{tab.desc}</div>
          </div>
        ))}
      </div>
      <div className="showcase-canvas">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </section>
  );
}
