// Roteiro do óculos 3D: keyframes por seção, lidos pelo Director (scroll) e pelo Glasses (useFrame).
// Posição de um keyframe: [id da seção, t], onde t=0 é quando o topo da seção cruza o meio da tela
// e t=1 quando a base da seção cruza o meio da tela.

const PI = Math.PI;

// ---------------------------------------------------------------------------------------------
// AJUSTE FINO: intensidade de cada efeito (0 desliga)
// ---------------------------------------------------------------------------------------------
/** Inclinação (rad) do óculos por velocidade de scroll. Mais alto = inclina mais ao rolar rápido. */
export const VELOCITY_TILT = 0.22;
/** Giro extra (rad) no eixo Y por velocidade de scroll. */
export const VELOCITY_SPIN = 0.5;
/** Rigidez da "mola" que devolve o óculos à pose (maior = volta mais rápido, menos balanço). */
export const VELOCITY_SPRING = 60;
/** Amortecimento da mola (menor = balança mais antes de assentar). */
export const VELOCITY_DAMPING = 9;
/** Rotação máxima (rad) seguindo o mouse. Só em ponteiro fino (mouse/trackpad). */
export const POINTER_STRENGTH = 0.25;
/** Aproximação da câmera (unidades) no meio da página. */
export const CAMERA_DOLLY = 0.9;
/** Balanço lateral da câmera (unidades). */
export const CAMERA_SWAY = 0.25;
/** Quantidade de brilhos 3D. Em aparelho fraco (lowTier) não renderiza. */
export const SPARKLE_COUNT = { desktop: 60, mobile: 20 };
/** Velocidade base da faixa "R$ 89,90" (px por frame) e ganho extra por px/s de scroll. */
export const MARQUEE_SPEED = 0.6;
export const MARQUEE_BOOST = 0.004;
/** Trecho do scroll da cena 2 (0..1 dentro da parte fixa) em que o vídeo vai do 1º ao último quadro. */
export const VIDEO_RANGE: [number, number] = [0.04, 0.78];
/** Suavização do vídeo (0..1 por frame; menor = mais "manteiga", maior = mais colado ao dedo). */
export const VIDEO_SMOOTH = 0.18;

export const FIELDS = [
  "x", // posição horizontal em frações da meia-largura da tela (-1..1)
  "y", // posição vertical em frações da meia-altura da tela (-1..1, positivo = para cima)
  "z", // profundidade (câmera em z=10)
  "s", // escala relativa
  "rx",
  "ry",
  "frame", // cor da armação: 0 preto, 1 tartaruga, 2 laranja, 3 cristal
  "tint", // escurecimento das lentes (sol)
  "glow", // brilho laranja nas lentes
  "blink", // "piscada" periódica (CTA final)
  "op", // opacidade geral
  "lens", // desloca o óculos para a câmera atravessar a lente esquerda
  "hero", // peso do encaixe no slot do hero
  "cta", // peso do encaixe no slot do CTA final
] as const;

export type Field = (typeof FIELDS)[number];
export type Values = Record<Field, number>;
type Stop = { at: [string, number]; v: Partial<Values>; m?: Partial<Values> };

export const FRAME_NAMES = ["Preto clássico", "Tartaruga", "Laranja pop", "Cristal"];

