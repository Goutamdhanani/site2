import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingSphere({ position, color, speed, distort, size }) {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh ref={mesh} position={position} scale={size}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          distort={distort}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

function FloatingTorus({ position, color, speed, size }) {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      mesh.current.rotation.z = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.6} floatIntensity={2}>
      <mesh ref={mesh} position={position} scale={size}>
        <torusGeometry args={[1, 0.35, 16, 32]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.15}
          metalness={0.9}
          distort={0.15}
          speed={1.5}
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  );
}

function FloatingOctahedron({ position, color, speed, size }) {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.4;
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <Float speed={speed * 1.8} rotationIntensity={0.5} floatIntensity={1.8}>
      <mesh ref={mesh} position={position} scale={size}>
        <octahedronGeometry args={[1, 0]} />
        <MeshWobbleMaterial
          color={color}
          factor={0.3}
          speed={speed}
          roughness={0.05}
          metalness={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 80 }) {
  const points = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#a78bfa" />
      <directionalLight position={[-5, -5, 3]} intensity={0.2} color="#3b82f6" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#8b5cf6" />

      {/* Main shapes — positioned away from center to not block hero text */}
      <FloatingSphere position={[-4.5, 2.5, -3]} color="#8b5cf6" speed={0.3} distort={0.4} size={0.8} />
      <FloatingSphere position={[5, -1, -4]} color="#3b82f6" speed={0.2} distort={0.3} size={0.6} />
      <FloatingTorus position={[4, 3, -5]} color="#a78bfa" speed={0.25} size={0.5} />
      <FloatingTorus position={[-5, -2.5, -4]} color="#14b8a6" speed={0.15} size={0.4} />
      <FloatingOctahedron position={[-3, -3, -3.5]} color="#ec4899" speed={0.35} size={0.5} />
      <FloatingOctahedron position={[3, 1, -6]} color="#f59e0b" speed={0.2} size={0.35} />

      {/* Subtle particles */}
      <Particles count={100} />
    </>
  );
}

export default function ThreeScene() {
  return (
    <div className="three-scene-container" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
