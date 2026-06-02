import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSupabaseRow } from '../lib/supabase-map.mjs';

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
