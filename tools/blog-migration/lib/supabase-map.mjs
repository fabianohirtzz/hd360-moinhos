import { formatDatePtBr } from './format-date.mjs';

const pad = n => String(n).padStart(2, '0');

// O Supabase (timestamptz) devolve datas com offset (ex.: 2023-09-26T19:08:42+00:00),
// mas o site usa o formato naive UTC (sem offset) no JSON-LD. Normaliza de volta,
// reproduzindo o valor original. Tolera entradas nao-ISO devolvendo-as como vieram.
function normalizeTimestamp(value) {
  if (!value) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

// Formato interno do post (usado pelos renderizadores) -> linha da tabela `posts`.
// `dateLabel` é derivado na leitura, portanto nao vai pro banco.
export function toSupabaseRow(post, { status = 'published' } = {}) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.date,
    modified: post.modified || post.date,
    category_name: post.category.name,
    category_color: post.category.color,
    cover_image: post.coverImage || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    meta_description: post.metaDescription || '',
    seo_title: post.seoTitle || '',
    og_image: post.ogImage || '',
    focus_keyword: post.focusKeyword || '',
    tags: post.tags || [],
    status,
  };
}

// Linha da tabela `posts` -> formato interno do post (com dateLabel derivado).
export function mapSupabaseRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: normalizeTimestamp(row.date),
    modified: normalizeTimestamp(row.modified || row.date),
    dateLabel: formatDatePtBr(row.date),
    category: { name: row.category_name, color: row.category_color },
    coverImage: row.cover_image || '',
    excerpt: row.excerpt || '',
    content: row.content || '',
    metaDescription: row.meta_description || '',
    seoTitle: row.seo_title || '',
    ogImage: row.og_image || '',
    focusKeyword: row.focus_keyword || '',
    tags: row.tags || [],
    likes: row.likes || 0,
  };
}
