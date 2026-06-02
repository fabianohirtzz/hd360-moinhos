import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDatePtBr } from '../lib/format-date.mjs';
import { mapCategory, SITE_CATEGORIES } from '../lib/map-category.mjs';

test('formatDatePtBr formata data ISO em portugues', () => {
  assert.equal(formatDatePtBr('2026-02-04T14:09:44'), '4 de fevereiro de 2026');
  assert.equal(formatDatePtBr('2025-11-18T00:00:00'), '18 de novembro de 2025');
});

test('mapCategory mapeia categorias conhecidas do WP', () => {
  assert.deepEqual(mapCategory(['Terapias']), { name: 'Terapias e Abordagens', color: 'azul' });
  assert.deepEqual(mapCategory(['Therapies']), { name: 'Terapias e Abordagens', color: 'azul' });
  assert.deepEqual(mapCategory(['Diagnosis']), { name: 'Entendendo o Autismo', color: 'verde' });
});

test('mapCategory usa fallback para categorias desconhecidas ou vazias', () => {
  assert.deepEqual(mapCategory(['Sem categoria']), { name: 'Histórias HD360', color: 'amarelo' });
  assert.deepEqual(mapCategory([]), { name: 'Histórias HD360', color: 'amarelo' });
});

test('SITE_CATEGORIES tem as 5 categorias do site', () => {
  assert.equal(SITE_CATEGORIES.length, 5);
  assert.ok(SITE_CATEGORIES.every(c => c.name && c.color));
});
