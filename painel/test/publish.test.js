import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishUiState } from '../lib/publish.js';

test('publicando: rótulo ocupado, botão travado, sem flag', () => {
  assert.deepEqual(publishUiState({ dirty: true, publishing: true }), {
    flagVisible: false, btnLabel: 'Publicando…', btnDisabled: true,
  });
});

test('com mudanças não publicadas: flag visível, botão ativo', () => {
  assert.deepEqual(publishUiState({ dirty: true, publishing: false }), {
    flagVisible: true, btnLabel: 'Atualizar site', btnDisabled: false,
  });
});

test('site em dia: sem flag, botão ativo (permite rebuild manual)', () => {
  assert.deepEqual(publishUiState({ dirty: false, publishing: false }), {
    flagVisible: false, btnLabel: 'Atualizar site', btnDisabled: false,
  });
});
