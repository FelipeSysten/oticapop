"use client";

import { useState } from "react";

/** Mapa do Google carregado só no clique (não pesa no carregamento e não seta cookies antes da hora). */
export default function MapEmbed({ query }: { query: string }) {
  const [open, setOpen] = useState(false);
  const q = encodeURIComponent(query);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-sand md:aspect-auto md:h-full md:min-h-80">
      {open ? (
        <iframe
          title="Mapa: Ótica Pop no Centro de Itabuna"
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 45%, rgba(232,101,26,.18), transparent 55%), repeating-linear-gradient(0deg, transparent 0 38px, rgba(107,58,31,.08) 38px 40px), repeating-linear-gradient(90deg, transparent 0 38px, rgba(107,58,31,.08) 38px 40px)",
          }}
        >
          <svg viewBox="0 0 24 24" className="size-12 text-pop transition-transform group-hover:-translate-y-1" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5"
            />
          </svg>
          <span className="font-display text-lg font-extrabold text-cafe">Ver a loja no mapa</span>
          <span className="text-sm text-cafe/80">Carrega o Google Maps</span>
        </button>
      )}
    </div>
  );
}
