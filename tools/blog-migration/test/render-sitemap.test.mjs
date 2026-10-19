import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSitemap, STATIC_PAGES } from '../lib/render-sitemap.mjs';

const posts = [
  { slug: 'desfralde', date: '2025-01-02T10:00:00', modified: '2025-03-04T11:00:00' },
  { slug: 'alfabetizacao-tardia', date: '2024-05-06T09:00:00' },
];

test('renderSitemap lista home, páginas fixas e um url por post', () => {
  const xml = renderSitemap(posts);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<loc>https:\/\/hd360\.com\.br\/<\/loc>/);
  assert.equal((xml.match(/<url>/g) || []).length, STATIC_PAGES.length + posts.length);
  assert.match(xml, /<loc>https:\/\/hd360\.com\.br\/desfralde\/<\/loc>/);
});

test('renderSitemap usa a data de edição do post, ou a de publicação', () => {
  const xml = renderSitemap(posts);
  assert.match(xml, /desfralde\/<\/loc>\n    <lastmod>2025-03-04<\/lastmod>/);
  assert.match(xml, /alfabetizacao-tardia\/<\/loc>\n    <lastmod>2024-05-06<\/lastmod>/);
});
