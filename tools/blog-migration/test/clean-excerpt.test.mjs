import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanExcerpt } from '../lib/clean-excerpt.mjs';

test('remove marcador [...] e [&hellip;] do fim', () => {
  assert.equal(cleanExcerpt('Um resumo qualquer [&hellip;]'), 'Um resumo qualquer');
  assert.equal(cleanExcerpt('Outro resumo […]'), 'Outro resumo');
});

test('remove CTA colado em caixa alta', () => {
  const input = 'Onde meu filho será bem cuidado? CLIQUE AQUI E SAIBA MAIS Buscar atendimento é importante.';
  assert.equal(cleanExcerpt(input), 'Onde meu filho será bem cuidado? Buscar atendimento é importante.');
});

test('decodifica entidades e colapsa espacos', () => {
  assert.equal(cleanExcerpt('Texto &amp; mais   espaco'), 'Texto & mais espaco');
});

test('corta em ~200 caracteres sem quebrar palavra e adiciona reticencias', () => {
  const long = 'palavra '.repeat(60).trim(); // ~420 chars
  const out = cleanExcerpt(long);
  assert.ok(out.length <= 203, 'limite ~200');
  assert.ok(out.endsWith('...'), 'termina com reticencias');
  assert.ok(!out.includes('palavr...'), 'nao corta no meio da palavra');
});

test('string vazia retorna vazio', () => {
  assert.equal(cleanExcerpt(''), '');
});
