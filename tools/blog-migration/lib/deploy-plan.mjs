import { slugsToPrune } from './prune-slugs.mjs';

// Arquivos que o build do blog gera ou altera, fora as páginas dos posts.
export const BLOG_FILES = ['blog.html', 'blog-todos.html', 'sitemap.xml', 'llms.txt'];

// O que subir e o que apagar na hospedagem depois de um build. Puro.
export function deployPlan(oldSlugs, newSlugs) {
  return {
    upload: [...BLOG_FILES, ...(newSlugs || []).map((s) => `${s}/index.html`)],
    remove: slugsToPrune(oldSlugs, newSlugs),
  };
}
