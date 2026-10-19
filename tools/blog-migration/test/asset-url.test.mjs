import test from 'node:test';
import assert from 'node:assert/strict';
import { assetUrl } from '../lib/asset-url.mjs';
import { renderPostPage } from '../lib/render-post-page.mjs';

const SUPA = 'https://euzmbswywwhmicjlszqw.supabase.co/storage/v1/object/public/blog-images/capa.jpg';

test('assetUrl prefixa caminho relativo e mantém URL completa', () => {
  assert.equal(assetUrl('images/blog/a.png', '../'), '../images/blog/a.png');
  assert.equal(assetUrl(SUPA, '../'), SUPA);
  assert.equal(assetUrl('', '../'), '');
});

test('post com capa do Supabase não quebra a imagem nem o og:image', () => {
  const post = {
    slug: 'novo', title: 'Novo', date: '2026-10-19T10:00:00', modified: '2026-10-19T10:00:00',
    category: { name: 'Autismo', slug: 'autismo', color: 'azul' }, tags: [], content: '<p>oi</p>',
    excerpt: 'oi', coverImage: SUPA,
  };
  const html = renderPostPage(post, [], []);
  assert.ok(!html.includes('../https://'));
  assert.ok(!html.includes('hd360.com.br/https://'));
  assert.ok(html.includes(`<meta property="og:image" content="${SUPA}" />`));
});
