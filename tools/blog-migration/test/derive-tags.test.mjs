import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveTags } from '../lib/derive-tags.mjs';

test('detecta TEA, ABA e Fonoaudiologia pelo texto', () => {
  const tags = deriveTags({ title: 'Fonoaudiologia no autismo', content: '<p>A terapia ABA ajuda no TEA.</p>' });
  assert.ok(tags.includes('TEA'));
  assert.ok(tags.includes('ABA'));
  assert.ok(tags.includes('Fonoaudiologia'));
});

test('retorna no maximo 5 tags', () => {
  const tags = deriveTags({ title: 'TEA ABA fonoaudiologia terapia ocupacional diagnostico familia escola comunicacao', content: '' });
  assert.ok(tags.length <= 5);
});

test('sem palavras-chave retorna array vazio', () => {
  assert.deepEqual(deriveTags({ title: 'xyz', content: '<p>abc</p>' }), []);
});

test('nao duplica tag mesmo se aparecer varias vezes', () => {
  const tags = deriveTags({ title: 'TEA TEA TEA', content: 'TEA' });
  assert.equal(tags.filter(t => t === 'TEA').length, 1);
});
