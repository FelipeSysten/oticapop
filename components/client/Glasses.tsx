"use client";
/* eslint-disable react-hooks/immutability -- materiais do three.js são mutados por frame dentro do useFrame (padrão do R3F) */

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  DEFAULTS,
  FIELDS,
  POINTER_STRENGTH,
  scene,
  VELOCITY_DAMPING,
  VELOCITY_SPIN,
  VELOCITY_SPRING,
  VELOCITY_TILT,
  type Values,
} from "./scene";

const RIM_X = 1.08; // centro de cada aro
const RIM_R = 0.9; // raio do aro
const MODEL_W = 4.6; // largura total aproximada (com hastes) em unidades do modelo

const ORANGE = new THREE.Color("#E8651A");
const FRAME_COLORS = ["#111111", "#ffffff", "#E8651A", "#f3e4d4"].map((c) => new THREE.Color(c));
const LENS_CLEAR = new THREE.Color("#ffffff");
const LENS_DARK = new THREE.Color("#2a1408");

function makeTortoise(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5a2a0e";
  g.fillRect(0, 0, 256, 256);
  g.filter = "blur(7px)";
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = rnd() > 0.45 ? `rgba(200,122,44,${0.5 + rnd() * 0.5})` : `rgba(30,12,4,${0.6 + rnd() * 0.4})`;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, 6 + rnd() * 22, 4 + rnd() * 12, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
}

function makeWhite(): THREE.Texture {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
}

const slotRect = (id: string) => document.getElementById(id)?.getBoundingClientRect();

