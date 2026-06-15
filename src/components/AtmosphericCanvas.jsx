import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ─── Nebula Particle Field ─── */
function NebulaParticles({ count = 2000, scrollRef }) {
  const points = useRef();
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    const palette = [
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#14b8a6'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#6366f1'),
    ];

    for (let i = 0; i < count; i++) {
      // Distribute in a wide cylinder
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 25;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = Math.sin(angle) * radius - 15;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = 0.015 + Math.random() * 0.04;
    }

    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;

    // Slow organic rotation
    points.current.rotation.y = t * 0.008;
    points.current.rotation.x = Math.sin(t * 0.003) * 0.05;

    // Scroll-driven depth shift
    const scroll = scrollRef?.current || 0;
    points.current.position.y = scroll * 8;
    points.current.position.z = scroll * -5;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Volumetric Fog Planes ─── */
function VolumetricFog({ scrollRef }) {
  const groupRef = useRef();

  const fogMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uColor1: { value: new THREE.Color('#8b5cf6') },
        uColor2: { value: new THREE.Color('#3b82f6') },
        uOpacity: { value: 0.06 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uOpacity;
        varying vec2 vUv;

        // Simplex-like noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv;
          float t = uTime * 0.05;

          float n = fbm(uv * 3.0 + vec2(t, t * 0.7));
          n += fbm(uv * 6.0 - vec2(t * 0.5, t * 0.3)) * 0.5;

          // Color blend based on scroll
          vec3 color = mix(uColor1, uColor2, uScroll + n * 0.3);

          // Edge fade
          float edgeFade = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x)
                         * smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);

          float alpha = n * edgeFade * uOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (!fogMaterial) return;
    fogMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    const scroll = scrollRef?.current || 0;
    fogMaterial.uniforms.uScroll.value = scroll;
    fogMaterial.uniforms.uOpacity.value = 0.04 + scroll * 0.03;

    // Color shift through scroll
    const hue1 = 0.72 + scroll * 0.15; // purple → blue
    const hue2 = 0.58 + scroll * 0.2; // blue → teal
    fogMaterial.uniforms.uColor1.value.setHSL(hue1 % 1, 0.7, 0.45);
    fogMaterial.uniforms.uColor2.value.setHSL(hue2 % 1, 0.6, 0.4);

    if (groupRef.current) {
      groupRef.current.position.y = scroll * 3;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, -10, -20, -30].map((z, i) => (
        <mesh key={i} position={[0, i * 4 - 5, z]} rotation={[0, 0, i * 0.3]}>
          <planeGeometry args={[40, 40]} />
          <primitive object={fogMaterial.clone()} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Floating Geometric Debris ─── */
function FloatingDebris({ scrollRef }) {
  const groupRef = useRef();

  const shapes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        -5 - Math.random() * 20,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: 0.2 + Math.random() * 0.5,
      speed: 0.1 + Math.random() * 0.3,
      type: ['icosahedron', 'octahedron', 'torus'][i % 3],
      color: ['#8b5cf6', '#3b82f6', '#14b8a6', '#ec4899'][i % 4],
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} index={i} scrollRef={scrollRef} />
      ))}
    </group>
  );
}

function FloatingShape({ position, rotation, scale, speed, type, color, index, scrollRef }) {
  const mesh = useRef();

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const scroll = scrollRef?.current || 0;

    mesh.current.rotation.x = rotation[0] + t * speed * 0.3;
    mesh.current.rotation.y = rotation[1] + t * speed * 0.2;

    // Floating motion
    mesh.current.position.y = position[1] + Math.sin(t * speed + index) * 1.5;
    mesh.current.position.x = position[0] + Math.cos(t * speed * 0.7 + index) * 0.8;

    // Scroll parallax (different speeds per depth)
    mesh.current.position.y += scroll * (3 + index * 0.5);
  });

  const geometry = useMemo(() => {
    switch (type) {
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />;
      case 'torus': return <torusGeometry args={[1, 0.3, 8, 16]} />;
      default: return <icosahedronGeometry args={[1, 1]} />;
    }
  }, [type]);

  return (
    <Float speed={speed * 2} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh} position={position} scale={scale}>
        {geometry}
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </Float>
  );
}

/* ─── Light Streaks ─── */
function LightStreaks({ scrollRef }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const scroll = scrollRef?.current || 0;

    groupRef.current.children.forEach((child, i) => {
      child.position.x = Math.sin(t * 0.2 + i * 2) * 15;
      child.position.y = scroll * 5 + Math.cos(t * 0.15 + i) * 8;
      child.rotation.z = Math.sin(t * 0.1 + i) * 0.5;
      child.material.opacity = 0.02 + Math.sin(t * 0.3 + i * 1.5) * 0.015;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0, -10 - i * 5]}>
          <planeGeometry args={[0.05, 30]} />
          <meshBasicMaterial
            color={['#8b5cf6', '#3b82f6', '#14b8a6', '#ec4899', '#6366f1'][i]}
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Camera Controller ─── */
function CameraController({ scrollRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const scroll = scrollRef?.current || 0;

    // Camera push/pull based on scroll
    camera.position.z = 6 - scroll * 3;
    camera.position.y = scroll * -2;

    // Subtle rotation
    camera.rotation.x = scroll * 0.05;
  });

  return null;
}

/* ─── Post-Processing ─── */
function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        radius={0.8}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0005, 0.0005)}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={0.04}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
}

/* ─── Main Atmospheric Canvas ─── */
export default function AtmosphericCanvas() {
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        scrollRef.current = window.scrollY / maxScroll;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="atmospheric-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <CameraController scrollRef={scrollRef} />

        {/* Subtle ambient light */}
        <ambientLight intensity={0.08} />
        <pointLight position={[5, 5, 5]} intensity={0.3} color="#8b5cf6" />
        <pointLight position={[-5, -5, 3]} intensity={0.15} color="#3b82f6" />

        {/* Atmospheric layers */}
        <NebulaParticles count={2500} scrollRef={scrollRef} />
        <VolumetricFog scrollRef={scrollRef} />
        <FloatingDebris scrollRef={scrollRef} />
        <LightStreaks scrollRef={scrollRef} />

        {/* Post-processing */}
        <Effects />
      </Canvas>
    </div>
  );
}
