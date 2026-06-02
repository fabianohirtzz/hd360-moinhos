import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metaState, serp } from '../lib/seo.js';

test('metaState classifica o comprimento da meta description', () => {
  assert.deepEqual(metaState(''), { count: 0, level: 'empty' });
  assert.deepEqual(metaState('curtinha'), { count: 8, level: 'short' });
  assert.equal(metaState('x'.repeat(140)).level, 'ok');
  assert.equal(metaState('x'.repeat(175)).level, 'over');
});

test('serp monta a prévia do Google com fallbacks', () => {
  const full = serp({
    title: 'O Que Esperar', slug: 'o-que-esperar',
    seoTitle: 'O Que Esperar | HD360', metaDescription: 'Resumo de SEO.', excerpt: 'Resumo do post.',
  });
  assert.equal(full.title, 'O Que Esperar | HD360');
  assert.equal(full.url, 'hd360.com.br › blog › o-que-esperar');
  assert.equal(full.desc, 'Resumo de SEO.');

  // sem seoTitle/meta: cai pro título + sufixo da marca e pro excerpt
  const fallback = serp({ title: 'Bem-vindo', slug: 'bem-vindo', excerpt: 'Texto do resumo.' });
  assert.equal(fallback.title, 'Bem-vindo | HD360');
  assert.equal(fallback.desc, 'Texto do resumo.');
});
