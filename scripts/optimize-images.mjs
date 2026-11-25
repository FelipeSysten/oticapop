// Converte as fotos do brief/ para AVIF + WebP (máx. 1600px) em public/img/
// e gera lib/images.json com as dimensões. Rode com: npm run images
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "img");
const WIDTHS = [480, 960, 1600];

/** nome no site -> arquivo no brief */
const SOURCES = {
  "loja-fachada": "brief/fotos-loja/unnamed (1).webp",
  "loja-interior-1": "brief/fotos-loja/unnamed (2).webp",
  "loja-interior-2": "brief/fotos-loja/unnamed (3).webp",
  "produto-perfil": "brief/fotos-produtos/unnamed (4).webp",
  "produto-retangular": "brief/fotos-produtos/unnamed (5).webp",
  "produto-gatinho": "brief/fotos-produtos/unnamed (6).webp",
  "equipe-01": "brief/equipe/e9a3a334-9f2f-4052-bbf8-0c79bebf82ee.jpg",
  // Imagem ilustrativa (gerada por IA) usada só como fundo da cena "foco"
  "foco-fundo": "brief/referencias/Gemini_Generated_Image_5rdzt05rdzt05rdz.jpg",
};

await mkdir(OUT, { recursive: true });
const manifest = {};

for (const [name, rel] of Object.entries(SOURCES)) {
  const input = path.join(ROOT, rel);
  const meta = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, 1600));
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  for (const w of unique) {
    const base = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  const maxW = unique.at(-1);
  manifest[name] = {
    widths: unique,
    width: maxW,
    height: Math.round((meta.height / meta.width) * maxW),
  };
  console.log(name, unique.join("/"));
}

// Logo (PNG pequeno do brief, mantido no tamanho original)
await sharp(path.join(ROOT, "brief/logo/logo-otica-pop.png")).toFile(path.join(OUT, "logo-otica-pop.png"));

// Imagem Open Graph 1200x630: fundo creme + logo ampliado
const logo = await sharp(path.join(ROOT, "brief/logo/logo-otica-pop.png"))
  .resize({ width: 760, kernel: "lanczos3" })
  .toBuffer();
const logoMeta = await sharp(logo).metadata();
const tagline = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#FFF8F1"/>
    <rect y="590" width="1200" height="40" fill="#E8651A"/>
    <text x="600" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#6B3A1F">Óculos e exame de vista em Itabuna-BA</text>
  </svg>`,
);
await sharp(tagline)
  .composite([{ input: logo, top: Math.round(250 - logoMeta.height / 2), left: Math.round(600 - logoMeta.width / 2) }])
  .png()
  .toFile(path.join(ROOT, "app", "opengraph-image.png"));

await writeFile(path.join(ROOT, "lib", "images.json"), JSON.stringify(manifest, null, 2));
console.log("ok");
