# DESIGN.md: Ótica Pop, site em scroll 3D

> Status: **aprovado e implementado**. As mudanças feitas durante a implementação estão na seção 8.

## 1. Tokens de cor

Conferidos por amostragem de pixels no `brief/logo/logo-otica-pop.png` (PNG 217×84 com fundo transparente). As cores medidas batem com as do prompt:

| Token | Hex | Uso | Medido no logo |
|---|---|---|---|
| `pop-orange` | `#E8651A` | Cor de ação: botões, links, destaques, o "sol" da cena 5 | ~`#E86410` a `#E86818` |
| `pop-orange-dark` | `#B34A0C` | Hover dos botões e **texto laranja sobre fundo claro** (contraste AA) | derivado |
| `cafe` | `#6B3A1F` | Títulos, textos fortes, fundos escuros quentes | ~`#683820` a `#704020` |
| `cafe-deep` | `#3A1F10` | Fundo das cenas escuras (sol, CTA final) | derivado |
| `ink` | `#111111` | Ícone dos óculos, texto do corpo | `#000000` a `#080808` |
| `cream` | `#FFF8F1` | Fundo base | – |
| `sand` | `#F2ECE6` | Fundo alternado, cards | – |
| `whatsapp` | `#25D366` | Só no botão flutuante do WhatsApp | – |

**Regras de contraste (meta: Lighthouse a11y ≥ 95)**
- Texto branco sobre `#E8651A` tem contraste de cerca de 3,3:1. Isso só passa como texto grande, então os botões laranja usam texto em **peso 800 e ≥ 18px** ou texto `ink` sobre laranja (~5,7:1).
- Texto laranja sobre `cream` usa `pop-orange-dark` `#B34A0C` (~5,2:1, passa em corpo de texto) ou fica só em títulos grandes.
- `cafe` sobre `cream` dá cerca de 9:1, por isso é a cor padrão dos títulos.

## 2. Tipografia

- **Títulos:** `Nunito` 800/900 (sans arredondada e geométrica, a mais próxima do "ótica pop" do logo). Tracking levemente negativo nos títulos grandes.
- **Texto:** `Inter` 400/500/600.
- Carregadas com `next/font/google` (self-hosted no build, sem requisição externa, `display: swap`).
- Escala (mobile → desktop): H1 40→88px, H2 32→56px, H3 22→28px, corpo 16→18px, line-height 1.5.

## 3. O herói 3D

Um **óculos redondo procedural** inspirado no ícone do logo (não há `brief/3d/oculos.glb`):
- Aros: `TorusGeometry` (desktop: 64 segmentos radiais; mobile: 32)
- Ponte: `TubeGeometry` em curva suave entre os aros
- Hastes: `TubeGeometry` com a dobra da orelha
- Lentes: `MeshTransmissionMaterial` no desktop; no mobile, `MeshPhysicalMaterial` com `transparent` e `opacity` (sem transmission)
- Armação: `MeshPhysicalMaterial` com `clearcoat`, cor animável entre 4 estados

**Paleta de armações (cena 3):** preto `#111111` → tartaruga `#7A3E1A` (com textura procedural gerada em canvas) → laranja pop `#E8651A` → transparente (cristal com tom levemente quente).

## 4. Roteiro de cenas final

Uma timeline mestre do GSAP (`scrub: 1`) sobre o `<main>` inteiro escreve num objeto simples (`rotY`, `posX`, `scale`, `frameColor`, `lensTint`, `lensGlow`, `camZ`), que o `useFrame` lê. Canvas fixo em `z-0`, seções HTML em `z-10`.

| # | Seção (âncora) | O que o óculos 3D faz | Conteúdo em HTML |
|---|---|---|---|
| 1 | **Hero** `#inicio` | Entra girando (intro de ~1,2s, não depende do scroll), para de frente, e as lentes refletem um brilho laranja (env map com área laranja) | Logo, H1 "Sua visão merece o melhor", subtítulo com a promessa, botões **Agendar exame** (WhatsApp) e **Ver armações** (âncora `#colecoes`) |
| 2 | **Enxergue melhor** `#exame` | A câmera avança até atravessar a lente. Atrás do canvas, uma imagem de fundo começa desfocada (`filter: blur`) e fica nítida conforme o scroll, imitando um "foco" | Exame de vista, lentes de grau, multifocal. Detalhes do exame `[PREENCHER]` |
| 3 | **A partir de R$ 89,90** `#preco` | Gira 180° e troca a cor da armação em 4 passos (preto → tartaruga → laranja → transparente), com o nome da cor ao lado | Preço em destaque, parcelamento `[PREENCHER]` |
| 4 | **Coleções** `#colecoes` | Encolhe e vai para a lateral direita (no mobile: some para cima) e os cards entram com stagger | 4 cards: Feminino, Masculino, Infantil, Sol (ver nota sobre fotos) |
| 5 | **Óculos de sol** `#sol` | As lentes escurecem (tint marrom-escuro), e o fundo vira um degradê radial laranja quente atrás do óculos, o "sol" | Linha solar e proteção UV (sem números de proteção que não estejam no brief) |
| 6 | **A loja** `#loja` | Descansa no canto inferior, pequeno e com idle leve | Fotos da loja (fachada e interior), equipe, endereço e mapa (iframe do Google Maps com `loading="lazy"`) |
| 7 | **Clientes** `#clientes` | Fora de quadro | Bloco "Clientes" com placeholder `[PREENCHER: fotos de clientes do destaque do Instagram, com autorização]`. **Sem depoimentos**, porque o brief não traz nenhum |
| 8 | **CTA final** `#contato` | Volta ao centro, de frente, e "pisca": as lentes ganham emissive laranja num pulso curto | "Agende seu exame pelo WhatsApp", horário `[PREENCHER]` e endereço |