export default function Glasses({ quality }: { quality: "high" | "low" }) {
  const group = useRef<THREE.Group>(null);
  const cur = useRef<Values>({ ...DEFAULTS });
  const spring = useRef({ x: 0, v: 0 }); // mola da velocidade do scroll
  const ptr = useRef({ x: 0, y: 0 }); // mouse suavizado
  const { size } = useThree();
  const high = quality === "high";

  const geo = useMemo(() => {
    const seg = high ? 72 : 40;
    const rim = new THREE.TorusGeometry(RIM_R, 0.085, high ? 16 : 10, seg);
    const yB = 0.3;
    const xB = RIM_X - Math.sqrt(RIM_R * RIM_R - yB * yB);
    const bridge = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-xB, yB, 0),
        new THREE.Vector3(0, 0.46, 0.02),
        new THREE.Vector3(xB, yB, 0),
      ]),
      24,
      0.07,
      high ? 10 : 6,
    );
    const xo = RIM_X + RIM_R * 0.97;
    const makeTemple = (sx: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(sx * xo, 0.24, -0.08),
          new THREE.Vector3(sx * (xo + 0.06), 0.24, -1.6),
          new THREE.Vector3(sx * (xo + 0.02), 0.16, -3.0),
          new THREE.Vector3(sx * (xo - 0.04), -0.3, -3.45),
        ]),
        high ? 48 : 24,
        0.055,
        high ? 8 : 6,
      );
    const temple = makeTemple(1);
    const templeL = makeTemple(-1);
    const hinge = new THREE.BoxGeometry(0.2, 0.17, 0.22);
    const lens = new THREE.CylinderGeometry(RIM_R - 0.03, RIM_R - 0.03, 0.05, high ? 64 : 32);
    lens.rotateX(Math.PI / 2);
    return { rim, bridge, temple, templeL, hinge, lens };
  }, [high]);

  const mats = useMemo(() => {
    const white = makeWhite();
    const tortoise = makeTortoise();
    const frame = new THREE.MeshPhysicalMaterial({
      color: FRAME_COLORS[0],
      map: white,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
    });
    // Vidro: transparente (mostra o HTML por baixo do canvas) + reflexo do ambiente laranja.
    // Obs.: MeshTransmissionMaterial só refrata a cena 3D, não o HTML; sobre a página as lentes
    // ficavam discos cinza opacos, por isso o vidro é um MeshPhysicalMaterial transparente.
    const lens = new THREE.MeshPhysicalMaterial({
      color: LENS_CLEAR,
      transparent: true,
      opacity: 0.22,
      roughness: 0.03,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: high ? 2.6 : 2,
      iridescence: high ? 0.45 : 0,
      iridescenceIOR: 1.6,
      emissive: ORANGE,
      emissiveIntensity: 0,
      depthWrite: false,
    });
    return { white, tortoise, frame, lens };
  }, [high]);

  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const c = cur.current;
    const t = scene.target;
    const d = Math.min(dt, 0.1);
    for (const f of FIELDS) c[f] = THREE.MathUtils.damp(c[f], t[f], 5.5, d);

    const intro = scene.intro;
    const time = state.clock.elapsedTime;
    const vw = state.viewport.width;
    const vh = state.viewport.height;

    // posição/escala base (frações da tela)
    const baseScale = (scene.mobile ? vw * 0.74 : Math.min(vw * 0.36, vh * 0.62)) / MODEL_W;
    let px = (c.x * vw) / 2;
    let py = (c.y * vh) / 2;
    let sc = baseScale * c.s;

    // encaixe em slots HTML (hero e CTA)
    const fit = (id: string, w: number) => {
      if (w < 0.001) return;
      const r = slotRect(id);
      if (!r || !r.width) return;
      const sx = ((r.left + r.width / 2) / size.width - 0.5) * vw;
      const sy = -((r.top + r.height / 2) / size.height - 0.5) * vh;
      const ss = ((r.width / size.width) * vw) / MODEL_W;
      px += (sx - px) * w;
      py += (sy - py) * w;
      sc += (ss * c.s - sc) * w;
    };
    fit("glasses-slot-hero", Math.min(1, c.hero));
    fit("glasses-slot-cta", Math.min(1, c.cta));

    // atravessar a lente esquerda
    px += RIM_X * sc * c.lens;

    // intro: entra girando de baixo
    const k = 1 - intro;
    py -= k * vh * 0.55;
    sc *= 0.7 + 0.3 * intro;

    // mola: segue a velocidade do scroll e, quando para, volta à pose do keyframe com um leve balanço
    const sp = spring.current;
    const vTarget = THREE.MathUtils.clamp(scene.velocity, -2.5, 2.5);
    sp.v += (vTarget - sp.x) * VELOCITY_SPRING * d;
    sp.v *= Math.exp(-VELOCITY_DAMPING * d);
    sp.x += sp.v * d;
    const tilt = sp.x * VELOCITY_TILT;

    // mouse (parallax leve)
    const pt = ptr.current;
    pt.x = THREE.MathUtils.damp(pt.x, scene.pointer.x, 4, d);
    pt.y = THREE.MathUtils.damp(pt.y, scene.pointer.y, 4, d);
    px += pt.x * 0.06 * sc;
    py -= pt.y * 0.04 * sc;

    g.position.set(px, py + Math.sin(time * 1.1) * 0.035 * sc - tilt * 0.15 * sc, c.z);
    g.scale.setScalar(sc);
    g.rotation.set(
      c.rx + Math.sin(time * 0.7) * 0.04 + tilt * 0.5 + pt.y * POINTER_STRENGTH * 0.6,
      c.ry + Math.sin(time * 0.5) * 0.09 + k * Math.PI * 2.2 + sp.x * VELOCITY_SPIN * 0.5 + pt.x * POINTER_STRENGTH,
      -tilt + Math.sin(time * 0.6) * 0.03,
    );

    const op = c.op * Math.min(1, intro * 2.5);
    g.visible = op > 0.01;
    if (!g.visible) return;

    // armação: cor + textura tartaruga + cristal
    const fi = THREE.MathUtils.clamp(c.frame, 0, 3);
    const i0 = Math.min(2, Math.floor(fi));
    tmpColor.copy(FRAME_COLORS[i0]).lerp(FRAME_COLORS[i0 + 1], fi - i0);
    mats.frame.color.copy(tmpColor);
    mats.frame.map = Math.round(fi) === 1 ? mats.tortoise : mats.white;
    mats.frame.opacity = op * (1 - 0.5 * THREE.MathUtils.clamp(fi - 2, 0, 1));
    mats.frame.roughness = fi > 2.5 ? 0.12 : 0.28;

    // lentes: tint (sol) + brilho laranja + piscada
    const pulse = c.blink * Math.pow(Math.max(0, Math.sin(time * 2.4)), 10);
    const glow = c.glow * 0.45 + pulse * 1.6;
    const lens = mats.lens;
    lens.color.copy(LENS_CLEAR).lerp(LENS_DARK, c.tint);
    lens.emissiveIntensity = glow;
    lens.opacity = op * (0.22 + c.tint * 0.68 + pulse * 0.3 + c.glow * 0.08);
  });

  const renderLens = (x: number, idx: number) => (
    <mesh
      key={idx}
      geometry={geo.lens}
      position={[x, 0, 0]}
      material={mats.lens}
      renderOrder={2}
    />
  );

  return (
    <group ref={group}>
      <mesh geometry={geo.rim} material={mats.frame} position={[-RIM_X, 0, 0]} />
      <mesh geometry={geo.rim} material={mats.frame} position={[RIM_X, 0, 0]} />
      <mesh geometry={geo.bridge} material={mats.frame} />
      <mesh geometry={geo.hinge} material={mats.frame} position={[RIM_X + RIM_R * 0.97, 0.24, -0.06]} />
      <mesh geometry={geo.hinge} material={mats.frame} position={[-(RIM_X + RIM_R * 0.97), 0.24, -0.06]} />
      <mesh geometry={geo.temple} material={mats.frame} />
      <mesh geometry={geo.templeL} material={mats.frame} />
      {renderLens(-RIM_X, 0)}
      {renderLens(RIM_X, 1)}
    </group>
  );
}
