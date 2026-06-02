import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../lib/slug.js';

test('slugify normaliza título pt-BR para slug de URL', () => {
  assert.equal(slugify('O Que Esperar da Clínica?'), 'o-que-esperar-da-clinica');
  assert.equal(slugify('Educação, Família & Autismo'), 'educacao-familia-autismo');
  assert.equal(slugify('  Espaços   múltiplos  '), 'espacos-multiplos');
  assert.equal(slugify('Histórias HD360'), 'historias-hd360');
});

test('slugify lida com vazio e só-símbolos', () => {
  assert.equal(slugify(''), '');
  assert.equal(slugify('—  —'), '');
  assert.equal(slugify(undefined), '');
});
