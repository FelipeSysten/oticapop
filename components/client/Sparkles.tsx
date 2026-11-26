"use client";

import { Sparkles as DreiSparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scene, SPARKLE_COUNT } from "./scene";

/** Brilhos laranja/creme ao fundo que sobem conforme o scroll (camada atrás do óculos). */
export default function Sparkles() {
  const group = useRef<THREE.Group>(null);
  const total = scene.mobile ? SPARKLE_COUNT.mobile : SPARKLE_COUNT.desktop;
  const orange = Math.round(total * 0.65);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // sobe com o progresso da página + um empurrão extra pela velocidade
    const target = scene.progress * 9 - 4.5 + THREE.MathUtils.clamp(scene.velocity, -2, 2) * 0.25;
    g.position.y = THREE.MathUtils.damp(g.position.y, target, 3, Math.min(dt, 0.1));
  });

  if (!total) return null;
  return (
    <group ref={group} position={[0, -4.5, -3]}>
      <DreiSparkles count={orange} scale={[16, 18, 4]} size={scene.mobile ? 3 : 3.6} speed={0.3} opacity={0.75} color="#E8651A" noise={0.6} />
      <DreiSparkles count={total - orange} scale={[16, 18, 4]} size={2.6} speed={0.25} opacity={0.6} color="#FFD9B8" noise={0.6} />
    </group>
  );
}
