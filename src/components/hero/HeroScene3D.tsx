"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PointerRef = React.MutableRefObject<{ x: number; y: number }>;

const CARDS = [
  { position: [-0.7, -0.5, -1.5], rotation: [0.05, 0.22, -0.03], color: "#22d3ee", scale: 0.85 },
  { position: [0.1, 0.1, -0.6], rotation: [-0.03, -0.1, 0.02], color: "#818cf8", scale: 0.92 },
  { position: [0.6, -0.25, 0.45], rotation: [0.02, -0.26, 0.04], color: "#6366f1", scale: 1 },
] as const satisfies readonly { position: readonly [number, number, number]; rotation: readonly [number, number, number]; color: string; scale: number }[];

function Card({
  index,
  position,
  rotation,
  color,
  scale,
  pointer,
}: {
  index: number;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  color: string;
  scale: number;
  pointer: PointerRef;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useMemo(() => new THREE.Vector3(...position), [position]);
  const depthWeight = (index + 1) * 0.35;

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const float = Math.sin(t * 0.6 + index * 1.3) * 0.05;

    mesh.position.set(
      base.x + pointer.current.x * 0.22 * depthWeight,
      base.y + float + pointer.current.y * 0.12 * depthWeight,
      base.z
    );
    mesh.rotation.x = rotation[0] - pointer.current.y * 0.08;
    mesh.rotation.y = rotation[1] + pointer.current.x * 0.14;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation as unknown as [number, number, number]} scale={scale}>
      <boxGeometry args={[1.5, 0.92, 0.04]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.16}
        emissive={color}
        emissiveIntensity={0.45}
        roughness={0.25}
        metalness={0.15}
      />
    </mesh>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 160;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a5b4fc" size={0.018} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 2, 4]} intensity={12} color="#818cf8" />
      <pointLight position={[-3, -1, 2]} intensity={8} color="#22d3ee" />
      <Particles />
      <group position={[2.15, -0.1, 0]}>
        {CARDS.map((card, index) => (
          <Card key={index} index={index} pointer={pointer} {...card} />
        ))}
      </group>
    </>
  );
}

export function HeroScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden>
      {isVisible && (
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 4.5], fov: 45 }}
        >
          <Scene />
        </Canvas>
      )}
    </div>
  );
}
