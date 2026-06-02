import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPostPage } from '../lib/render-post-page.mjs';

const post = {
  id: 1, slug: 'meu-post', title: 'Meu Post de Teste',
  date: '2026-02-04T14:09:44', modified: '2026-02-04T14:09:44',
  dateLabel: '4 de fevereiro de 2026',
  category: { name: 'Terapias e Abordagens', color: 'azul' },
  coverImage: 'images/blog/capa.png',
  excerpt: 'Resumo do post.',
  content: '<p>Parágrafo um.</p><img src="images/blog/foto.png" alt="Foto"><p>Parágrafo dois.</p>',
  metaDescription: 'Descrição para SEO do post.',
  seoTitle: 'Meu Post | HD360', ogImage: 'images/blog/capa.png',
  focusKeyword: '', tags: [],
};
const related = [
  { slug: 'outro', title: 'Outro Post', dateLabel: '1 de janeiro de 2026',
    category: { name: 'Terapias e Abordagens', color: 'azul' }, coverImage: 'images/blog/o.png' },
];

test('renderiza HTML completo com title e meta de SEO', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /<title>Meu Post \| HD360<\/title>/);
  assert.match(html, /<meta name="description" content="Descrição para SEO do post."/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hd360\.com\.br\/meu-post\/"/);
  assert.match(html, /<meta property="og:title" content="Meu Post \| HD360"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type": ?"Article"/);
});

test('usa caminhos relativos com ../ para assets e nav', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /href="\.\.\/assets\/css\/main\.css"/);
  assert.match(html, /src="\.\.\/assets\/js\/main\.js"/);
  assert.match(html, /href="\.\.\/index\.html"/);
  assert.match(html, /href="\.\.\/blog\.html"/);
});

test('reescreve imagens do corpo e da capa para ../images', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /src="\.\.\/images\/blog\/foto\.png"/);
  assert.match(html, /src="\.\.\/images\/blog\/capa\.png"/);
  assert.doesNotMatch(html, /src="images\/blog/); // nenhum caminho sem ../
});

test('inclui titulo, data, categoria e corpo', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /Meu Post de Teste/);
  assert.match(html, /4 de fevereiro de 2026/);
  assert.match(html, /Terapias e Abordagens/);
  assert.match(html, /Parágrafo um\./);
  assert.match(html, /class="prose/);
});

test('lista posts relacionados com link para ../slug/', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /href="\.\.\/outro\/"/);
  assert.match(html, /Outro Post/);
});

test('sem relacionados, nao quebra (secao omitida)', () => {
  const html = renderPostPage(post, []);
  assert.doesNotMatch(html, /Leia também/);
});

test('post relacionado sem capa usa SVG placeholder, sem src="../" vazio', () => {
  const relatedNoCover = [
    { slug: 'sem-capa', title: 'Post Sem Capa', dateLabel: '1 de março de 2026',
      category: { name: 'Histórias HD360', color: 'amarelo' }, coverImage: '' },
  ];
  const html = renderPostPage(post, relatedNoCover);
  // O card do relacionado sem capa deve conter o SVG placeholder
  assert.match(html, /<svg[^>]+viewBox="0 0 24 24"/);
  // Nao deve haver um img com src="../" (prefixo com capa vazia)
  assert.doesNotMatch(html, /src="\.\.\/"/);
  // Nao deve haver um img com src="../" (prefixo com caminho vazio = src="../")
  assert.doesNotMatch(html, /src="\.\.\/"/);
});

test('renderiza sidebar com categorias, tags e recentes', () => {
  const withTags = { ...post, tags: ['TEA', 'ABA'] };
  const recent = [
    { slug: 'r1', title: 'Recente 1', coverImage: 'images/blog/r1.png', category: { color: 'azul', name: 'Terapias e Abordagens' } },
  ];
  const html = renderPostPage(withTags, related, recent);
  assert.match(html, /class="post-layout"/);
  assert.match(html, /class="post-side"/);
  assert.match(html, /blog-todos\.html\?cat=/);
  assert.match(html, /side-tag">#TEA/);
  assert.match(html, /href="\.\.\/r1\/"/);
  assert.match(html, /Recente 1/);
});

test('omite widget de tags quando nao ha tags', () => {
  const html = renderPostPage({ ...post, tags: [] }, related, []);
  assert.doesNotMatch(html, /side-tags/);
});
