import { formatDatePtBr } from './format-date.mjs';

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
    date: row.date,
    modified: row.modified || row.date,
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
