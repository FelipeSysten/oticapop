# Prompt para o Claude Code: site da Ótica Pop em scroll 3D

> Como usar: abra uma sessão do Claude Code na pasta `Documents\DEV\otica-site`, confira se a pasta `brief/` já tem o logo e as fotos, e cole tudo o que está abaixo da linha.

---

Use a skill `scroll-cinema-3d` (e `frontend-design`, se estiver instalada). Crie o site institucional da **Ótica Pop**, uma ótica de rua em Itabuna-BA, com uma experiência de **scroll cinematográfico em 3D**: um par de óculos em 3D atravessa a página e se transforma conforme o visitante rola.

## 1. Sobre o negócio (dados reais, não invente outros)

- **Nome:** Ótica Pop. Instagram: @oticapop.ba
- **Slogan atual:** "Sua visão merece o melhor"
- **Oferta principal:** armações a partir de **R$ 89,90**, lentes de grau, óculos de sol
- **Serviço:** "Agende sua consulta" (exame de vista)
- **Linhas:** Infantil, Feminino, Masculino, Sol
- **Endereço:** R. Mariá Ferreira, 234, Centro, Itabuna, BA
- **WhatsApp:** https://wa.link/748f9q (é o CTA principal do site inteiro)
- Os dados que estão faltando (horário, telefone, CNPJ, marcas, depoimentos, formas de pagamento) estão em `brief/dados-da-otica.md`. **Se um dado não estiver lá, deixe um placeholder visível `[PREENCHER: ...]`. Nunca invente depoimentos, números, prêmios ou marcas.**

## 2. Posicionamento (baseado na análise de mercado)

- O mercado óptico brasileiro faturou cerca de R$ 28 bilhões em 2025 (+4,1%). Em 2026 o crescimento desacelerou, o consumidor **pesquisa e compara mais antes de comprar**, e a moda pesa cada vez mais na escolha dos óculos.
- Itabuna tem mais de 30 óticas, quase 20 delas no Centro, incluindo redes como a Óticas Diniz. A Ótica Pop precisa se diferenciar por **preço acessível + estilo + atendimento próximo**, e não competir só por preço.
- **Público:** moradores de Itabuna e região (Ilhéus, cidades do sul da Bahia), classes B/C, famílias (tem linha infantil), jovens que veem óculos como acessório de moda.
- **Tom de voz:** "pop" de verdade: leve, alegre, próximo e baiano sem caricatura. Frases curtas. Nada de "excelência em soluções ópticas".
- **Promessa do site:** "Óculos com estilo, preço que cabe no bolso e atendimento que te conhece pelo nome."

## 3. Identidade visual (extraída do logo em `brief/logo/`)

- **Laranja Pop:** `#E8651A` (palavra "ótica"), a cor de ação, usada nos botões
- **Marrom Café:** `#6B3A1F` (palavra "pop"), para textos fortes e fundos escuros quentes
- **Preto:** `#111111` (o ícone dos óculos)
- **Base:** off-white quente `#FFF8F1`, cinza `#F2ECE6`
- O ícone do logo é um par de óculos redondos apoiado sobre o "c" de ótica. **Esse óculos redondo preto é o "herói" 3D do site.**
- **Tipografia:** uma sans arredondada e geométrica parecida com a do logo (sugestões: "Nunito" ou "Quicksand" para títulos com peso 800, e "Inter" para o texto)
- Confira as cores no próprio PNG do logo antes de fixar os tokens. Se o logo vier em SVG, use o SVG.

## 4. Roteiro de cenas (scroll cinema)

Técnica: **React Three Fiber + GSAP ScrollTrigger + Lenis**, com um canvas fixo e as seções em HTML por cima. O modelo 3D é um **óculos redondo procedural** (aros com TubeGeometry ou torus, hastes, lentes com `MeshTransmissionMaterial`) inspirado no ícone do logo. Se existir `brief/3d/oculos.glb`, use ele no lugar.

| # | Seção | O que o óculos 3D faz | Conteúdo em HTML |
|---|---|---|---|
| 1 | **Hero** | O óculos entra girando, para de frente e as lentes refletem a cor laranja | Logo, "Sua visão merece o melhor", botões "Agendar exame" e "Ver armações" |
| 2 | **Enxergue melhor** | A câmera atravessa a lente: o fundo desfocado fica nítido (efeito de "foco" via blur/DOF) | Exame de vista, lentes de grau, multifocal |
| 3 | **A partir de R$ 89,90** | O óculos gira 180° e troca de cor de armação (preto, tartaruga, laranja, transparente) a cada passo do scroll | Destaque de preço, parcelamento `[PREENCHER]` |
| 4 | **Coleções** | O óculos encolhe para a lateral; os cards entram | 4 cards: Feminino, Masculino, Infantil, Sol, com as fotos de `brief/fotos-produtos/` |
| 5 | **Óculos de sol** | As lentes escurecem (tint), o fundo vira um "sol" laranja quente | Linha solar, proteção UV |
| 6 | **A loja** | O óculos descansa num canto | Fotos de `brief/fotos-loja/`, equipe, endereço com mapa (iframe do Google Maps) |
| 7 | **Clientes** | — | Fotos reais de clientes (destaque "Clientes" do Instagram), depoimentos **só se estiverem no brief** |
| 8 | **CTA final** | O óculos volta ao centro e "pisca" (as lentes brilham) | "Agende seu exame pelo WhatsApp" + horário + endereço |

Além disso: um botão flutuante de WhatsApp sempre visível, e um rodapé com Instagram, endereço, horário e CNPJ.

## 5. Requisitos técnicos

- **Stack:** Next.js (App Router) + TypeScript + Tailwind + @react-three/fiber + @react-three/drei + GSAP/ScrollTrigger + Lenis, com export estático (`output: 'export'`) para hospedar grátis na Vercel ou Netlify
- **Mobile primeiro:** a maior parte do público vem do Instagram, ou seja, do celular. Abaixo de 768px, faça uma cena simplificada (menos polígonos, sem transmission, `dpr` 1) e uma animação mais curta.
- **`prefers-reduced-motion`:** sem scrub, imagem estática do óculos
- **Performance:** Lighthouse mobile ≥ 80 em performance e ≥ 95 em acessibilidade. O LCP é o título em HTML, e o canvas carrega depois, com um poster.
- **Imagens:** converta as fotos do brief para WebP/AVIF com `next/image` ou sharp, em no máximo 1600px
- **SEO local:** title "Ótica Pop | Óculos e exame de vista em Itabuna-BA", meta description, Open Graph com o logo, JSON-LD `Optician` (LocalBusiness) com endereço, telefone e horário, além de `sitemap.xml` e `robots.txt`
- **Tracking:** deixe pronto o espaço para o Meta Pixel e o GA4 (IDs como placeholder em `.env`), e um evento `click_whatsapp` em todo CTA
- **LGPD:** banner de cookies simples, que só carrega os pixels após o aceite
- **Idioma:** pt-BR

## 6. Processo

1. Leia todo o `brief/` (logo, fotos, `dados-da-otica.md`) e me mostre um resumo do que encontrou e do que está faltando.
2. Escreva `DESIGN.md` com os tokens de cor, a tipografia e o roteiro de cenas final, e espere meu OK.
3. Implemente seção por seção, rodando o dev server e conferindo cada cena no navegador.
4. Teste com largura de 375px e com reduced motion, rode o Lighthouse e corrija o que estiver abaixo da meta.
5. No fim, liste os placeholders `[PREENCHER]` que ficaram e explique como publicar na Vercel.
