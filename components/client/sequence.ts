// Vídeo controlado pelo scroll (técnica "image sequence"): os quadros WebP são desenhados num <canvas>
// conforme o progresso da cena "Enxergue melhor". Mais fluido que mexer no currentTime de um <video>,
// principalmente no iPhone.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import seq from "@/lib/sequence.json";
import { VIDEO_RANGE, VIDEO_SMOOTH } from "./scene";

/** Ordem de carregamento progressiva: 1º quadro, depois a cada 8, a cada 4, a cada 2, e o resto. */
function loadOrder(n: number) {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const step of [n, 8, 4, 2, 1]) {
    for (let i = 0; i < n; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(n - 1)) order.push(n - 1);
  return order;
}

export function setupSequence(mobile: boolean): () => void {
  const section = document.getElementById("exame");
  const canvas = document.querySelector<HTMLCanvasElement>("[data-seq-canvas]");
  const poster = document.querySelector<HTMLElement>("[data-seq-poster]");
  const meter = document.querySelector<HTMLElement>("[data-focus-meter]");
  const meterLabel = document.querySelector<HTMLElement>("[data-focus-value]");
  if (!section || !canvas) return () => {};
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return () => {};

  const variant = mobile ? "m" : "d";
  const count = seq.frames[variant];
  const frames: (HTMLImageElement | null)[] = new Array(count).fill(null);
  let target = 0; // quadro-alvo (float) vindo do scroll
  let current = 0; // quadro exibido (float, suavizado)
  let drawn = -1;
  let disposed = false;

  // --- tamanho do canvas = caixa CSS × DPR (máx. 2)
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    drawn = -1;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  /** Desenha o quadro carregado mais próximo do índice pedido. */
  const draw = (index: number) => {
    let i = index;
    for (let d = 0; d < count; d++) {
      if (frames[index - d]) {
        i = index - d;
        break;
      }
      if (frames[index + d]) {
        i = index + d;
        break;
      }
    }
    const img = frames[i];
    if (!img || i === drawn) return;
    ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawn = i;
    if (poster && !poster.dataset.hidden) {
      poster.dataset.hidden = "1";
      poster.style.opacity = "0";
    }
  };

  // --- carregamento progressivo (só quando a cena está perto de entrar na tela)
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    const queue = loadOrder(count);
    let inFlight = 0;
    const next = () => {
      if (disposed) return;
      while (inFlight < 4 && queue.length) {
        const i = queue.shift()!;
        const img = new Image();
        img.decoding = "async";
        img.src = `${seq.path}/${variant}/f${String(i + 1).padStart(3, "0")}.webp`;
        inFlight++;
        img
          .decode()
          .then(() => {
            frames[i] = img;
            if (i === 0 || Math.abs(i - Math.round(current)) < 3) drawn = -1;
          })
          .catch(() => {})
          .finally(() => {
            inFlight--;
            next();
          });
      }
    };
    next();
  };
  const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && start(), {
    rootMargin: "100% 0px",
  });
  const arm = () => io.observe(section);
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });

  // --- scroll -> quadro
  const [a, b] = VIDEO_RANGE;
  const st = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const p = gsap.utils.clamp(0, 1, (self.progress - a) / (b - a));
      target = p * (count - 1);
    },
  });

  // --- loop de desenho (suavizado, só redesenha quando o quadro muda)
  let lastPct = -1;
  const tick = () => {
    if (current === target && drawn === Math.round(current) && lastPct >= 0) return;
    current += (target - current) * VIDEO_SMOOTH;
    if (Math.abs(target - current) < 0.01) current = target;
    const idx = Math.round(current);
    if (idx !== drawn) draw(idx);
    if (meter) {
      const pct = Math.round((current / (count - 1)) * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        meter.style.transform = `scaleX(${pct / 100})`;
        if (meterLabel) meterLabel.textContent = `${pct}%`;
      }
    }
  };
  gsap.ticker.add(tick);

  return () => {
    disposed = true;
    gsap.ticker.remove(tick);
    st.kill();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("load", arm);
  };
}