const STOPS: Stop[] = [
  // 1. Hero: encaixado no slot ao lado do título, levemente virado, lentes com reflexo laranja
  { at: ["inicio", 0.5], v: { x: 0, y: 0, z: 0, s: 1, rx: 0.1, ry: -0.3, frame: 0, tint: 0, glow: 0.6, blink: 0, op: 1, lens: 0, hero: 1, cta: 0 } },
  // 2. Enxergue melhor: o óculos 3D se alinha ao óculos do vídeo e se dissolve nele ("o 3D vira real")
  { at: ["exame", 0], v: { x: 0, y: 0.02, z: 0, s: 1.5, rx: 0, ry: 0, glow: 0.1, lens: 0, hero: 0, op: 1 }, m: { y: 0.1, s: 1.03 } },
  { at: ["exame", 0.2], v: { op: 1, s: 1.5 }, m: { s: 1.03 } },
  { at: ["exame", 0.3], v: { op: 0, s: 1.8, z: 1.5 }, m: { s: 1.25 } },
  { at: ["exame", 0.55], v: { x: 0, y: 0.02, rx: 0, ry: 0, glow: 0.1 }, m: { y: 0.1 } },
  // 3. Preço: reaparece girando, gira 180° e troca a cor da armação em 4 passos
  { at: ["preco", 0], v: { op: 0, z: -4, x: 0.48, y: 0, s: 1, ry: -PI / 2, lens: 0, frame: 0, glow: 0 }, m: { x: 0, y: 0.52, s: 0.72 } },
  { at: ["preco", 0.15], v: { op: 1, z: 0, ry: 0, frame: 0 } },
  { at: ["preco", 0.25], v: { frame: 0 } },
  { at: ["preco", 0.33], v: { frame: 1 } },
  { at: ["preco", 0.45], v: { frame: 1 } },
  { at: ["preco", 0.53], v: { frame: 2 } },
  { at: ["preco", 0.65], v: { frame: 2 } },
  { at: ["preco", 0.73], v: { frame: 3 } },
  { at: ["preco", 0.85], v: { ry: PI, x: 0.48, y: 0, s: 1, op: 1 }, m: { x: 0, y: 0.52, s: 0.72 } },
  { at: ["preco", 0.92], v: { frame: 3 } },
  // 4. Coleções: encolhe para a lateral e sai por cima enquanto os cards entram
  { at: ["colecoes", 0], v: { x: 0.56, y: 0.42, s: 0.5, ry: 2 * PI, frame: 0, op: 1, tint: 0 }, m: { x: 0.55, y: 0.72, s: 0.38, op: 0 } },
  { at: ["colecoes", 0.35], v: { op: 1 }, m: { op: 0 } },
  { at: ["colecoes", 0.5], v: { y: 1.5, op: 0 }, m: { y: 1.5 } },
  // 5. Sol: as lentes escurecem na frente do "sol" laranja
  { at: ["sol", 0], v: { op: 0, x: 0.45, y: -1.3, s: 0.9, tint: 0 }, m: { x: 0, y: -1.3, s: 0.8 } },
  { at: ["sol", 0.18], v: { op: 1, y: 0, s: 1.05, ry: 2 * PI }, m: { y: 0.42, s: 0.85 } },
  { at: ["sol", 0.32], v: { tint: 1 } },
  { at: ["sol", 0.82], v: { tint: 1, x: 0.45, y: 0, s: 1.05, op: 1 }, m: { x: 0, y: 0.42, s: 0.85 } },
  // 6. A loja: descansa pequeno no canto
  { at: ["loja", 0], v: { tint: 0, x: 0.84, y: 0.7, s: 0.26, ry: 2 * PI + 0.45, op: 1 }, m: { x: 0.62, y: 0.78, s: 0.3, op: 0 } },
  { at: ["loja", 0.9], v: { x: 0.84, y: 0.7, s: 0.26, op: 1 }, m: { op: 0 } },
  // 7. Clientes: fora de quadro
  { at: ["clientes", 0.1], v: { y: 1.4, op: 0, glow: 0, cta: 0 }, m: { op: 0 } },
  // 8. CTA final: volta ao centro (slot acima do título) e pisca
  { at: ["contato", -0.2], v: { op: 0, cta: 1, s: 0.6, blink: 0, ry: 2 * PI + 0.45 } },
  { at: ["contato", 0.15], v: { op: 1, s: 1, blink: 1, cta: 1, ry: 4 * PI } },
];

export const DEFAULTS: Values = {
  x: 0, y: 0, z: 0, s: 1, rx: 0.1, ry: -0.3, frame: 0, tint: 0, glow: 0.6, blink: 0, op: 1, lens: 0, hero: 1, cta: 0,
};

/** Estado compartilhado (sem React, para não re-renderizar por frame). */
export const scene = {
  target: { ...DEFAULTS } as Values,
  intro: 0,
  mobile: false,
  lowTier: false,
  /** Velocidade do scroll em px/ms (positivo = descendo). */
  velocity: 0,
  /** Mouse normalizado (-1..1). Fica em 0 em telas de toque. */
  pointer: { x: 0, y: 0 },
  /** Progresso total da página (0..1). */
  progress: 0,
};

type Track = { pos: number[]; val: number[] };
let tracks: Record<Field, Track> | null = null;

/** Recalcula a posição de scroll de cada keyframe (chamado no refresh do ScrollTrigger). */
export function buildTracks(mobile: boolean) {
  const vh = window.innerHeight;
  const next = Object.fromEntries(FIELDS.map((f) => [f, { pos: [], val: [] } as Track])) as Record<Field, Track>;
  for (const stop of STOPS) {
    const el = document.getElementById(stop.at[0]);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const pos = top + stop.at[1] * el.offsetHeight - vh * 0.5;
    const values = mobile ? { ...stop.v, ...stop.m } : stop.v;
    for (const [f, v] of Object.entries(values) as [Field, number][]) {
      next[f].pos.push(pos);
      next[f].val.push(v);
    }
  }
  tracks = next;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Valores-alvo para uma posição de scroll. */
export function sample(scrollY: number, out: Values) {
  if (!tracks) return out;
  for (const f of FIELDS) {
    const { pos, val } = tracks[f];
    const n = pos.length;
    if (!n) continue;
    if (scrollY <= pos[0]) out[f] = val[0];
    else if (scrollY >= pos[n - 1]) out[f] = val[n - 1];
    else {
      let i = 1;
      while (pos[i] < scrollY) i++;
      const span = pos[i] - pos[i - 1] || 1;
      const k = smooth((scrollY - pos[i - 1]) / span);
      out[f] = val[i - 1] + (val[i] - val[i - 1]) * k;
    }
  }
  return out;
}
