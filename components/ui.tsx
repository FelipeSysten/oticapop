import images from "@/lib/images.json";
import { site, waLabel } from "@/lib/site";
import type { ComponentProps, ReactNode } from "react";

type ImageName = keyof typeof images;

/** Placeholder visível para dado que falta no brief. */
export function Fill({ children }: { children: ReactNode }) {
  return <span className="fill-me">[PREENCHER: {children}]</span>;
}

/** Mostra o valor se existir, senão o placeholder. */
export function Value({ value, label }: { value: string | null | undefined; label: string }) {
  return value ? <>{value}</> : <Fill>{label}</Fill>;
}

/** <picture> com AVIF + WebP gerados por scripts/optimize-images.mjs */
export function Picture({
  name,
  alt,
  sizes = "100vw",
  className,
  imgClassName,
  priority = false,
}: {
  name: ImageName;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const img = images[name];
  const set = (ext: string) => img.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/img/${name}-${img.width}.webp`}
        alt={alt}
        width={img.width}
        height={img.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={imgClassName}
      />
    </picture>
  );
}

/** Link de WhatsApp com rastreio `click_whatsapp` (delegado em components/client/Tracking). */
export function WaLink({
  location,
  children,
  className = "btn-primary",
  ...rest
}: { location: string; children: ReactNode; className?: string } & Omit<ComponentProps<"a">, "href">) {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener"
      data-track="click_whatsapp"
      data-location={location}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.41 9.41 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.04.72C5.79.72.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.66L.6 23.6l6.04-1.58a11.3 11.3 0 0 0 5.4 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Óculos redondo em SVG (inspirado no ícone do logo): poster do 3D e versão sem animação. */
export function GlassesSvg({ className, lens = "#ffffff" }: { className?: string; lens?: string }) {
  return (
    <svg viewBox="0 0 240 110" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="lensGlow" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="60%" stopColor={lens} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E8651A" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <path d="M8 48 Q4 40 2 30" stroke="#111" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M232 48 Q236 40 238 30" stroke="#111" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="62" cy="58" r="46" fill="url(#lensGlow)" stroke="#111" strokeWidth="9" />
      <circle cx="178" cy="58" r="46" fill="url(#lensGlow)" stroke="#111" strokeWidth="9" />
      <path d="M106 50 Q120 36 134 50" stroke="#111" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M40 36 Q50 26 64 26" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M156 36 Q166 26 180 26" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export { waLabel };
