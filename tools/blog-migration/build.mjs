import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderBlogIndex } from './lib/render-blog-index.mjs';
import { renderPostPage } from './lib/render-post-page.mjs';

const ROOT = new URL('../../', import.meta.url);

function relatedFor(post, all) {
  return all
    .filter(p => p.slug !== post.slug && p.category.name === post.category.name)
    .slice(0, 3);
}

async function main() {
  const posts = JSON.parse(await readFile(new URL('assets/blog/posts.json', ROOT), 'utf8'));
  // Ordenar do mais novo para o mais antigo.
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 1. Injetar a grade no blog.html entre os marcadores.
  const blogPath = new URL('blog.html', ROOT);
  let blog = await readFile(blogPath, 'utf8');
  const grid = renderBlogIndex(posts);
  blog = blog.replace(
    /<!-- POSTS:START -->[\s\S]*?<!-- POSTS:END -->/,
    `<!-- POSTS:START -->\n          ${grid}\n          <!-- POSTS:END -->`,
  );
  await writeFile(blogPath, blog);
  console.log('blog.html atualizado com', posts.length, 'cards.');

  // 2. Gerar uma página por post.
  for (const post of posts) {
    const html = renderPostPage(post, relatedFor(post, posts));
    await mkdir(new URL(`${post.slug}/`, ROOT), { recursive: true });
    await writeFile(new URL(`${post.slug}/index.html`, ROOT), html);
    console.log('  ok', `${post.slug}/index.html`);
  }
  console.log('Pronto.');
}

main().catch(e => { console.error(e); process.exit(1); });
