import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSupabaseRow, mapSupabaseRow } from '../lib/supabase-map.mjs';

const internalPost = {
  id: 1068,
  slug: 'o-que-esperar-da-clinica',
  title: 'O Que Esperar da Clínica?',
  date: '2026-02-04T14:09:44',
  modified: '2026-02-05T10:00:00',
  dateLabel: '4 de fevereiro de 2026',
  category: { name: 'Terapias e Abordagens', color: 'azul' },
  coverImage: 'images/blog/capa.png',
  excerpt: 'Resumo curto.',
  content: '<p>Corpo</p>',
  metaDescription: 'Meta.',
  seoTitle: 'O Que Esperar | HD360',
  ogImage: 'images/blog/capa.png',
  focusKeyword: 'clínica autismo',
  tags: ['TEA', 'Família'],
};

test('toSupabaseRow achata o formato interno para colunas do banco', () => {
  const row = toSupabaseRow(internalPost);
  assert.equal(row.slug, 'o-que-esperar-da-clinica');
  assert.equal(row.category_name, 'Terapias e Abordagens');
  assert.equal(row.category_color, 'azul');
  assert.equal(row.cover_image, 'images/blog/capa.png');
  assert.equal(row.meta_description, 'Meta.');
  assert.equal(row.seo_title, 'O Que Esperar | HD360');
  assert.equal(row.og_image, 'images/blog/capa.png');
  assert.equal(row.focus_keyword, 'clínica autismo');
  assert.deepEqual(row.tags, ['TEA', 'Família']);
  assert.equal(row.status, 'published'); // padrão do seed
  // dateLabel NAO é coluna (é derivado na leitura)
  assert.equal('dateLabel' in row, false);
  assert.equal('category' in row, false);
});

test('toSupabaseRow aceita status explícito e tolera campos ausentes', () => {
  const row = toSupabaseRow({ ...internalPost, coverImage: undefined, tags: undefined }, { status: 'draft' });
  assert.equal(row.status, 'draft');
  assert.equal(row.cover_image, '');
  assert.deepEqual(row.tags, []);
});

const dbRow = {
  id: 1068,
  slug: 'o-que-esperar-da-clinica',
  title: 'O Que Esperar da Clínica?',
  date: '2026-02-04T14:09:44',
  modified: '2026-02-05T10:00:00',
  category_name: 'Terapias e Abordagens',
  category_color: 'azul',
  cover_image: 'images/blog/capa.png',
  excerpt: 'Resumo curto.',
  content: '<p>Corpo</p>',
  meta_description: 'Meta.',
  seo_title: 'O Que Esperar | HD360',
  og_image: 'images/blog/capa.png',
  focus_keyword: 'clínica autismo',
  tags: ['TEA', 'Família'],
  likes: 7,
  status: 'published',
};

test('mapSupabaseRow reconstrói o formato interno e deriva dateLabel', () => {
  const p = mapSupabaseRow(dbRow);
  assert.equal(p.slug, 'o-que-esperar-da-clinica');
  assert.deepEqual(p.category, { name: 'Terapias e Abordagens', color: 'azul' });
  assert.equal(p.coverImage, 'images/blog/capa.png');
  assert.equal(p.metaDescription, 'Meta.');
  assert.equal(p.seoTitle, 'O Que Esperar | HD360');
  assert.equal(p.ogImage, 'images/blog/capa.png');
  assert.equal(p.focusKeyword, 'clínica autismo');
  assert.deepEqual(p.tags, ['TEA', 'Família']);
  assert.equal(p.dateLabel, '4 de fevereiro de 2026'); // derivado
  assert.equal(p.likes, 7);
});

test('roundtrip toSupabaseRow -> mapSupabaseRow preserva os campos do renderizador', () => {
  const p = mapSupabaseRow({ ...toSupabaseRow(internalPost), likes: 0 });
  assert.equal(p.title, internalPost.title);
  assert.deepEqual(p.category, internalPost.category);
  assert.equal(p.content, internalPost.content);
  assert.deepEqual(p.tags, internalPost.tags);
});
