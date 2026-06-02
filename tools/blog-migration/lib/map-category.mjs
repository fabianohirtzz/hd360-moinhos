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

export function mapCategory(wpCategoryNames) {
  for (const raw of wpCategoryNames || []) {
    const key = String(raw).trim().toLowerCase();
    const siteName = WP_TO_SITE[key];
    if (siteName) {
      return SITE_CATEGORIES.find(c => c.name === siteName);
    }
  }
  return { ...FALLBACK };
}
