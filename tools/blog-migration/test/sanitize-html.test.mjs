import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeContent } from '../lib/sanitize-html.mjs';

test('remove comentarios, scripts e styles', () => {
  const out = sanitizeContent('<!-- wp:paragraph --><p>Oi</p><script>x()</script><style>a{}</style>');
  assert.equal(out, '<p>Oi</p>');
});

test('desembrulha divs e spans mantendo o conteudo', () => {
  const out = sanitizeContent('<div class="elementor"><p>Texto <span style="color:red">colorido</span></p></div>');
  assert.equal(out, '<p>Texto colorido</p>');
});

test('mantem tags semanticas permitidas', () => {
  const out = sanitizeContent('<h2>Título</h2><ul><li>Um</li><li>Dois</li></ul>');
  assert.equal(out, '<h2>Título</h2><ul><li>Um</li><li>Dois</li></ul>');
});

test('preserva href em links e remove outros atributos', () => {
  const out = sanitizeContent('<a href="https://x.com" target="_blank" rel="noopener" class="z">link</a>');
  assert.equal(out, '<a href="https://x.com">link</a>');
});

test('preserva src e alt em img, descarta o resto', () => {
  const out = sanitizeContent('<img src="https://hd360.com.br/wp-content/uploads/2026/02/foto.png" alt="Foto" class="wp-image-1" width="800">');
  assert.equal(out, '<img src="images/blog/foto.png" alt="Foto">');
});

test('remove paragrafos vazios', () => {
  const out = sanitizeContent('<p>Real</p><p>&nbsp;</p><p></p>');
  assert.equal(out, '<p>Real</p>');
});

test('converte h1 e h4 para a escala da prose (h2/h3)', () => {
  const out = sanitizeContent('<h1>A</h1><h4>B</h4>');
  assert.equal(out, '<h2>A</h2><h3>B</h3>');
});
