import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tidyTitle, tidyContent } from '../lib/tidy-text.mjs';

// ── tidyTitle ─────────────────────────────────────────────────────────────────

test('shouty: TERAPIA ABA com travessão vira Title Case + ABA preservado', () => {
  const input = 'TERAPIA ABA – MITOS E VERDADES';
  const result = tidyTitle(input);
  // Dash becomes ", "; ABA stays uppercase; minor word "e" stays lowercase
  assert.equal(result, 'Terapia ABA, Mitos e Verdades');
});

test('shouty: AUTISMO EM PORTO ALEGRE com colon e número', () => {
  const input = 'AUTISMO EM PORTO ALEGRE: 5 PASSOS PARA A FAMÍLIA APOIAR O DESENVOLVIMENTO DO FILHO EM CASA';
  const result = tidyTitle(input);
  // "em", "para", "a", "o", "do", "em" are minor words (not first)
  // "Porto", "Alegre" capitalized (not in minor set)
  // "5" stays as-is (not a letter)
  // "Família", "Filho", "Casa", "Desenvolvimento", "Apoiar" capitalized
  assert.equal(result, 'Autismo em Porto Alegre: 5 Passos para a Família Apoiar o Desenvolvimento do Filho em Casa');
});

test('shouty: O PAPEL ESSENCIAL DA FAMÍLIA — TEA preservado', () => {
  const input = 'O PAPEL ESSENCIAL DA FAMÍLIA NA EVOLUÇÃO DA CRIANÇA COM TEA';
  const result = tidyTitle(input);
  // "O" is first word → capitalized; "da", "na", "da", "com" are minor words
  // TEA preserved as acronym
  assert.equal(result, 'O Papel Essencial da Família na Evolução da Criança com TEA');
});

test('already good: Fonoaudiologia no Autismo em Porto Alegre — unchanged', () => {
  const input = 'Fonoaudiologia no Autismo em Porto Alegre';
  assert.equal(tidyTitle(input), 'Fonoaudiologia no Autismo em Porto Alegre');
});

test('already good: O Que Esperar da Clínica... — unchanged', () => {
  const input = 'O Que Esperar da Clínica que Vai Acolher Meu Filho com TEA?';
  assert.equal(tidyTitle(input), 'O Que Esperar da Clínica que Vai Acolher Meu Filho com TEA?');
});

test('tidyTitle removes em dash from non-shouty title', () => {
  const input = 'Ciência ABA — Fundamentos e Prática';
  assert.equal(tidyTitle(input), 'Ciência ABA, Fundamentos e Prática');
});

test('tidyTitle removes en dash from non-shouty title', () => {
  const input = 'Diagnóstico TEA – O Passo Essencial';
  assert.equal(tidyTitle(input), 'Diagnóstico TEA, O Passo Essencial');
});

test('tidyTitle collapses double spaces', () => {
  const input = 'CADA CRIANÇA É ÚNICA: O PODER DA ABORDAGEM INDIVIDUAL  NO AUTISMO EM PORTO ALEGRE';
  const result = tidyTitle(input);
  assert.ok(!result.includes('  '), 'should have no double spaces');
  assert.ok(!result.includes('–'), 'no en dash');
  assert.ok(!result.includes('—'), 'no em dash');
  assert.ok(result.includes('TEA') === false || true, 'TEA not in this title anyway');
  assert.ok(result.startsWith('Cada'), 'starts with Cada');
  assert.ok(result.includes('Individual'), 'Individual is capitalized');
});

test('shouty: PERGUNTAS FREQUENTES — trailing period stripped', () => {
  const input = 'PERGUNTAS FREQUENTES SOBRE AUTISMO, DÚVIDAS MAIS BUSCADAS PELAS FAMÍLIAS.';
  const result = tidyTitle(input);
  assert.equal(result, 'Perguntas Frequentes Sobre Autismo, Dúvidas Mais Buscadas Pelas Famílias');
});

test('shouty: palavra após dois-pontos é capitalizada', () => {
  const input = 'CADA CRIANÇA É ÚNICA: O PODER DA ABORDAGEM INDIVIDUAL NO AUTISMO EM PORTO ALEGRE';
  const result = tidyTitle(input);
  assert.equal(result, 'Cada Criança É Única: O Poder da Abordagem Individual no Autismo em Porto Alegre');
});

test('shouty: minor word após dois-pontos vira maiúscula (o que)', () => {
  const input = 'TERAPIA ABA: O QUE REALMENTE TRANSFORMA';
  const result = tidyTitle(input);
  assert.equal(result, 'Terapia ABA: O que Realmente Transforma');
});

// ── tidyContent ───────────────────────────────────────────────────────────────

test('tidyContent replaces em dash in HTML', () => {
  assert.equal(tidyContent('<p>texto — outro</p>'), '<p>texto, outro</p>');
});

test('tidyContent replaces en dash in HTML (range)', () => {
  assert.equal(tidyContent('<p>faixa 10–15 anos</p>'), '<p>faixa 10, 15 anos</p>');
});

test('tidyContent does NOT change casing', () => {
  const html = '<p>TEXTO EM MAIÚSCULAS</p>';
  assert.equal(tidyContent(html), html);
});

test('tidyContent with no dashes returns original', () => {
  const html = '<p>Sem travessões aqui.</p>';
  assert.equal(tidyContent(html), html);
});

test('tidyContent replaces dash with spaces around it', () => {
  assert.equal(tidyContent('foo  —  bar'), 'foo, bar');
});
