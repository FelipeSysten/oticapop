# Scroll 3D mais dinâmico: passo a passo + prompt para o Claude Code

## Primeiro: o que o site já tem

O site já tem um scroll 3D. A base técnica toda já está pronta:

| Peça | Arquivo | O que faz |
|---|---|---|
| Canvas 3D fixo | `components/client/Experience.tsx` | Cena React Three Fiber atrás/na frente do HTML |
| Óculos 3D | `components/client/Glasses.tsx` | Modelo procedural que lê os valores da cena a cada frame |
| Roteiro | `components/client/scene.ts` | Keyframes por seção (posição, giro, cor da armação, lente escura…) |
| Diretor do scroll | `components/client/MotionRoot.tsx` | Lenis (scroll suave) + GSAP ScrollTrigger ligam o scroll aos keyframes |

> Se você "não está vendo" o 3D: no celular ele só carrega no primeiro toque/scroll ou 4 s depois de abrir a página; no PC, quando o navegador fica ocioso. Com "reduzir movimento" ligado no sistema, ele fica parado de propósito.

Então não dá pra começar do zero. O próximo passo é deixar o movimento **mais vivo e mais reativo**.

---

## Passo a passo

### 1. Rode o site e veja o que tem hoje
```powershell
cd C:\Users\Brendo\Documents\DEV\otica-site
npm install
npm run dev
```
Abra http://localhost:3000, role a página inteira devagar e depois rápido. Anote o que parece "parado" ou "duro".

### 2. Faça um commit de segurança antes de mexer
```powershell
git add -A
git commit -m "antes do scroll 3D dinamico"
```
Se o Claude Code quebrar algo, você volta com `git checkout .`.

### 3. Escolha os efeitos (o prompt abaixo já inclui todos)
1. **Óculos reage à velocidade do scroll**: inclina e gira mais quando você rola rápido e "assenta" com mola quando para.
2. **Óculos segue o mouse** (parallax leve no PC; no celular, giroscópio opcional).
3. **Câmera com profundidade**: leve dolly/zoom e balanço da câmera entre as seções.
4. **Partículas/brilhos 3D** ao fundo que se movem com o scroll (poucas, leves).
5. **Cards das coleções com tilt 3D** (CSS `perspective`) e entrada em leque.
6. **Galeria horizontal "presa"** (pin) na seção da loja: rola na vertical e as fotos andam na horizontal.
7. **Títulos revelados por palavra/letra** com máscara.
8. **Parallax em camadas** nas fotos (fundo mais lento, frente mais rápida).
9. **Faixa (marquee) "A partir de R$ 89,90"** cuja velocidade e direção seguem o scroll.
10. **Barra de progresso** do scroll no topo, na cor laranja.

### 4. Abra o Claude Code na pasta do projeto
```powershell
cd C:\Users\Brendo\Documents\DEV\otica-site
claude
```

### 5. Cole o prompt (a seção abaixo da linha)

### 6. Teste
- `npm run dev`: role devagar, rápido, e de baixo pra cima.
- No Chrome, abra o DevTools (F12) → ícone de celular → teste em "iPhone 12" e "Galaxy S20".
- DevTools → Rendering → "Emulate prefers-reduced-motion: reduce": tudo precisa ficar parado e legível.
- `npm run build`: o build precisa passar sem erros.
- Lighthouse (DevTools → Lighthouse → Mobile): performance ≥ 80.

### 7. Ajuste fino
Peça ao Claude Code coisas pontuais, por exemplo: "diminua a inclinação por velocidade pela metade", "a galeria horizontal está rápida demais", "tire as partículas no celular".

### 8. Publique
`npm run build` gera a pasta `out/`. Suba na Vercel/Netlify como antes.

---

## PROMPT PARA O CLAUDE CODE (copie tudo abaixo)

---

Você vai deixar o scroll 3D do site da **Ótica Pop** mais dinâmico. **O site já existe e já tem scroll 3D funcionando. Não recrie nada do zero, não troque a stack e não mude textos, dados nem cores.**

### Antes de escrever código
1. Leia o `AGENTS.md`. Este projeto usa **Next.js 16.4** com mudanças incompatíveis com versões antigas: consulte `node_modules/next/dist/docs/` antes de mexer em qualquer API do Next.
2. Leia e entenda a arquitetura atual:
   - `components/client/scene.ts`: roteiro em keyframes (`STOPS`, `FIELDS`) e o objeto mutável `scene` (inclui `scene.mobile`, `scene.lowTier`, `scene.intro`).
   - `components/client/MotionRoot.tsx`: Lenis + GSAP ScrollTrigger, carregamento tardio do canvas, `prefers-reduced-motion`, `data-reveal`, `data-focus-*`, `data-sun`.
   - `components/client/Experience.tsx`: `<Canvas>` fixo, `PerformanceMonitor`, `Environment` com `Lightformer`.
   - `components/client/Glasses.tsx`: o óculos procedural, que lê `scene` dentro do `useFrame`.
   - `components/sections.tsx` e `app/globals.css`: as seções em HTML e os tokens de cor (`#E8651A`, `#6B3A1F`, `#111111`, `#FFF8F1`).
