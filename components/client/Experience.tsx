"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useRef, useState } from "react";
import Glasses from "./Glasses";
import { scene } from "./scene";

/** Marca o 3D como pronto depois dos primeiros frames (o poster SVG some via CSS). */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) {
      document.documentElement.classList.add("three-ready");
      gsap.to(scene, { intro: 1, duration: 1.6, ease: "power3.out" });
    }
  });
  return null;
}

export default function Experience() {
  const low = scene.mobile || scene.lowTier;
  const [dpr, setDpr] = useState<number>(low ? 1 : 1.5);

  return (
    <Canvas
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 20, pointerEvents: "none" }}
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      {!low && (
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))} />
      )}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} />
      <Environment resolution={low ? 64 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={4} color="#E8651A" position={[-5, 1, 2]} rotation-y={Math.PI / 2.5} scale={[6, 4, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffb27a" position={[4, 2, 4]} scale={2.5} />
        <Lightformer form="rect" intensity={1} color="#6B3A1F" position={[0, -4, 2]} scale={[10, 2, 1]} />
      </Environment>
      <Glasses quality={low ? "low" : "high"} />
      <ReadySignal />
    </Canvas>
  );
}
