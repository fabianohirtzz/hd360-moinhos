import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformPost } from '../lib/transform-post.mjs';

const raw = {
  id: 1068,
  slug: 'o-que-esperar-da-clinica',
  date: '2026-02-04T14:09:44',
  modified: '2026-02-05T10:00:00',
  title: { rendered: 'O Que Esperar da Cl&#237;nica?' },
  content: { rendered: '<div><p>Texto do corpo</p><img src="https://hd360.com.br/wp-content/uploads/2026/02/foto.png" alt="x"></div>' },
  excerpt: { rendered: '<p>Resumo curto do post.</p>' },
  yoast_head_json: {
    title: 'O Que Esperar | HD360',
    description: 'Meta descrição vinda do Yoast.',
    og_image: [{ url: 'https://hd360.com.br/wp-content/uploads/2026/02/capa.png' }],
  },
  _embedded: {
    'wp:featuredmedia': [{ source_url: 'https://hd360.com.br/wp-content/uploads/2026/02/capa.png' }],
    'wp:term': [[{ taxonomy: 'category', name: 'Terapias' }]],
  },
};

test('transformPost normaliza um post completo', () => {
  const p = transformPost(raw);
  assert.equal(p.id, 1068);
  assert.equal(p.slug, 'o-que-esperar-da-clinica');
  assert.equal(p.title, 'O Que Esperar da Clínica?'); // entidades decodificadas
  assert.equal(p.date, '2026-02-04T14:09:44');
  assert.equal(p.dateLabel, '4 de fevereiro de 2026');
  assert.deepEqual(p.category, { name: 'Terapias e Abordagens', color: 'azul' });
  assert.equal(p.coverImage, 'images/blog/capa.png');
  assert.equal(p.excerpt, 'Resumo curto do post.');
  assert.equal(p.content, '<p>Texto do corpo</p><img src="images/blog/foto.png" alt="x">');
  assert.equal(p.metaDescription, 'Meta descrição vinda do Yoast.');
  assert.equal(p.seoTitle, 'O Que Esperar | HD360');
  assert.equal(p.ogImage, 'images/blog/capa.png');
  assert.equal(p.focusKeyword, '');
  assert.deepEqual(p.tags, []);
  // imageDownloads lista pares {url, dest} para o extractor baixar
  assert.ok(p.imageDownloads.some(d => d.dest === 'images/blog/capa.png'));
  assert.ok(p.imageDownloads.some(d => d.dest === 'images/blog/foto.png'));
});
