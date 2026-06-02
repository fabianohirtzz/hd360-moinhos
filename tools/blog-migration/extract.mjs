import { writeFile, mkdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { transformPost } from './lib/transform-post.mjs';

const API = 'https://hd360.com.br/wp-json/wp/v2/posts?per_page=100&_embed';
const ROOT = new URL('../../', import.meta.url); // raiz do projeto

async function main() {
  console.log('Buscando posts da API do WordPress...');
  const res = await fetch(API);
  if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  const rawPosts = await res.json();
  console.log(`Recebidos ${rawPosts.length} posts.`);

  const posts = rawPosts.map(transformPost);

  // Baixar todas as imagens (capa + corpo), de-duplicando por destino.
  await mkdir(new URL('images/blog/', ROOT), { recursive: true });
  const allDownloads = new Map();
  for (const p of posts) {
    for (const d of p.imageDownloads) allDownloads.set(d.dest, d.url);
  }
  console.log(`Baixando ${allDownloads.size} imagens...`);
  for (const [dest, url] of allDownloads) {
    try {
      const r = await fetch(url);
      if (!r.ok) { console.warn(`  ! ${url} -> ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      await writeFile(new URL(dest, ROOT), buf);
      console.log(`  ok ${dest}`);
    } catch (e) {
      console.warn(`  ! falha ${url}: ${e.message}`);
    }
  }

  // Gravar posts.json sem o campo auxiliar imageDownloads.
  const clean = posts.map(({ imageDownloads, ...rest }) => rest);
  await mkdir(new URL('assets/blog/', ROOT), { recursive: true });
  await writeFile(
    new URL('assets/blog/posts.json', ROOT),
    JSON.stringify(clean, null, 2) + '\n',
  );
  console.log(`Gravado assets/blog/posts.json com ${clean.length} posts.`);
}

main().catch(e => { console.error(e); process.exit(1); });
