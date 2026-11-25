"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const KEY = "oticapop-consent";
type Choice = "granted" | "denied" | null;

export function track(event: string, params: Record<string, string> = {}) {
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
  if (event === "click_whatsapp") window.fbq?.("track", "Contact");
}

/** Banner LGPD: GA4 e Meta Pixel só carregam depois do "Aceitar". Também rastreia os cliques de CTA. */
export default function Consent() {
  const [choice, setChoice] = useState<Choice | "loading">("loading");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Choice;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage após a hidratação
    setChoice(saved === "granted" || saved === "denied" ? saved : null);

    const reopen = () => setChoice(null);
    window.addEventListener("open-consent", reopen);

    // Evento `click_whatsapp` em todo CTA (links com data-track)
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
      if (el) track(el.dataset.track!, { location: el.dataset.location || "desconhecido" });
    };
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("open-consent", reopen);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const decide = (c: "granted" | "denied") => {
    localStorage.setItem(KEY, c);
    if (c === "denied" && choice === "granted") window.location.reload(); // descarrega os pixels
    setChoice(c);
  };

  return (
    <>
      {choice === "granted" && GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      )}
      {choice === "granted" && PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {choice === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de cookies"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl bg-cafe-deep p-4 text-cream shadow-2xl md:bottom-5 md:p-5"
        >
          <p className="text-sm leading-relaxed">
            A gente usa cookies para entender como o site é usado e melhorar nossos anúncios. Só ativamos depois do seu
            OK, e você pode mudar de ideia no rodapé.
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide("granted")} className="btn-primary min-h-11 px-5 py-2 text-base">
              Aceitar
            </button>
            <button type="button" onClick={() => decide("denied")} className="btn-light min-h-11 px-5 py-2 text-base">
              Recusar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ConsentReopen() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-consent"))}
      className="underline underline-offset-4 hover:text-pop"
    >
      Preferências de cookies
    </button>
  );
}
