import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugsToPrune } from '../lib/prune-slugs.mjs';

test('slugsToPrune devolve os slugs que sumiram do conjunto novo', () => {
  assert.deepEqual(
    slugsToPrune(['a', 'b', 'c'], ['a', 'c']).sort(),
    ['b']
  );
});

test('slugsToPrune ignora novos e não duplica', () => {
  assert.deepEqual(slugsToPrune(['a'], ['a', 'b', 'c']), []);
  assert.deepEqual(slugsToPrune([], ['a']), []);
});

test('slugsToPrune tolera entradas ausentes', () => {
  assert.deepEqual(slugsToPrune(undefined, ['a']), []);
  assert.deepEqual(slugsToPrune(['x'], undefined).sort(), ['x']);
});
