// As 5 categorias exibidas no site, cada uma com sua cor da marca.
export const SITE_CATEGORIES = [
  { name: 'Entendendo o Autismo', color: 'verde' },
  { name: 'Terapias e Abordagens', color: 'azul' },
  { name: 'Dia a Dia da Família', color: 'rosa' },
  { name: 'Dicas dos Especialistas', color: 'lilas' },
  { name: 'Histórias HD360', color: 'amarelo' },
];

const FALLBACK = { name: 'Histórias HD360', color: 'amarelo' };

// Nomes de categoria do WP (pt e en) -> categoria do site.
const WP_TO_SITE = {
  'terapias': 'Terapias e Abordagens',
  'therapies': 'Terapias e Abordagens',
  'diagnóstico': 'Entendendo o Autismo',
  'diagnostico': 'Entendendo o Autismo',
  'diagnosis': 'Entendendo o Autismo',
};

// Overrides por slug para posts que ficam em "Sem categoria" no WP
// mas têm categoria clara pelo conteúdo.
const SLUG_TO_SITE = {
  // Terapias e Abordagens
  'fonoaudiologia-no-autismo-em-porto-alegre': 'Terapias e Abordagens',
  'terapia-ocupacional-em-porto-alegre': 'Terapias e Abordagens',
  'ciencia-aba-em-porto-alegre': 'Terapias e Abordagens',
  'terapia-aba-mitos-e-verdades': 'Terapias e Abordagens',
  'abordagem-individual-no-autismo-em-porto-alegre': 'Terapias e Abordagens',
  'ciencia-aba-qual-o-papel-dos-pais-no-tratamento-comportamental': 'Terapias e Abordagens',
  'beneficios-da-ciencia-aba-transformando-vidas-e-promovendo-o-desenvolvimento': 'Terapias e Abordagens',
  'ciencia-aba-em-porto-alegre-entenda-como-essa-abordagem-pode-ajudar-criancas-com-autismo': 'Terapias e Abordagens',
  // Entendendo o Autismo
  'diagnostico-precoce-tea': 'Entendendo o Autismo',
  'alfabetizacao-tardia': 'Entendendo o Autismo',
  // Dia a Dia da Família
  'o-papel-da-familia-na-evolucao-da-crianca-com-tea': 'Dia a Dia da Família',
  'desfralde': 'Dia a Dia da Família',
  'disturbios-alimentares-pediatricos': 'Dia a Dia da Família',
  // Dicas dos Especialistas
  'neurologista-infantil-em-porto-alegre': 'Dicas dos Especialistas',
  'como-escolher-uma-clinica-para-autismo-em-porto-alegre': 'Dicas dos Especialistas',
  // Histórias HD360
  'referencia-em-tea-em-porto-alegre': 'Histórias HD360',
  'conheca-a-hd-360-moinhos-e-nosso-compromisso-autismo': 'Histórias HD360',
};

export function mapCategory(wpCategoryNames, slug) {
  // Slug-based override takes priority (for posts with no meaningful WP category).
  if (slug && SLUG_TO_SITE[slug]) {
    return SITE_CATEGORIES.find(c => c.name === SLUG_TO_SITE[slug]);
  }
  for (const raw of wpCategoryNames || []) {
    const key = String(raw).trim().toLowerCase();
    const siteName = WP_TO_SITE[key];
    if (siteName) {
      return SITE_CATEGORIES.find(c => c.name === siteName);
    }
  }
  return { ...FALLBACK };
}
