import test from 'node:test';
import assert from 'node:assert/strict';
import { deployPlan, BLOG_FILES } from '../lib/deploy-plan.mjs';

test('deployPlan sobe as páginas do blog e um index.html por post', () => {
  const { upload } = deployPlan(['a'], ['a', 'b']);
  assert.deepEqual(upload, [...BLOG_FILES, 'a/index.html', 'b/index.html']);
});

test('deployPlan apaga só os posts que saíram', () => {
  assert.deepEqual(deployPlan(['a', 'b', 'c'], ['a', 'c']).remove, ['b']);
  assert.deepEqual(deployPlan(null, ['a']).remove, []);
});
