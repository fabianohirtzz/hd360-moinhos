// Estado do contador da meta description (faixa recomendada 120–160).
export function metaState(text, { min = 120, max = 160 } = {}) {
  const count = String(text ?? '').length;
  let level = 'ok';
  if (count === 0) level = 'empty';
  else if (count < min) level = 'short';
  else if (count > max) level = 'over';
  return { count, level };
}

// Prévia estilo Google (SERP), com fallbacks sensatos.
export function serp({ title = '', slug = '', seoTitle = '', metaDescription = '', excerpt = '' } = {}) {
  return {
    title: seoTitle.trim() || `${title} | HD360`,
    url: `hd360.com.br › blog › ${slug}`,
    desc: (metaDescription.trim() || excerpt.trim()).slice(0, 160),
  };
}
