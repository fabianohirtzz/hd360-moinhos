import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEditorHtml } from '../lib/clean-html.js';

test('remove classes ql-* mantendo a tag', () => {
  assert.equal(
    normalizeEditorHtml('<p class="ql-align-center">Oi</p>'),
    '<p>Oi</p>'
  );
  assert.equal(
    normalizeEditorHtml('<li class="ql-indent-1">item</li>'),
    '<li>item</li>'
  );
});

test('remove parágrafos vazios do Quill', () => {
  assert.equal(normalizeEditorHtml('<p>um</p><p><br></p><p>dois</p>'), '<p>um</p><p>dois</p>');
  assert.equal(normalizeEditorHtml('<p></p>'), '');
});

test('preserva conteúdo semântico real', () => {
  const html = '<h2>Título</h2><p><strong>Forte</strong> e <em>ênfase</em>.</p>'
    + '<ul><li>a</li><li>b</li></ul><blockquote>cit</blockquote>'
    + '<p><a href="https://x" rel="noopener">link</a></p><p><img src="https://img/c.png"></p>';
  assert.equal(normalizeEditorHtml(html), html);
});

test('tolera vazio', () => {
  assert.equal(normalizeEditorHtml(''), '');
  assert.equal(normalizeEditorHtml('<p><br></p>'), '');
});
