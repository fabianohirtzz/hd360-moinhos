import { formatDatePtBr } from './format-date.mjs';
import { mapCategory } from './map-category.mjs';
import { sanitizeContent } from './sanitize-html.mjs';
import { tidyTitle, tidyContent } from './tidy-text.mjs';
import { cleanExcerpt } from './clean-excerpt.mjs';
import { deriveTags } from './derive-tags.mjs';

function decodeEntities(str) {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(String(html).replace(/<[^>]+>/g, '').trim());
}

function fileFromUrl(url) {
  if (!url) return '';
  return String(url).split('?')[0].split('#')[0].split('/').pop();
}

function localPath(url) {
  const f = fileFromUrl(url);
  return f ? `images/blog/${f}` : '';
}

export function transformPost(raw) {
  const emb = raw._embedded || {};
  const media = (emb['wp:featuredmedia'] || [])[0] || {};
  const terms = (emb['wp:term'] || []).flat()
    .filter(t => t && t.taxonomy === 'category')
    .map(t => t.name);

  const yoast = raw.yoast_head_json || {};
  const ogUrl = ((yoast.og_image || [])[0] || {}).url || media.source_url || '';
  const coverUrl = media.source_url || ogUrl || '';

  const content = tidyContent(sanitizeContent(raw.content && raw.content.rendered || ''));
  const titleClean = tidyTitle(decodeEntities(raw.title && raw.title.rendered || ''));
  const tags = deriveTags({ title: titleClean, content });

  // Coletar imagens a baixar: capa + todas as imagens do corpo.
  const downloads = [];
  const seen = new Set();
  const addDownload = (url) => {
    const dest = localPath(url);
    if (dest && !seen.has(dest)) { seen.add(dest); downloads.push({ url, dest }); }
  };
  addDownload(coverUrl);
  addDownload(ogUrl);
  // imagens do corpo: pegar os src originais ANTES da reescrita não é possível aqui
  // (sanitizeContent já reescreveu). Então buscamos no HTML cru:
  const rawImgUrls = [...String(raw.content && raw.content.rendered || '')
    .matchAll(/<img[^>]+src\s*=\s*"([^"]+)"/gi)].map(m => m[1]);
  rawImgUrls.forEach(addDownload);

  return {
    id: raw.id,
    slug: raw.slug,
    title: titleClean,
    date: raw.date,
    modified: raw.modified || raw.date,
    dateLabel: formatDatePtBr(raw.date),
    category: mapCategory(terms, raw.slug),
    coverImage: localPath(coverUrl),
    excerpt: cleanExcerpt(stripTags(raw.excerpt && raw.excerpt.rendered || '')),
    content,
    metaDescription: tidyContent(decodeEntities(yoast.description || '')),
    seoTitle: tidyTitle(decodeEntities(yoast.title || '')),
    ogImage: localPath(ogUrl),
    focusKeyword: '',
    tags,
    imageDownloads: downloads,
  };
}
