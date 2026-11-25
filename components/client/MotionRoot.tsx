"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { buildTracks, sample, scene } from "./scene";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

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

/**
 * Orquestra o scroll cinema: Lenis (desktop), ScrollTrigger, keyframes do 3D e efeitos HTML.
 * Com prefers-reduced-motion não faz nada: a página fica estática com o poster do óculos.
 */
export default function MotionRoot() {
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("reduced-motion");
      return;
    }
    root.classList.add("motion");

    const mq = matchMedia("(max-width: 767px)");
    scene.mobile = mq.matches;
    scene.lowTier = (navigator.hardwareConcurrency ?? 8) <= 4;

    const cleanups: (() => void)[] = [];
    let ctx: gsap.Context | null = null;
    let lenis: Lenis | null = null;
    const raf = (time: number) => lenis?.raf(time * 1000);

    // Etapa 1 (ocioso): scroll suave + timeline do 3D
    cleanups.push(
      whenIdle(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Lenis só no desktop: no celular o scroll nativo é mais fluido e economiza bateria
        if (!scene.mobile) {
          lenis = new Lenis({ lerp: 0.12, anchors: true });
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);
        }

        const frameList = document.querySelector<HTMLElement>("[data-frame-list]");
        let activeFrame = -1;
        const update = () => {
          sample(window.scrollY, scene.target);
          const f = Math.round(scene.target.frame);
          if (frameList && f !== activeFrame) {
            activeFrame = f;
            frameList.querySelectorAll<HTMLElement>("[data-frame]").forEach((el) => {
              el.dataset.active = String(Number(el.dataset.frame) === f);
            });
          }
        };

        ctx = gsap.context(() => {
          ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate: update,
            onRefresh: () => {
              buildTracks(scene.mobile);
              update();
            },
          });

          // Cena 2: o fundo desfocado fica nítido depois que a câmera atravessa a lente
          const exame = document.getElementById("exame");
          if (exame) {
            const at = (t: number) => () => `top+=${exame.offsetHeight * t} center`;
            gsap.fromTo(
              "[data-focus-img]",
              { filter: "blur(16px)", scale: 1.12 },
              { filter: "blur(0px)", scale: 1, ease: "none", scrollTrigger: { trigger: exame, start: at(0.3), end: at(0.58), scrub: true } },
            );
            gsap.fromTo(
              "[data-focus-card]",
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: exame, start: at(0.5), end: at(0.62), scrub: true } },
            );
            gsap.fromTo(
              "[data-focus-intro]",
              { autoAlpha: 1 },
              { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: exame, start: at(0.22), end: at(0.36), scrub: true } },
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
        });

        // Etapa 2 (ocioso de novo): entradas de texto e cards
        cleanups.push(
          whenIdle(() => {
            ctx?.add(() => {
              gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
                if (el.getBoundingClientRect().top < innerHeight) return; // já visível: não esconde
                gsap.from(el, {
                  y: 28,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  delay: Number(el.dataset.delay || 0),
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
              });
            });
          }),
        );
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      }),
    );

    const onMq = () => {
      scene.mobile = mq.matches;
      ScrollTrigger.refresh();
    };
    mq.addEventListener("change", onMq);

    // Etapa 3: o canvas 3D. O LCP é o título em HTML e o hero mostra o poster SVG enquanto isso.
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
      mq.removeEventListener("change", onMq);
      cleanups.forEach((fn) => fn());
      ctx?.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return show3D ? <Experience /> : null;
}
