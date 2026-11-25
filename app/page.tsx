import MotionRoot from "@/components/client/MotionRoot";
import { Clientes, Colecoes, Contato, Exame, Footer, Header, Hero, Loja, Preco, Sol, WhatsAppFloat } from "@/components/sections";

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="relative z-10">
        <Hero />
        <Exame />
        <Preco />
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
