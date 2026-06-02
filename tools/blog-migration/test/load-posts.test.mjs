import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fromJson, fromSupabase, loadPosts } from '../lib/load-posts.mjs';

const sampleRow = {
  id: 1, slug: 'post-a', title: 'Post A',
  date: '2026-02-04T14:09:44', modified: '2026-02-04T14:09:44',
  category_name: 'Terapias e Abordagens', category_color: 'azul',
  cover_image: '', excerpt: '', content: '<p>a</p>',
  meta_description: '', seo_title: '', og_image: '', focus_keyword: '',
  tags: ['TEA'], likes: 3, status: 'published',
};

test('fromJson le e devolve o array do arquivo', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'lp-'));
  const file = join(dir, 'posts.json');
  await writeFile(file, JSON.stringify([{ slug: 'x', title: 'X' }]));
  const posts = await fromJson(file);
  assert.equal(posts[0].slug, 'x');
  await rm(dir, { recursive: true, force: true });
});

test('fromSupabase consulta so publicados e mapeia as linhas', async () => {
  let calledUrl = '';
  const fakeFetch = async (url, opts) => {
    calledUrl = url;
    assert.equal(opts.headers.apikey, 'svc');
    return { ok: true, json: async () => [sampleRow] };
  };
  const posts = await fromSupabase({ url: 'https://x.supabase.co', serviceKey: 'svc', fetchImpl: fakeFetch });
  assert.match(calledUrl, /status=eq\.published/);
  assert.equal(posts[0].slug, 'post-a');
  assert.deepEqual(posts[0].category, { name: 'Terapias e Abordagens', color: 'azul' });
  assert.equal(posts[0].dateLabel, '4 de fevereiro de 2026'); // ja mapeado
});

test('fromSupabase lanca erro em resposta nao-ok', async () => {
  const fakeFetch = async () => ({ ok: false, status: 401, text: async () => 'no' });
  await assert.rejects(() => fromSupabase({ url: 'u', serviceKey: 'k', fetchImpl: fakeFetch }), /401/);
});

test('loadPosts usa Supabase quando ha env vars, senao o JSON', async () => {
  const fakeFetch = async () => ({ ok: true, json: async () => [sampleRow] });
  const viaSb = await loadPosts({ env: { SUPABASE_URL: 'u', SUPABASE_SERVICE_KEY: 'svc' }, fetchImpl: fakeFetch });
  assert.equal(viaSb[0].slug, 'post-a');

  const dir = await mkdtemp(join(tmpdir(), 'lp-'));
  const file = join(dir, 'posts.json');
  await writeFile(file, JSON.stringify([{ slug: 'json-fallback' }]));
  const viaJson = await loadPosts({ env: {}, jsonUrl: file });
  assert.equal(viaJson[0].slug, 'json-fallback');
  await rm(dir, { recursive: true, force: true });
});
