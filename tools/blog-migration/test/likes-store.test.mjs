import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readLiked, hasLiked, addLiked } from '../../../assets/js/likes.js';

test('readLiked parseia o JSON do localStorage com tolerância', () => {
  assert.deepEqual(readLiked('["a","b"]'), ['a', 'b']);
  assert.deepEqual(readLiked(null), []);
  assert.deepEqual(readLiked('lixo'), []);
  assert.deepEqual(readLiked('{"nao":"array"}'), []);
});

test('hasLiked decide se o slug já foi curtido', () => {
  assert.equal(hasLiked('a', ['a', 'b']), true);
  assert.equal(hasLiked('z', ['a', 'b']), false);
  assert.equal(hasLiked('a', []), false);
});

test('addLiked acrescenta sem duplicar', () => {
  assert.deepEqual(addLiked('c', ['a', 'b']), ['a', 'b', 'c']);
  assert.deepEqual(addLiked('a', ['a', 'b']), ['a', 'b']);
  assert.deepEqual(addLiked('a', []), ['a']);
});
