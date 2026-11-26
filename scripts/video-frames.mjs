// Converte o vídeo da cena "Enxergue melhor" em sequências de quadros WebP para o scroll.
// Precisa do ffmpeg instalado (https://ffmpeg.org) ou da variável FFMPEG apontando para o executável.
// Uso: npm run frames   (ou: FFMPEG="C:/caminho/ffmpeg.exe" npm run frames)
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, copyFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const VIDEO = path.join(ROOT, "brief/referencias/e3fdcb07-a5e4-4383-a142-b3671e99cc57.mp4");
const OUT = path.join(ROOT, "public/seq/exame");

const variants = [
  // desktop: todos os quadros, 1280px
  { dir: "d", filter: "scale=1280:-2:flags=lanczos", quality: 62 },
  // celular: metade dos quadros, 900px
  { dir: "m", filter: "select='not(mod(n\\,2))',scale=900:-2:flags=lanczos", quality: 58 },
];

rmSync(OUT, { recursive: true, force: true });
const manifest = {};
for (const v of variants) {
  const dir = path.join(OUT, v.dir);
  mkdirSync(dir, { recursive: true });
  execFileSync(FFMPEG, [
    "-v", "error", "-i", VIDEO,
    "-vf", v.filter, "-fps_mode", "vfr",
    "-c:v", "libwebp", "-quality", String(v.quality), "-compression_level", "6",
    path.join(dir, "f%03d.webp"),
  ]);
  manifest[v.dir] = readdirSync(dir).filter((f) => f.endsWith(".webp")).length;
}

// Pôsteres: primeiro quadro (antes de carregar) e último quadro (reduced motion)
copyFileSync(path.join(OUT, "d", "f001.webp"), path.join(OUT, "poster-inicio.webp"));
copyFileSync(path.join(OUT, "d", `f${String(manifest.d).padStart(3, "0")}.webp`), path.join(OUT, "poster-fim.webp"));

writeFileSync(path.join(ROOT, "lib/sequence.json"), JSON.stringify({ path: "/seq/exame", width: 1284, height: 716, frames: manifest }, null, 2));
console.log("quadros:", manifest);
