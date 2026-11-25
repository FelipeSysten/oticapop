import { ConsentReopen } from "@/components/client/Consent";
import MapEmbed from "@/components/client/MapEmbed";
import { FRAME_NAMES } from "@/components/client/scene";
import { Fill, GlassesSvg, InstagramIcon, Picture, Value, WaLink, WhatsAppIcon, waLabel } from "@/components/ui";
import { site } from "@/lib/site";

const FRAME_SWATCHES = ["#111111", "conic-gradient(from 30deg,#5a2a0e,#c87a2c,#2a1206,#a8611f,#5a2a0e)", "#E8651A", "linear-gradient(135deg,#fff,#f3e4d4 60%,#e0cbb4)"];

/* ------------------------------------------------------------------ Header */
export function Header() {
  const nav = [
    ["#exame", "Exame de vista"],
    ["#preco", "Preços"],
    ["#colecoes", "Coleções"],
    ["#loja", "A loja"],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-cafe/10 bg-cream/92 backdrop-blur-sm">
      <div className="container-pop flex h-16 items-center justify-between gap-4">
        <a href="#inicio" aria-label="Ótica Pop, voltar ao início" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- export estático, logo pequeno sem otimização */}
          <img src="/img/logo-otica-pop.png" alt="Ótica Pop" width={217} height={84} className="h-10 w-auto" />
        </a>
        <nav aria-label="Seções" className="hidden md:block">
          <ul className="flex gap-7 font-display text-[15px] font-extrabold text-cafe">
            {nav.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-pop-dark">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <WaLink location="header" className="btn-primary min-h-10 px-4 py-2 text-base" aria-label={waLabel}>
          <WhatsAppIcon />
          <span>
            Chamar <span className="hidden sm:inline">no Whats</span>
          </span>
        </WaLink>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ 1. Hero */
export function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative flex min-h-svh items-center pt-16">
      <div className="container-pop grid items-center gap-6 py-10 md:grid-cols-[1.05fr_1fr] md:gap-10">
        <div className="order-2 md:order-1">
          <p className="eyebrow">Ótica de rua no Centro de Itabuna</p>
          <h1 id="hero-title" className="mt-3 text-[2.6rem] leading-[1.02] font-black tracking-tight text-cafe sm:text-6xl lg:text-[5.4rem]">
            Sua visão merece <span className="text-pop">o melhor</span>.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/85 md:text-xl">{site.promise}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <WaLink location="hero">
              <WhatsAppIcon /> Agendar exame
            </WaLink>
            <a href="#colecoes" className="btn-ghost">
              Ver armações
            </a>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-semibold text-cafe">
            <span className="size-2 rounded-full bg-pop" aria-hidden="true" />
            Armações a partir de {site.priceFrom}
          </p>
        </div>
        <div className="order-1 flex justify-center md:order-2">
          {/* Slot do óculos 3D: o canvas se encaixa aqui. O SVG é o poster (e a versão sem animação). */}
          <div id="glasses-slot-hero" className="relative aspect-[240/110] w-[78vw] max-w-[560px] md:w-full">
            <GlassesSvg className="glasses-poster absolute inset-0 size-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. Enxergue melhor */
export function Exame() {
  return (
    <section id="exame" aria-labelledby="exame-title" className="relative motion-safe:h-[220vh] md:motion-safe:h-[260vh]">
      <div className="relative flex min-h-svh flex-col gap-8 overflow-hidden motion-safe:sticky motion-safe:top-0 motion-safe:h-svh">
        <div data-focus-img className="absolute inset-0 will-change-[filter,transform]" aria-hidden="true">
          <Picture name="foco-fundo" alt="" sizes="100vw" imgClassName="size-full object-cover" className="block size-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/10 to-cream/80" aria-hidden="true" />

        <div data-focus-intro className="container-pop relative pt-24 text-center md:pt-28">
          <p className="eyebrow">Enxergue melhor</p>
          <p className="mx-auto mt-2 max-w-2xl font-display text-3xl leading-tight font-black text-cafe md:text-5xl">
            Com a lente certa, o mundo entra em foco.
          </p>
        </div>

        <div className="container-pop relative mt-auto pb-8 md:pb-14">
          <div data-focus-card className="max-w-3xl rounded-3xl bg-cream/95 p-6 shadow-xl shadow-cafe/10 md:p-8">
            <h2 id="exame-title" className="text-3xl leading-tight font-black text-cafe md:text-4xl">
              Agende sua consulta e saia enxergando tudo nítido.
            </h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              <li>
                <h3 className="text-lg font-extrabold text-ink">Exame de vista</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/80">
                  Marque pelo WhatsApp. <Value value={site.examInfo} label="onde e por quem o exame é feito, e se tem custo" />
                </p>
              </li>
              <li>
                <h3 className="text-lg font-extrabold text-ink">Lentes de grau</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/80">Feitas a partir da sua receita, pra você enxergar bem o dia todo.</p>
              </li>
              <li>
                <h3 className="text-lg font-extrabold text-ink">Multifocal</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/80">Perto e longe num óculos só, sem ficar trocando.</p>
              </li>
            </ul>
            <WaLink location="exame" className="btn-primary mt-6">
              <WhatsAppIcon /> Agendar exame
            </WaLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3. Preço */
export function Preco() {
  return (
    <section id="preco" aria-labelledby="preco-title" className="relative motion-safe:h-[220vh] md:motion-safe:h-[300vh]">
      <div className="flex min-h-svh items-end motion-safe:sticky motion-safe:top-0 motion-safe:h-svh md:items-center">
        <div className="container-pop pt-24 pb-10 md:py-0">
          <div className="max-w-xl">
            <p className="eyebrow">Preço que cabe no bolso</p>
            <h2 id="preco-title" className="mt-2 font-black text-cafe">
              <span className="block text-2xl md:text-3xl">Armações a partir de</span>
              <span className="block text-7xl leading-none tracking-tight text-pop md:text-[8.5rem]">
                <span className="align-top text-3xl md:text-5xl">R$</span>89,90
              </span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink/85">
              Estilo não precisa pesar no bolso. Experimente à vontade e escolha com calma.
            </p>
            <div className="mt-6" data-frame-list>
              <p className="text-sm font-semibold text-cafe">Pra cada estilo, uma cor:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {FRAME_NAMES.map((name, i) => (
                  <li
                    key={name}
                    data-frame={i}
                    data-active={i === 0}
                    className="flex items-center gap-2 rounded-full border-2 border-transparent bg-sand px-3 py-1.5 text-sm font-semibold text-ink transition-colors data-[active=true]:border-pop data-[active=true]:bg-cream"
                  >
                    <span className="size-4 rounded-full ring-1 ring-black/15" style={{ background: FRAME_SWATCHES[i] }} aria-hidden="true" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
            <dl className="mt-6 space-y-1 text-[15px] text-ink/85">
              <div>
                <dt className="inline font-semibold">Pagamento: </dt>
                <dd className="inline">
                  <Value value={site.payment} label="formas de pagamento e parcelamento" />
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Condições: </dt>
                <dd className="inline">
                  <Value value={site.offerTerms} label="o que o preço inclui (só a armação? lentes à parte?)" />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4. Coleções */
const COLLECTIONS = [
  { id: "feminino", title: "Feminino", text: "Modelos pra combinar com o seu jeito, do trabalho ao rolê.", photo: "produto-gatinho" as const, alt: "Armação feminina estilo gatinho em acetato marrom translúcido" },
  { id: "masculino", title: "Masculino", text: "Clássicos e modernos, pro dia a dia sem complicação.", photo: "produto-retangular" as const, alt: "Armação retangular preta com detalhes vermelhos" },
  { id: "infantil", title: "Infantil", text: "Pra criançada enxergar bem na escola e na brincadeira.", photo: null, alt: "" },
  { id: "sol", title: "Sol", text: "Pra encarar o sol da Bahia com estilo e proteção UV.", photo: null, alt: "" },
];

export function Colecoes() {
  return (
    <section id="colecoes" aria-labelledby="colecoes-title" className="relative py-24 md:py-32">
      <div className="container-pop">
        <div className="max-w-xl" data-reveal>
          <p className="eyebrow">Coleções</p>
          <h2 id="colecoes-title" className="mt-2 text-4xl leading-tight font-black text-cafe md:text-6xl">
            Tem óculos pra todo mundo da casa.
          </h2>
          <p className="mt-4 text-lg text-ink/85">Quatro linhas, muitos estilos. Chama no Whats e pergunta pelo modelo que você curtiu.</p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {COLLECTIONS.map((c, i) => (
            <li key={c.id} data-reveal data-delay={i * 0.08} className="group flex flex-col overflow-hidden rounded-3xl bg-sand">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#eadfd4]">
                {c.photo ? (
                  <Picture
                    name={c.photo}
                    alt={c.alt}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="block size-full"
                    imgClassName="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center p-4 text-center text-sm">
                    <Fill>foto da linha {c.title}</Fill>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 md:p-5">
                <h3 className="text-xl font-black text-cafe md:text-2xl">{c.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink/80 md:text-[15px]">{c.text}</p>
                <WaLink
                  location={`colecao-${c.id}`}
                  className="mt-3 inline-flex items-center gap-1 font-display font-extrabold text-pop-dark hover:underline"
                  aria-label={`Perguntar no WhatsApp sobre a linha ${c.title}`}
                >
                  Quero ver <span aria-hidden="true">→</span>
                </WaLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 5. Sol */
export function Sol() {
  return (
    <section id="sol" aria-labelledby="sol-title" className="relative bg-cafe-deep text-cream motion-safe:h-[170vh] md:motion-safe:h-[210vh]">
      <div className="relative flex min-h-svh items-end overflow-hidden motion-safe:sticky motion-safe:top-0 motion-safe:h-svh md:items-center">
        <div
          data-sun
          aria-hidden="true"
          className="absolute top-[29%] left-1/2 size-[95vmin] -translate-x-1/2 -translate-y-1/2 rounded-full md:top-1/2 md:left-[72.5%] md:size-[80vmin]"
          style={{ background: "radial-gradient(circle, #ffb15c 0%, #E8651A 38%, rgba(232,101,26,.35) 58%, rgba(58,31,16,0) 72%)" }}
        />
        <div className="container-pop relative pb-12 md:pb-0">
          <div className="max-w-lg">
            <p className="font-display text-sm font-extrabold tracking-[0.14em] text-pop uppercase">Óculos de sol</p>
            <h2 id="sol-title" className="mt-2 text-4xl leading-tight font-black md:text-6xl">
              O sol de Itabuna não perdoa.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-cream/90">
              Óculos de sol com proteção UV pra curtir a rua, a praia e o fim de semana sem apertar os olhos.
            </p>
            <WaLink location="sol" className="btn-primary mt-7">
              <WhatsAppIcon /> Ver modelos de sol
            </WaLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 6. A loja */
export function Loja() {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapsQuery)}`;
  return (
    <section id="loja" aria-labelledby="loja-title" className="relative bg-sand py-24 md:py-32">
      <div className="container-pop">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">A loja</p>
          <h2 id="loja-title" className="mt-2 text-4xl leading-tight font-black text-cafe md:text-6xl">
            Passa aqui, a casa é sua.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/85">
            Parede cheia de armação pra experimentar e gente que te ajuda a achar a que combina com você. Fica no Centro de Itabuna.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-12 md:gap-6">
          <Picture
            name="loja-interior-2"
            alt="Interior da Ótica Pop: expositores de madeira cheios de armações e cadeiras laranja"
            sizes="(min-width: 768px) 58vw, 100vw"
            className="block overflow-hidden rounded-3xl md:col-span-7"
            imgClassName="size-full object-cover"
          />
          <Picture
            name="loja-interior-1"
            alt="Expositor de óculos de sol e armações na Ótica Pop"
            sizes="(min-width: 768px) 30vw, 100vw"
            className="block overflow-hidden rounded-3xl md:col-span-5"
            imgClassName="size-full max-h-[520px] object-cover"
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-12">
          <figure className="overflow-hidden rounded-3xl bg-cream md:col-span-4" data-reveal>
            <Picture
              name="equipe-01"
              alt="Integrante da equipe da Ótica Pop em frente ao painel laranja da loja"
              sizes="(min-width: 768px) 30vw, 100vw"
              className="block aspect-[4/5] overflow-hidden"
              imgClassName="size-full object-cover object-top"
            />
            <figcaption className="p-5">
              <p className="font-display text-lg font-extrabold text-cafe">
                <Value value={site.team[0].name} label="nome" />
              </p>
              <p className="text-sm text-ink/80">
                <Value value={site.team[0].role} label="função" />
              </p>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-6 rounded-3xl bg-cream p-6 md:col-span-4 md:p-8" data-reveal>
            <div>
              <h3 className="text-sm font-extrabold tracking-wider text-pop-dark uppercase">Endereço</h3>
              <p className="mt-1 text-lg font-semibold text-ink">
                {site.address.street}
                <br />
                {site.address.district}, {site.address.city}-{site.address.state}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wider text-pop-dark uppercase">Horário</h3>
              {site.hours ? (
                <ul className="mt-1 text-ink">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1">
                  <Fill>horário de funcionamento</Fill>
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wider text-pop-dark uppercase">Telefone</h3>
              <p className="mt-1 text-ink">
                <Value value={site.phone} label="telefone com DDD" />
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <a href={directions} target="_blank" rel="noopener" className="btn-ghost min-h-11 px-5 py-2 text-base">
                Como chegar
              </a>
              <WaLink location="loja" className="btn-primary min-h-11 px-5 py-2 text-base">
                <WhatsAppIcon /> WhatsApp
              </WaLink>
            </div>
          </div>

          <div className="md:col-span-4" data-reveal>
            <MapEmbed query={site.mapsQuery} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 7. Clientes */
export function Clientes() {
  return (
    <section id="clientes" aria-labelledby="clientes-title" className="relative py-24 md:py-32">
      <div className="container-pop">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
          <div className="max-w-xl">
            <p className="eyebrow">Clientes</p>
            <h2 id="clientes-title" className="mt-2 text-4xl leading-tight font-black text-cafe md:text-6xl">
              Gente que já escolheu a Pop.
            </h2>
          </div>
          <a href={site.instagram} target="_blank" rel="noopener" className="btn-ghost self-start md:self-auto">
            <InstagramIcon /> Ver no {site.instagramHandle}
          </a>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[1, 2, 3, 4].map((n, i) => (
            <li
              key={n}
              data-reveal
              data-delay={i * 0.08}
              className="flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-cafe/25 bg-sand p-4 text-center text-sm"
            >
              <Fill>foto de cliente {n} (destaque &quot;Clientes&quot; do Instagram), com autorização</Fill>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink/80">
          <Fill>depoimentos reais (nome + texto + autorização), opcional</Fill>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 8. CTA final */
export function Contato() {
  return (
    <section id="contato" aria-labelledby="contato-title" className="relative flex min-h-svh items-center bg-pop py-24 text-ink">
      <div className="container-pop flex flex-col items-center text-center">
        <div id="glasses-slot-cta" className="relative aspect-[240/110] w-[72vw] max-w-[420px]">
          <GlassesSvg className="glasses-poster absolute inset-0 size-full" />
        </div>
        <p className="mt-8 font-display text-sm font-extrabold tracking-[0.14em] uppercase">Bora cuidar da sua visão?</p>
        <h2 id="contato-title" className="mt-2 max-w-3xl text-4xl leading-[1.05] font-black md:text-7xl">
          Agende seu exame pelo WhatsApp.
        </h2>
        <p className="mt-4 max-w-xl text-lg">Manda um oi que a gente marca o melhor horário pra você.</p>
        <WaLink location="cta-final" className="btn mt-8 bg-ink px-8 text-xl text-cream hover:bg-cafe-deep">
          <WhatsAppIcon className="size-6" /> Chamar no WhatsApp
        </WaLink>
        <dl className="mt-10 grid gap-6 text-left sm:grid-cols-2 sm:gap-12">
          <div>
            <dt className="font-display font-extrabold">Horário</dt>
            <dd className="mt-1">{site.hours ? site.hours.join(" · ") : <Fill>horário de funcionamento</Fill>}</dd>
          </div>
          <div>
            <dt className="font-display font-extrabold">Endereço</dt>
            <dd className="mt-1">{site.address.full}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Rodapé */
export function Footer() {
  return (
    <footer className="bg-cafe-deep py-12 text-cream/85">
      <div className="container-pop grid gap-8 text-sm md:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-black text-cream">
            ótica <span className="text-pop">pop</span>
          </p>
          <p className="mt-2">{site.slogan}.</p>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-cream">Visite</h2>
          <p className="mt-2">{site.address.full}</p>
          <p className="mt-1">{site.hours ? site.hours.join(" · ") : <Fill>horário</Fill>}</p>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-cream">Fale com a gente</h2>
          <ul className="mt-2 space-y-1">
            <li>
              <WaLink location="rodape" className="underline underline-offset-4 hover:text-pop">
                WhatsApp
              </WaLink>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-pop">
                Instagram {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-cream">Empresa</h2>
          <p className="mt-2">
            <Value value={site.legalName} label="razão social" />
          </p>
          <p className="mt-1">
            CNPJ: <Value value={site.cnpj} label="CNPJ" />
          </p>
          <p className="mt-3">
            <ConsentReopen />
          </p>
        </div>
      </div>
      <p className="container-pop mt-10 text-xs text-cream/70">© {new Date().getFullYear()} Ótica Pop. Itabuna-BA.</p>
    </footer>
  );
}

/* ------------------------------------------------------------------ WhatsApp flutuante */
export function WhatsAppFloat() {
  return (
    <WaLink
      location="flutuante"
      aria-label={waLabel}
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-wa text-white shadow-lg shadow-black/25 transition-transform hover:scale-105 md:right-6 md:bottom-6 md:size-16"
    >
      <WhatsAppIcon className="size-8" />
    </WaLink>
  );
}
