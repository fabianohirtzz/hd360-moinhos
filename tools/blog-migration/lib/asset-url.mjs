// Caminho de imagem do post para usar no HTML. Capas migradas do WordPress são
// relativas (images/blog/...) e levam o prefixo da página; as enviadas pelo painel
// já vêm com a URL pública completa do Supabase Storage e ficam como estão.
export function assetUrl(src, prefix = '') {
  if (!src) return '';
  return /^https?:\/\//i.test(src) ? src : `${prefix}${src}`;
}
