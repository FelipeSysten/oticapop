# Site da Ótica Pop

Site institucional em scroll 3D: um óculos redondo atravessa a página e se transforma conforme o visitante rola.
Next.js 16 (export estático) + React Three Fiber + GSAP ScrollTrigger + Lenis + Tailwind 4.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # gera a pasta out/ (site estático pronto para publicar)
npm run images     # reconverte as fotos de brief/ para public/img (AVIF + WebP)
```

## Onde mexer

| O quê | Arquivo |
|---|---|
| Dados da loja (telefone, horário, CNPJ, pagamento...) | `lib/site.ts` |
| Textos e seções | `components/sections.tsx` |
| Roteiro do óculos 3D (keyframes por seção) | `components/client/scene.ts` |
| Modelo 3D e materiais | `components/client/Glasses.tsx` |
| Cores e tipografia | `app/globals.css` (bloco `@theme`) e `DESIGN.md` |
| IDs de GA4, Meta Pixel e domínio | `.env` |

Todo campo `null` em `lib/site.ts` aparece no site como uma etiqueta amarela **[PREENCHER: ...]**. Preencha o campo e a etiqueta some. Telefone, horário, CNPJ e razão social também entram automaticamente no JSON-LD (SEO local).

## Placeholders que faltam

**Em `lib/site.ts`:**
- `phone`: telefone ou WhatsApp com DDD
- `hours` e `openingHoursSchema`: horário de funcionamento (texto do site e formato do Google)
- `cnpj` e `legalName`: CNPJ e razão social (rodapé)
- `payment`: formas de pagamento e parcelamento
- `offerTerms`: o que o "a partir de R$ 89,90" inclui (só a armação? lentes à parte?)
- `examInfo`: onde e por quem o exame é feito, e se tem custo
- `team[0].name` e `team[0].role`: nome e função da pessoa da foto da equipe

**Fotos (coloque em `brief/` e rode `npm run images`):**
- Fotos das linhas **Infantil** e **Sol** (cards de Coleções)
- 4 fotos de clientes do destaque "Clientes" do Instagram, com autorização (seção Clientes)
- Depoimentos reais com nome e autorização (opcional)
- Logo em SVG ou PNG grande (o atual tem 217×84 px)

**Em `.env`:** domínio final (`NEXT_PUBLIC_SITE_URL`), `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID`.

## Publicar na Vercel (grátis)

1. Crie um repositório no GitHub e envie esta pasta. O `.gitignore` já ignora `node_modules`, `.next`, `out` e `.env*`.
2. Em [vercel.com](https://vercel.com), entre com o GitHub, clique em **Add New → Project** e importe o repositório. A Vercel detecta o Next.js sozinha, então não precisa mudar nada no build.
3. Em **Settings → Environment Variables**, cadastre `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID`. Elas não sobem para o GitHub porque o `.env` é ignorado.
4. Clique em **Deploy**. Cada `git push` publica uma versão nova.
5. Para usar um domínio próprio (ex.: `oticapop.com.br`), vá em **Settings → Domains**, siga as instruções de DNS e atualize `NEXT_PUBLIC_SITE_URL`.

**Netlify** também funciona: comando de build `npm run build` e pasta de publicação `out`.

## Tracking e LGPD

- Todo CTA de WhatsApp tem `data-track="click_whatsapp"` e `data-location` com a seção. O clique vira evento `click_whatsapp` no GA4 e `Contact` (mais o evento custom) no Meta Pixel.
- O banner de cookies só carrega GA4 e Pixel depois do "Aceitar". A escolha fica salva no navegador e pode ser mudada em "Preferências de cookies", no rodapé.
- O Google Maps só carrega quando a pessoa clica em "Ver a loja no mapa".

## Acessibilidade e desempenho

- Com `prefers-reduced-motion`, a página não carrega o 3D nem faz scrub: mostra um óculos estático em SVG e usa o scroll normal.
- No celular, a cena é simplificada (dpr 1, menos polígonos, sem iridescência), o scroll é nativo e o 3D carrega na primeira interação.
- Lighthouse do build (Chrome headless): mobile 99–100 em performance e 100 em acessibilidade, boas práticas e SEO. Desktop 100 em tudo.
