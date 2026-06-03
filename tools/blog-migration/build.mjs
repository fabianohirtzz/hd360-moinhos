import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { renderBlogIndex } from './lib/render-blog-index.mjs';
import { renderCarousel } from './lib/render-carousel.mjs';
import { renderPostPage } from './lib/render-post-page.mjs';
import { loadPosts } from './lib/load-posts.mjs';
import { slugsToPrune } from './lib/prune-slugs.mjs';

const ROOT = new URL('../../', import.meta.url);

function relatedFor(post, all) {
  return all
    .filter(p => p.slug !== post.slug && p.category.name === post.category.name)
    .slice(0, 3);
}
function recentFor(post, all) {
  return all.filter(p => p.slug !== post.slug).slice(0, 5);
}
async function injectBetween(path, startMarker, endMarker, inner) {
  let html = await readFile(path, 'utf8');
  const re = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  html = html.replace(re, `${startMarker}\n          ${inner}\n          ${endMarker}`);
  await writeFile(path, html);
}

async function main() {
  const posts = await loadPosts({ jsonUrl: new URL('assets/blog/posts.json', ROOT) });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 1. blog.html: injetar o carrossel.
  await injectBetween(new URL('blog.html', ROOT), '<!-- CAROUSEL:START -->', '<!-- CAROUSEL:END -->', renderCarousel(posts));
  console.log('blog.html: carrossel com', posts.length, 'slides.');

  // 2. blog-todos.html: injetar a grade completa.
  await injectBetween(new URL('blog-todos.html', ROOT), '<!-- POSTS:START -->', '<!-- POSTS:END -->', renderBlogIndex(posts));
  console.log('blog-todos.html: grade com', posts.length, 'cards.');

  // 3. Páginas de post com sidebar.
  for (const post of posts) {
    const html = renderPostPage(post, relatedFor(post, posts), recentFor(post, posts));
    await mkdir(new URL(`${post.slug}/`, ROOT), { recursive: true });
    await writeFile(new URL(`${post.slug}/index.html`, ROOT), html);
    console.log('  ok', `${post.slug}/index.html`);
  }

  // Manifesto dos slugs gerados, para apagar diretórios de posts excluídos no próximo build.
  const manifestUrl = new URL('assets/blog/generated-slugs.json', ROOT);
  const newSlugs = posts.map(p => p.slug);
  let oldSlugs = [];
  try { oldSlugs = JSON.parse(await readFile(manifestUrl, 'utf8')); } catch { /* primeiro build */ }
  for (const slug of slugsToPrune(oldSlugs, newSlugs)) {
    await rm(new URL(`${slug}/`, ROOT), { recursive: true, force: true });
    console.log('  removido', `${slug}/`);
  }
  await writeFile(manifestUrl, JSON.stringify(newSlugs, null, 2) + '\n');

  console.log('Pronto.');
}

main().catch(e => { console.error(e); process.exit(1); });
