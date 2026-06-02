function decodeEntities(str) {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&hellip;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function cleanExcerpt(raw) {
  let s = decodeEntities(String(raw));
  // Remover o marcador "mais" do WP: [...], […], [&hellip;] já virou [...]
  s = s.replace(/\[\s*(?:\.\.\.|…)\s*\]/g, ' ');
  // Remover blocos de CTA em caixa alta (3+ palavras maiúsculas seguidas, incluindo de 1 char como "E")
  s = s.replace(/\b([A-ZÀ-Ú]{1,}\s+){2,}[A-ZÀ-Ú]{1,}\b/g, ' ');
  // Colapsar espaços e aparar
  s = s.replace(/\s+/g, ' ').trim();
  // Cortar em ~200 sem quebrar palavra
  if (s.length > 200) {
    let cut = s.slice(0, 200);
    cut = cut.slice(0, cut.lastIndexOf(' '));
    s = cut.trim().replace(/[.,;:]$/, '') + '...';
  }
  return s;
}