3. Me mostre um plano curto (arquivos que vai mexer + o que muda em cada um) e só depois implemente.

### O que implementar

**A. Óculos reativo ao scroll (o mais importante)**
- Leia a velocidade do Lenis (`lenis.velocity`) no `MotionRoot` e grave num campo novo do `scene` (ex.: `scene.velocity`), sem disparar re-render do React.
- No `Glasses.tsx`, por cima dos keyframes atuais, some um deslocamento **aditivo**: inclinação em `rz`/`rx` e giro extra em `ry` proporcionais à velocidade, com limite (clamp) e suavização tipo mola (`THREE.MathUtils.damp` ou lerp com delta). Quando o scroll para, o óculos volta suavemente para a pose do keyframe.
- Um leve "flutuar" em idle (seno no `y` e no `rz`, amplitude pequena).
- Não pode quebrar as cenas existentes: o slot do hero, a câmera atravessando a lente na seção "exame", a troca de cor da armação no preço, as lentes escuras no "sol" e a piscada no CTA.

**B. Parallax pelo mouse (só desktop / ponteiro fino)**
- `pointermove` normalizado (-1..1) gravado em `scene.pointer`; o óculos gira no máximo ~0,25 rad seguindo o cursor, com damping. Desligado em `(pointer: coarse)`.

**C. Câmera viva**
- Pequeno dolly no `z` e balanço sutil da câmera ligados ao progresso total da página (um `ScrollTrigger` do topo ao fim, gravando em `scene.progress`). Movimento sutil, sem enjoar.

**D. Partículas de brilho 3D**
- Um componente `Sparkles.tsx` (pode usar `<Sparkles>` ou `<Points>` do drei) com ~60 partículas laranja/creme no desktop e ~20 no mobile, deslocando-se em `y` com o scroll. Não renderizar em `scene.lowTier`.

**E. Seções HTML mais dinâmicas (GSAP + ScrollTrigger, dentro do mesmo `gsap.context` do MotionRoot)**
1. **Títulos (h2)**: revelação por palavra com máscara (envolver cada palavra num `span` com `overflow:hidden` via utilitário próprio; não instale o SplitText pago). Manter o texto acessível (`aria-label` no h2 com o texto inteiro, spans com `aria-hidden`).
2. **Cards das coleções**: entrada em leque (stagger, leve rotação) e tilt 3D com o mouse via CSS `perspective` + `transform` (só ponteiro fino).
3. **Loja**: galeria de fotos com **scroll horizontal fixado** (`pin: true`, `scrub: 1`) no desktop; no mobile, manter a rolagem vertical normal ou um carrossel com scroll-snap.
4. **Parallax em camadas** nas imagens grandes (`data-speed`: o fundo anda mais devagar que o conteúdo).
5. **Marquee** com "Armações a partir de R$ 89,90 • Lentes de grau • Óculos de sol •" entre Preço e Coleções, cuja velocidade aumenta e cuja direção inverte conforme a velocidade/direção do scroll.
6. **Barra de progresso** fina no topo (laranja `#E8651A`), `scaleX` ligado ao progresso da página.

### Regras obrigatórias
- **Performance:** nada de `setState` por frame; tudo pelo objeto `scene` + `useFrame`/`gsap.ticker`. Animar só `transform` e `opacity` no HTML. Manter o carregamento tardio do canvas e o poster. Lighthouse mobile ≥ 80 em performance e ≥ 95 em acessibilidade.
- **Mobile:** versões mais leves (menos partículas, sem tilt, sem mouse, sem pin horizontal se travar). Testar em 375px de largura.
- **`prefers-reduced-motion: reduce`:** nenhum dos efeitos novos roda; o conteúdo aparece estático e legível (siga o padrão que já existe no `MotionRoot`).
- **Limpeza:** todo listener, ScrollTrigger e ticker novo precisa ter cleanup (usar o `ctx`/`cleanups` existentes). `ScrollTrigger.refresh()` depois de fontes e imagens carregarem.
- **Não** mudar o conteúdo, os dados da ótica, os links de WhatsApp nem a paleta. **Não** instalar bibliotecas novas sem me perguntar (o projeto já tem `three`, `@react-three/fiber`, `@react-three/drei`, `gsap` e `lenis`).
- Manter `output: "export"` funcionando.

### Ao terminar
1. Rode `npm run lint` e `npm run build` e corrija todos os erros.
2. Me entregue um resumo: o que mudou por arquivo, e quais constantes ajustar para deixar cada efeito mais forte ou mais fraco (ex.: `VELOCITY_TILT`, `POINTER_STRENGTH`, `SPARKLE_COUNT`). Coloque essas constantes juntas no topo do `scene.ts`.
