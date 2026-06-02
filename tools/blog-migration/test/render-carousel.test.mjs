import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCarousel } from '../lib/render-carousel.mjs';

const posts = [
  { slug: 'a', title: 'Post A', dateLabel: '4 de fevereiro de 2026',
    category: { name: 'Terapias e Abordagens', color: 'azul' },
    coverImage: 'images/blog/a.png', excerpt: 'Resumo A' },
  { slug: 'b', title: 'Post B', dateLabel: '1 de janeiro de 2026',
    category: { name: 'Histórias HD360', color: 'amarelo' },
    coverImage: '', excerpt: 'Resumo B' },
];

test('gera um slide por post com link para /slug/', () => {
  const html = renderCarousel(posts);
  assert.match(html, /href="a\/"/);
  assert.match(html, /href="b\/"/);
});

test('usa bolinha da cor da categoria no lugar do icone', () => {
  const html = renderCarousel(posts);
  assert.match(html, /showcase__dot showcase__dot--azul/);
  assert.match(html, /showcase__dot showcase__dot--amarelo/);
  assert.match(html, /Terapias e Abordagens/);
});

test('post sem capa usa placeholder svg, nunca src vazio', () => {
  const html = renderCarousel(posts);
  assert.doesNotMatch(html, /src=""/);
  assert.match(html, /<svg/);
});

test('cada slide tem o botao de seta', () => {
  const html = renderCarousel(posts);
  assert.match(html, /showcase__arrow/);
});
