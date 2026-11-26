"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { buildTracks, MARQUEE_BOOST, MARQUEE_SPEED, sample, scene } from "./scene";
import { setupSequence } from "./sequence";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

/** Ponto do scroll (t dentro da seção de preço) em que cada cor da armação aparece. Ver STOPS em scene.ts. */
const FRAME_SCROLL_T = [0.2, 0.39, 0.59, 0.79];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Agenda trabalho para quando o navegador estiver ocioso (fora da hidratação). */
function whenIdle(fn: () => void, timeout = 1500) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

/** Quebra um título em palavras com máscara (texto acessível fica no aria-label). */
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return [];
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  el.dataset.splitDone = "1";
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const inners: HTMLElement[] = [];
  text.split(" ").forEach((word, i, all) => {
    const mask = document.createElement("span");
    mask.className = "word-mask";
    mask.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.textContent = word;
    mask.append(inner);
    el.append(mask);
    if (i < all.length - 1) el.append(" ");
    inners.push(inner);
  });
  return inners;
}

/** Leva o scroll até a cor `i` da armação na seção de preço. */
function scrollToFrame(i: number, lenis: Lenis | null) {
  const sec = document.getElementById("preco");
  if (!sec) return;
  const top = sec.getBoundingClientRect().top + window.scrollY;
  const y = top + FRAME_SCROLL_T[i] * sec.offsetHeight - window.innerHeight / 2;
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/**
 * Orquestra o scroll cinema: Lenis (desktop), ScrollTrigger, keyframes do 3D, vídeo no scroll e os
 * efeitos de HTML. Com prefers-reduced-motion nada disso roda: a página fica estática e legível.
 */
export default function MotionRoot() {
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];
    let lenis: Lenis | null = null;

    // Botões de cor da armação (funcionam também sem animação: só marcam a cor escolhida)
    const frameButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-frame-list] [data-frame]"));
    const markFrame = (f: number) =>
      frameButtons.forEach((b) => {
        const on = Number(b.dataset.frame) === f;
        b.dataset.active = String(on);
        b.setAttribute("aria-pressed", String(on));
      });
    const onFrameClick = (e: Event) => {
      const i = Number((e.currentTarget as HTMLElement).dataset.frame);
      if (reduced) markFrame(i);
      else scrollToFrame(i, lenis);
    };
    frameButtons.forEach((b) => b.addEventListener("click", onFrameClick));
    cleanups.push(() => frameButtons.forEach((b) => b.removeEventListener("click", onFrameClick)));

    if (reduced) {
      root.classList.add("reduced-motion");
      return () => cleanups.forEach((fn) => fn());
    }
    root.classList.add("motion");

    const mq = matchMedia("(max-width: 767px)");
    scene.mobile = mq.matches;
    scene.lowTier = (navigator.hardwareConcurrency ?? 8) <= 4;
    const finePointer = matchMedia("(pointer: fine)").matches;

    let ctx: gsap.Context | null = null;
    const ticks: gsap.TickerCallback[] = [];
    const addTick = (fn: gsap.TickerCallback) => {
      gsap.ticker.add(fn);
      ticks.push(fn);
    };

    // ---------------------------------------------------------------- Etapa 1 (ocioso): scroll + 3D + vídeo
    cleanups.push(
      whenIdle(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Lenis só no desktop: no celular o scroll nativo é mais fluido e economiza bateria
        if (!scene.mobile) {
          lenis = new Lenis({ lerp: 0.12, anchors: true });
          lenis.on("scroll", ScrollTrigger.update);
          addTick((time) => lenis?.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
        }

        let activeFrame = -1;
        const update = () => {
          sample(window.scrollY, scene.target);
          const f = Math.round(scene.target.frame);
          if (f !== activeFrame) {
            activeFrame = f;
            markFrame(f);
          }
        };

        // Velocidade, progresso e barra de progresso (um único tick, sem React)
        const bar = document.querySelector<HTMLElement>("[data-progress]");
        const hint = document.querySelector<HTMLElement>("[data-scroll-hint]");
        let lastY = window.scrollY;
        let lastT = performance.now();
        let lastP = -1;
        let hintOn = true;
        let maxScroll = 1; // medido no refresh (ler a altura da página a cada frame força layout)
        const measureMax = () => (maxScroll = ScrollTrigger.maxScroll(window) || 1);
        ScrollTrigger.addEventListener("refresh", measureMax);
        cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measureMax));
        addTick(() => {
          const now = performance.now();
          const y = window.scrollY;
          const inst = (y - lastY) / Math.max(1, now - lastT);
          scene.velocity += (inst - scene.velocity) * 0.25;
          if (Math.abs(scene.velocity) < 0.002) scene.velocity = 0;
          lastY = y;
          lastT = now;
          const p = Math.min(1, Math.max(0, y / maxScroll));
          scene.progress = p;
          if (bar && Math.abs(p - lastP) > 0.0005) {
            bar.style.transform = `scaleX(${p.toFixed(4)})`;
            lastP = p;
          }
          if (hint && hintOn !== y <= 40) {
            hintOn = y <= 40;
            hint.style.opacity = hintOn ? "1" : "0";
          }
        });

        ctx = gsap.context(() => {
          // O mestre recalcula os keyframes por último (depois dos pins mudarem a altura da página)
          ScrollTrigger.create({
            start: 0,
            end: "max",
            refreshPriority: -1,
            onUpdate: update,
            onRefresh: () => {
              buildTracks(scene.mobile);
              update();
            },
          });

          // Cena 2: texto de abertura sai, card entra no fim do vídeo
          const exame = document.getElementById("exame");
          if (exame) {
            const stick = { trigger: exame, start: "top top", end: "bottom bottom" };
            const at = (p: number) => () => `top+=${(exame.offsetHeight - innerHeight) * p} top`;
            // o título entra depois que o óculos 3D se dissolve no vídeo e sai quando a lente chega ao olho
            gsap
              .timeline({ scrollTrigger: { ...stick, start: at(0.1), end: at(0.74), scrub: true } })
              .fromTo("[data-focus-intro]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.16, ease: "none" })
              .to("[data-focus-intro]", { autoAlpha: 1, duration: 0.64 - 0.16 })
              .to("[data-focus-intro]", { autoAlpha: 0, y: -30, duration: 0.2, ease: "none" });
            gsap.fromTo(
              "[data-focus-card]",
              { autoAlpha: 0, y: 50 },
              { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { ...stick, start: at(0.76), end: at(0.9), scrub: true } },
            );
          }

          // Cena 5: o "sol" cresce atrás do óculos
          const sol = document.getElementById("sol");
          if (sol) {
            gsap.fromTo(
              "[data-sun]",
              { scale: 0.45, opacity: 0.3 },
              { scale: 1.1, opacity: 1, ease: "none", scrollTrigger: { trigger: sol, start: "top bottom", end: "top top", scrub: true } },
            );
          }

          // Loja: galeria presa que anda na horizontal (só desktop; no celular é carrossel de arrastar)
          const wrap = document.querySelector<HTMLElement>("[data-hscroll]");
          const track = wrap?.querySelector<HTMLElement>("[data-htrack]");
          if (wrap && track && !scene.mobile) {
            root.classList.add("hscroll-pinned");
            track.removeAttribute("tabindex");
            const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: wrap,
                  start: "center center",
                  end: () => `+=${dist()}`,
                  pin: true,
                  scrub: 1,
                  invalidateOnRefresh: true,
                  anticipatePin: 1,
                },
              })
              .to(track, { x: () => -dist(), ease: "none" }, 0)
              .fromTo(track.querySelectorAll(".hpanel img"), { xPercent: -4 }, { xPercent: 4, ease: "none" }, 0);
          }
        });

        cleanups.push(setupSequence(scene.mobile));

        // ------------------------------------------------------------ Etapa 2 (ocioso de novo): detalhes de HTML
        cleanups.push(
          whenIdle(() => {
            // Lê todas as posições de uma vez (antes de qualquer escrita no DOM) para não forçar layout em série
            const isBelow = new Map<Element, boolean>();
            document.querySelectorAll("h2[data-split], [data-reveal], [data-fan]").forEach((el) => {
              isBelow.set(el, el.getBoundingClientRect().top > innerHeight);
            });
            const below = (el: Element) => isBelow.get(el) ?? false;

            ctx?.add(() => {

              // Títulos: palavra por palavra subindo de dentro de uma máscara
              gsap.utils.toArray<HTMLElement>("h2[data-split]").forEach((h2) => {
                const hidden = below(h2);
                const words = splitWords(h2);
                if (!hidden || !words.length || h2.closest("[data-focus-card]")) return;
                gsap.from(words, {
                  yPercent: 110,
                  duration: 0.8,
                  ease: "power4.out",
                  stagger: 0.06,
                  scrollTrigger: { trigger: h2, start: "top 85%", once: true },
                });
              });

              // Blocos de texto
              gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
                if (!below(el)) return;
                gsap.from(el, {
                  y: 28,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  delay: Number(el.dataset.delay || 0),
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
              });

              // Coleções: cards entram em leque
              const fan = document.querySelector<HTMLElement>("[data-fan]");
              if (fan && below(fan)) {
                const items = gsap.utils.toArray<HTMLElement>("[data-fan-item]", fan);
                const mid = (items.length - 1) / 2;
                gsap.from(items, {
                  y: 90,
                  rotation: (i: number) => (i - mid) * 7,
                  transformOrigin: "50% 120%",
                  autoAlpha: 0,
                  duration: 0.9,
                  ease: "back.out(1.4)",
                  stagger: 0.09,
                  scrollTrigger: { trigger: fan, start: "top 82%", once: true },
                });
              }

              // Parallax em camadas: elementos com data-speed andam mais devagar que a página
              gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
                const dist = (1 - Number(el.dataset.speed || 1)) * 160;
                gsap.fromTo(
                  el,
                  { y: -dist },
                  { y: dist, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
                );
              });
            });

            // Tilt 3D nos cards (só mouse/trackpad)
            if (finePointer) {
              document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
                gsap.set(card, { transformPerspective: 900 });
                const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
                const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
                const move = (e: PointerEvent) => {
                  const r = card.getBoundingClientRect();
                  const px = (e.clientX - r.left) / r.width;
                  const py = (e.clientY - r.top) / r.height;
                  ry((px - 0.5) * 14);
                  rx((0.5 - py) * 12);
                  card.style.setProperty("--mx", `${px * 100}%`);
                  card.style.setProperty("--my", `${py * 100}%`);
                };
                const leave = () => {
                  rx(0);
                  ry(0);
                };
                card.addEventListener("pointermove", move);
                card.addEventListener("pointerleave", leave);
                cleanups.push(() => {
                  card.removeEventListener("pointermove", move);
                  card.removeEventListener("pointerleave", leave);
                });
              });
            }

            // Faixa "R$ 89,90": acelera com a velocidade do scroll e inverte a direção ao rolar para cima
            const mTrack = document.querySelector<HTMLElement>("[data-marquee-track]");
            const mRow = mTrack?.querySelector<HTMLElement>("[data-marquee-row]");
            if (mTrack && mRow) {
              let x = 0;
              let dir = 1;
              let visible = false;
              let w = mRow.offsetWidth || 1;
              const measure = () => (w = mRow.offsetWidth || 1);
              ScrollTrigger.addEventListener("refresh", measure);
              cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measure));
              const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
              io.observe(mTrack);
              cleanups.push(() => io.disconnect());
              addTick((_t, dt) => {
                if (!visible) return;
                const v = scene.velocity * 1000; // px/s
                if (Math.abs(v) > 40) dir = v < 0 ? -1 : 1;
                x -= (MARQUEE_SPEED + Math.abs(v) * MARQUEE_BOOST) * dir * (dt / 16.67);
                x = gsap.utils.wrap(-w, 0, x);
                mTrack.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
              });
            }

            ScrollTrigger.refresh();
          }),
        );
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
        window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
      }),
    );

    // Mouse (parallax do óculos): só em ponteiro fino
    if (finePointer) {
      const onMove = (e: PointerEvent) => {
        scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        scene.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const onLeave = () => {
        scene.pointer.x = 0;
        scene.pointer.y = 0;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });
    }

    const onMq = () => {
      scene.mobile = mq.matches;
      ScrollTrigger.refresh();
    };
    mq.addEventListener("change", onMq);
    cleanups.push(() => mq.removeEventListener("change", onMq));

    // ---------------------------------------------------------------- Etapa 3: o canvas 3D
    // O LCP é o título em HTML e o hero mostra o poster SVG enquanto isso.
    // Desktop: assim que o navegador fica ocioso. Celular/aparelho fraco: na primeira interação
    // (toque, scroll, tecla) ou 4s depois do load, para não travar a abertura da página.
    if (hasWebGL()) {
      const start = () => setShow3D(true);
      if (scene.mobile || scene.lowTier) {
        const events = ["scroll", "touchstart", "pointerdown", "keydown"] as const;
        let timer = 0;
        const go = () => {
          events.forEach((e) => window.removeEventListener(e, go));
          window.clearTimeout(timer);
          start();
        };
        events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
        const arm = () => (timer = window.setTimeout(go, 4000));
        if (document.readyState === "complete") arm();
        else window.addEventListener("load", arm, { once: true });
        cleanups.push(() => {
          events.forEach((e) => window.removeEventListener(e, go));
          window.removeEventListener("load", arm);
          window.clearTimeout(timer);
        });
      } else {
        cleanups.push(whenIdle(start, 2500));
      }
    }

    return () => {
      cleanups.forEach((fn) => fn());
      ctx?.revert();
      ticks.forEach((fn) => gsap.ticker.remove(fn));
      lenis?.destroy();
      root.classList.remove("hscroll-pinned");
    };
  }, []);

  return show3D ? <Experience /> : null;
}
