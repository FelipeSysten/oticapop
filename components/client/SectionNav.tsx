"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  ["inicio", "Início"],
  ["exame", "Exame de vista"],
  ["preco", "Preço"],
  ["colecoes", "Coleções"],
  ["sol", "Óculos de sol"],
  ["loja", "A loja"],
  ["clientes", "Clientes"],
  ["contato", "Agendar"],
] as const;

/**
 * Navegação por pontos (desktop) que mostra em que cena a pessoa está e leva direto a qualquer uma.
 * Também marca o link ativo no menu do topo. Funciona com e sem animação (IntersectionObserver).
 */
export default function SectionNav() {
  const [active, setActive] = useState<string>("inicio");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-nav]").forEach((a) => {
      a.dataset.active = String(a.dataset.nav === active);
      if (a.dataset.nav === active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }, [active]);

  return (
    <nav aria-label="Cenas da página" className="fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-end gap-3">
        {SECTIONS.map(([id, label]) => {
          const on = id === active;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-label={label}
                aria-current={on ? "true" : undefined}
                className="group flex items-center gap-3"
              >
                <span
                  className={`rounded-full bg-cafe-deep px-2.5 py-1 text-xs font-bold whitespace-nowrap text-cream shadow transition-all duration-200 ${
                    on ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`block rounded-full ring-2 transition-all duration-300 ${
                    on ? "size-3.5 bg-pop ring-cream" : "size-2.5 bg-cream/90 ring-cafe/40 group-hover:bg-pop/70"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
