import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderBlogIndex } from '../lib/render-blog-index.mjs';

const posts = [
  { slug: 'a', title: 'Post A', dateLabel: '4 de fevereiro de 2026',
    category: { name: 'Terapias e Abordagens', color: 'azul' },
    coverImage: 'images/blog/a.png', excerpt: 'Resumo A' },
  { slug: 'b', title: 'Post B', dateLabel: '1 de janeiro de 2026',
    category: { name: 'Entendendo o Autismo', color: 'verde' },
    coverImage: 'images/blog/b.png', excerpt: 'Resumo B' },
];

test('gera um card por post com link para /slug/', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /href="a\/"/);
  assert.match(html, /href="b\/"/);
  assert.match(html, /Post A/);
  assert.match(html, /Post B/);
});

test('cards usam caminho de imagem da raiz (sem ../)', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /src="images\/blog\/a\.png"/);
  assert.doesNotMatch(html, /\.\.\/images/);
});

test('cada card tem data-category para o filtro', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /data-category="Terapias e Abordagens"/);
  assert.match(html, /data-category="Entendendo o Autismo"/);
});

test('aplica a cor da categoria na capa', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /post__cover--azul/);
  assert.match(html, /post__cover--verde/);
});

test('post sem capa usa SVG placeholder colorido, sem img com src vazio', () => {
  const postsWithEmpty = [
    { slug: 'c', title: 'Post Sem Capa', dateLabel: '1 de marco de 2026',
      category: { name: 'Historias HD360', color: 'amarelo' },
      coverImage: '', excerpt: 'Resumo C' },
  ];
  const html = renderBlogIndex(postsWithEmpty);
  // Must contain the puzzle SVG placeholder
  assert.match(html, /<svg/);
  // Must NOT contain a broken img with empty src
  assert.doesNotMatch(html, /src=""/);
  // The colored cover class must still be present
  assert.match(html, /post__cover--amarelo/);
});
