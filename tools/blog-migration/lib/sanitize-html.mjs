// Tags que mantemos (com atributos controlados).
const KEEP = new Set([
  'p', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i',
  'blockquote', 'img', 'br',
]);
// Tags de wrapper que removemos mantendo o conteúdo interno.
const UNWRAP = /<\/?(?:div|span|figure|figcaption|section|article|header|footer|main|table|tbody|tr|td|th|small|font)\b[^>]*>/gi;

function localImageSrc(src) {
  // Reescreve qualquer URL de imagem para o caminho local images/blog/<arquivo>.
  const file = String(src).split('?')[0].split('#')[0].split('/').pop();
  return `images/blog/${file}`;
}

export function sanitizeContent(html) {
  let s = String(html);

  // 1. Remover comentários, scripts e styles inteiros.
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 2. Normalizar headings fora da escala.
  s = s.replace(/<(\/?)h1\b[^>]*>/gi, '<$1h2>');
  s = s.replace(/<(\/?)h[4-6]\b[^>]*>/gi, '<$1h3>');

  // 3. Desembrulhar wrappers (remove a tag, mantém o conteúdo).
  s = s.replace(UNWRAP, '');

  // 4. Limpar atributos das tags que mantemos.
  s = s.replace(/<([a-z0-9]+)\b[^>]*>/gi, (full, tagRaw) => {
    const tag = tagRaw.toLowerCase();
    if (!KEEP.has(tag)) return full; // tags não tratadas tratadas no passo 6
    if (tag === 'a') {
      const href = (full.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i) || [])[0] || '';
      return href ? `<a ${href}>` : '<a>';
    }
    if (tag === 'img') {
      const srcRaw = (full.match(/src\s*=\s*"([^"]*)"/i) || [, ''])[1];
      const alt = (full.match(/alt\s*=\s*"([^"]*)"/i) || [, ''])[1];
      return `<img src="${localImageSrc(srcRaw)}" alt="${alt}">`;
    }
    return `<${tag}>`;
  });
  // Fechamentos: normalizar para minúsculo e sem atributos.
  s = s.replace(/<\/([a-z0-9]+)\b[^>]*>/gi, (full, tagRaw) => {
    const tag = tagRaw.toLowerCase();
    return KEEP.has(tag) ? `</${tag}>` : full;
  });

  // 5. Remover quaisquer tags remanescentes fora da whitelist (abre e fecha).
  s = s.replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (full, tagRaw) =>
    KEEP.has(tagRaw.toLowerCase()) ? full : '');

  // 6. Remover parágrafos/itens vazios (inclui &nbsp; e espaços).
  s = s.replace(/<p>(?:\s|&nbsp;)*<\/p>/gi, '');
  s = s.replace(/<li>(?:\s|&nbsp;)*<\/li>/gi, '');

  // 7. Colapsar espaços em branco entre tags.
  s = s.replace(/>\s+</g, '><').trim();

  return s;
}
