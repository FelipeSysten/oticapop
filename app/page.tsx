import MotionRoot from "@/components/client/MotionRoot";
import SectionNav from "@/components/client/SectionNav";
import { Clientes, Colecoes, Contato, Exame, Footer, Header, Hero, Loja, Marquee, Preco, Sol, WhatsAppFloat } from "@/components/sections";

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Pular para o conteúdo
      </a>
      {/* Barra de progresso do scroll (animada pelo MotionRoot) */}
      <div data-progress aria-hidden="true" className="fixed inset-x-0 top-0 z-[45] h-1 origin-left scale-x-0 bg-pop motion-reduce:hidden" />
      <Header />
      <SectionNav />
      <main id="conteudo" className="relative z-10">
        <Hero />
        <Exame />
        <Preco />
        <Marquee />
        <Colecoes />
        <Sol />
        <Loja />
        <Clientes />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFloat />
      <MotionRoot />
    </>
  );
}
