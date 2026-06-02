import { normalizeEditorHtml } from './clean-html.js';

// Estado do formulário (camelCase) -> linha da tabela `posts` (snake_case).
// status default 'draft' (seguro: nada vai pro ar sem escolha explícita).
export function buildPayload(form = {}) {
  return {
    slug: form.slug || '',
    title: form.title || '',
    category_name: form.categoryName || '',
    category_color: form.categoryColor || '',
    cover_image: form.coverImage || '',
    excerpt: form.excerpt || '',
    content: normalizeEditorHtml(form.content || ''),
    meta_description: form.metaDescription || '',
    seo_title: form.seoTitle || '',
    og_image: form.ogImage || '',
    focus_keyword: form.focusKeyword || '',
    tags: Array.isArray(form.tags) ? form.tags : [],
    status: form.status === 'published' ? 'published' : 'draft',
  };
}
