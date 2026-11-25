// Dados reais da Ótica Pop. Tudo que é `null` aparece no site como [PREENCHER: ...].
// Fonte: brief/dados-da-otica.md. Não invente dados: preencha aqui quando a loja confirmar.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://otica-pop.vercel.app").replace(/\/$/, "");

export const site = {
  name: "Ótica Pop",
  slogan: "Sua visão merece o melhor",
  promise: "Óculos com estilo, preço que cabe no bolso e atendimento que te conhece pelo nome.",
  priceFrom: "R$ 89,90",
  whatsapp: "https://wa.link/748f9q",
  instagram: "https://www.instagram.com/oticapop.ba/",
  instagramHandle: "@oticapop.ba",
  address: {
    street: "R. Mariá Ferreira, 234",
    district: "Centro",
    city: "Itabuna",
    state: "BA",
    country: "BR",
    full: "R. Mariá Ferreira, 234, Centro, Itabuna-BA",
  },
  mapsQuery: "R. Mariá Ferreira, 234, Centro, Itabuna - BA",

  // ---- A preencher (brief/dados-da-otica.md) ----
  /** Telefone no formato internacional, ex.: "+55 73 9xxxx-xxxx" */
  phone: null as string | null,
  /** Linhas exibidas no site, ex.: ["Seg a sex: 8h às 18h", "Sáb: 8h às 13h"] */
  hours: null as string[] | null,
  /** Para o JSON-LD, ex.: ["Mo-Fr 08:00-18:00", "Sa 08:00-13:00"] */
  openingHoursSchema: null as string[] | null,
  cnpj: null as string | null,
  legalName: null as string | null,
  payment: null as string | null,
  examInfo: null as string | null,
  offerTerms: null as string | null,
  team: [{ photo: "equipe-01", name: null as string | null, role: null as string | null }],
};

export const waLabel = "Abrir conversa com a Ótica Pop no WhatsApp";