Sempre visível: botão flutuante do WhatsApp (canto inferior direito, com `aria-label`). Rodapé com Instagram, endereço, horário `[PREENCHER]` e CNPJ `[PREENCHER]`.

### Imagem de fundo da cena 2 ("foco")
As duas imagens em `brief/referencias/` foram geradas por IA (Gemini). Elas mostram exatamente o efeito "desfocado → nítido pela lente", mas **não vou usá-las como foto da loja ou de produto**. Proposta: usar uma delas (comprimida, ~1600px, WebP) só como **fundo ilustrativo** da cena 2, porque não representa nenhum produto ou pessoa real. Se preferir evitar, uso um fundo abstrato (bokeh em CSS nas cores da marca).

## 5. Variações por dispositivo

| | Desktop | Mobile (< 768px) ou `hardwareConcurrency ≤ 4` | `prefers-reduced-motion` |
|---|---|---|---|
| Canvas | `dpr [1, 1.75]` + `PerformanceMonitor` | `dpr 1`, menos segmentos, sem transmission | **Sem canvas**: imagem estática (poster PNG do óculos) |
| Scroll | Lenis + ScrollTrigger scrub | Scroll nativo (sem Lenis), timeline mais curta | Scroll nativo, sem scrub, sem animações de entrada |
| Cena 2 | Câmera atravessa a lente + blur do fundo | Só o blur do fundo | Fundo já nítido |

**LCP:** o H1 em HTML. O canvas é carregado com `next/dynamic` (`ssr: false`) depois da primeira pintura, com um poster PNG do óculos no lugar enquanto carrega.

## 6. Estrutura técnica

- Next.js (App Router) + TypeScript + Tailwind, `output: 'export'`, `images.unoptimized` + imagens pré-convertidas com `sharp` num script (`scripts/optimize-images.mjs`) para WebP/AVIF em 400/800/1600px
- `@react-three/fiber`, `@react-three/drei`, `gsap` (ScrollTrigger), `lenis`, `zustand`
- SEO: `metadata` do Next, JSON-LD `Optician`, `sitemap.ts` e `robots.ts` (export estático), OG image com o logo
- Tracking: `NEXT_PUBLIC_META_PIXEL_ID` e `NEXT_PUBLIC_GA4_ID` no `.env.example`. Evento `click_whatsapp` (com `location` = seção) em todo CTA
- LGPD: banner simples (Aceitar / Recusar). Pixel e GA4 só são injetados após o aceite, que fica salvo em `localStorage`

## 7. Tom de voz (amostras de copy)

- Hero: "Sua visão merece o melhor." / "Óculos com estilo, preço que cabe no bolso e atendimento que te conhece pelo nome."
- Preço: "Armação a partir de R$ 89,90. É isso mesmo."
- Coleções: "Tem óculos pra todo mundo da casa."
- Sol: "O sol de Itabuna não perdoa. Seus olhos agradecem."
- CTA: "Bora cuidar da sua visão? Chama a gente no Whats."

## 8. Mudanças durante a implementação

- **Lentes:** o `MeshTransmissionMaterial` só refrata a cena 3D, não o HTML que fica embaixo do canvas, e por isso as lentes viravam discos cinza opacos sobre a página. Troquei por um `MeshPhysicalMaterial` transparente (vidro com reflexo do ambiente laranja e iridescência leve de antirreflexo no desktop). Assim a lente mostra a página atrás, escurece na cena do sol e brilha no CTA.
- **Camadas:** o canvas fica **acima** do conteúdo (`z-20`, `pointer-events: none`), e as posições do óculos foram coreografadas para ocupar os espaços vazios. Isso deixa as seções com fundo real (foto, sol, laranja) e não atrapalha o contraste nem o Lighthouse.
- **Slots:** no hero e no CTA final, o óculos se encaixa num elemento HTML (`#glasses-slot-hero`, `#glasses-slot-cta`), que é o mesmo lugar do poster SVG. A troca entre poster e 3D não pula.
- **Celular:** o 3D carrega na primeira interação (toque ou scroll) ou 4s depois do load. No desktop, carrega quando o navegador fica ocioso.
- **Fachada:** a foto da fachada (placa "pop óculos" e o vizinho de cima) ficou fora do site até a loja confirmar.
- **Roteiro:** os keyframes de cada cena ficam em `components/client/scene.ts`, com valores separados para desktop e celular.
