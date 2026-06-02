import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload } from '../lib/post-payload.js';

const form = {
  title: 'Novo Post',
  slug: 'novo-post',
  categoryName: 'Terapias e Abordagens',
  categoryColor: 'azul',
  content: '<p class="ql-align-center">Corpo</p><p><br></p>',
  excerpt: 'Resumo.',
  coverImage: 'https://img/capa.png',
  metaDescription: 'Meta.',
  seoTitle: 'Novo Post | HD360',
  ogImage: 'https://img/og.png',
  focusKeyword: 'autismo',
  tags: ['TEA', 'Família'],
  status: 'draft',
};

test('buildPayload achata o form para colunas do banco e limpa o content', () => {
  const row = buildPayload(form);
  assert.equal(row.title, 'Novo Post');
  assert.equal(row.slug, 'novo-post');
  assert.equal(row.category_name, 'Terapias e Abordagens');
  assert.equal(row.category_color, 'azul');
  assert.equal(row.content, '<p>Corpo</p>'); // normalizado
  assert.equal(row.cover_image, 'https://img/capa.png');
  assert.equal(row.meta_description, 'Meta.');
  assert.equal(row.seo_title, 'Novo Post | HD360');
  assert.equal(row.og_image, 'https://img/og.png');
  assert.equal(row.focus_keyword, 'autismo');
  assert.deepEqual(row.tags, ['TEA', 'Família']);
  assert.equal(row.status, 'draft');
  // não manda chaves camelCase nem id
  assert.equal('categoryName' in row, false);
  assert.equal('id' in row, false);
});

test('buildPayload tolera campos ausentes', () => {
  const row = buildPayload({ title: 'X', slug: 'x', categoryName: 'Histórias HD360', categoryColor: 'amarelo' });
  assert.equal(row.cover_image, '');
  assert.deepEqual(row.tags, []);
  assert.equal(row.status, 'draft'); // default seguro
  assert.equal(row.content, '');
});
