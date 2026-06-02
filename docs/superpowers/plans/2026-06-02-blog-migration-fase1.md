# Migração do Blog HD360 (Fase 1) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trazer os 23 posts do WordPress da HD360 para o site estático, gerando `blog.html` real e uma página HTML por post em `/<slug>/`, com SEO preservado.

**Architecture:** Tooling Node sem dependências (só APIs nativas: `fetch`, `node:fs`, `node:test`) na pasta `tools/blog-migration/`. Funções puras (sanitizar HTML, mapear categoria, transformar post, renderizar páginas) com testes via `node:test`; scripts de I/O (`extract.mjs`, `build.mjs`) que orquestram fetch, download de imagens e escrita de arquivos. O conteúdo migrado vira `assets/blog/posts.json` (fonte de verdade da Fase 1) e os HTMLs são gerados a partir dele.

**Tech Stack:** Node 24 (fetch nativo, `node:test`, `node:assert`), HTML/CSS estático do projeto HD360. Zero dependências npm (o `.gitignore` ignora `package.json` de propósito).

**Convenções do projeto:**
- Páginas de post vivem em `/<slug>/index.html` (um nível abaixo da raiz) → todos os caminhos de assets/nav usam prefixo `../`.
- `blog.html` fica na raiz → caminhos sem prefixo.
- Copy da marca: **sem travessões (em dashes)**. Use vírgulas.
- Sempre commit + push para `main` ao final de cada tarefa.

---

## Estrutura de arquivos

**Tooling (versionado, sem deps):**
- `tools/blog-migration/lib/format-date.mjs` — data ISO → "4 de fevereiro de 2026"
- `tools/blog-migration/lib/map-category.mjs` — categoria WP → categoria do site + cor
- `tools/blog-migration/lib/sanitize-html.mjs` — HTML do WP → HTML semântico com classes prose
- `tools/blog-migration/lib/transform-post.mjs` — post cru da API → registro normalizado
- `tools/blog-migration/lib/render-blog-index.mjs` — posts[] → fragmento HTML da grade de cards
- `tools/blog-migration/lib/render-post-page.mjs` — post + relacionados → HTML completo da página do post
- `tools/blog-migration/extract.mjs` — I/O: busca API, baixa imagens, grava `posts.json`
- `tools/blog-migration/build.mjs` — I/O: lê `posts.json`, injeta em `blog.html`, grava páginas dos posts
- `tools/blog-migration/serve.mjs` — servidor estático mínimo para verificação local
- `tools/blog-migration/test/*.test.mjs` — testes das funções puras

**Saídas (versionadas):**
- `assets/blog/posts.json`
- `images/blog/*` (capas e imagens do corpo)
- `blog.html` (regenerado, grade real)
- `<slug>/index.html` × 23
- `assets/css/main.css` (acréscimos: imagem no card, cabeçalho do post, relacionados, filtro)
- `assets/js/main.js` (acréscimo: filtro por categoria)

---

## Task 1: Helpers puros (data e categoria)

**Files:**
- Create: `tools/blog-migration/lib/format-date.mjs`
- Create: `tools/blog-migration/lib/map-category.mjs`
- Test: `tools/blog-migration/test/helpers.test.mjs`

- [ ] **Step 1: Escrever os testes que falham**

Create `tools/blog-migration/test/helpers.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDatePtBr } from '../lib/format-date.mjs';
import { mapCategory, SITE_CATEGORIES } from '../lib/map-category.mjs';

test('formatDatePtBr formata data ISO em portugues', () => {
  assert.equal(formatDatePtBr('2026-02-04T14:09:44'), '4 de fevereiro de 2026');
  assert.equal(formatDatePtBr('2025-11-18T00:00:00'), '18 de novembro de 2025');
});

test('mapCategory mapeia categorias conhecidas do WP', () => {
  assert.deepEqual(mapCategory(['Terapias']), { name: 'Terapias e Abordagens', color: 'azul' });
  assert.deepEqual(mapCategory(['Therapies']), { name: 'Terapias e Abordagens', color: 'azul' });
  assert.deepEqual(mapCategory(['Diagnosis']), { name: 'Entendendo o Autismo', color: 'verde' });
});

test('mapCategory usa fallback para categorias desconhecidas ou vazias', () => {
  assert.deepEqual(mapCategory(['Sem categoria']), { name: 'Histórias HD360', color: 'amarelo' });
  assert.deepEqual(mapCategory([]), { name: 'Histórias HD360', color: 'amarelo' });
});

test('SITE_CATEGORIES tem as 5 categorias do site', () => {
  assert.equal(SITE_CATEGORIES.length, 5);
  assert.ok(SITE_CATEGORIES.every(c => c.name && c.color));
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/helpers.test.mjs`
Expected: FAIL (Cannot find module '../lib/format-date.mjs')

- [ ] **Step 3: Implementar `format-date.mjs`**

```js
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export function formatDatePtBr(iso) {
  const d = new Date(iso);
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}
```

- [ ] **Step 4: Implementar `map-category.mjs`**

```js
// As 5 categorias exibidas no site, cada uma com sua cor da marca.
export const SITE_CATEGORIES = [
  { name: 'Entendendo o Autismo', color: 'verde' },
  { name: 'Terapias e Abordagens', color: 'azul' },
  { name: 'Dia a Dia da Família', color: 'rosa' },
  { name: 'Dicas dos Especialistas', color: 'lilas' },
  { name: 'Histórias HD360', color: 'amarelo' },
];

const FALLBACK = { name: 'Histórias HD360', color: 'amarelo' };

// Nomes de categoria do WP (pt e en) -> categoria do site.
const WP_TO_SITE = {
  'terapias': 'Terapias e Abordagens',
  'therapies': 'Terapias e Abordagens',
  'diagnóstico': 'Entendendo o Autismo',
  'diagnostico': 'Entendendo o Autismo',
  'diagnosis': 'Entendendo o Autismo',
};

export function mapCategory(wpCategoryNames) {
  for (const raw of wpCategoryNames || []) {
    const key = String(raw).trim().toLowerCase();
    const siteName = WP_TO_SITE[key];
    if (siteName) {
      return SITE_CATEGORIES.find(c => c.name === siteName);
    }
  }
  return { ...FALLBACK };
}
```

- [ ] **Step 5: Rodar até passar**

Run: `node --test tools/blog-migration/test/helpers.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit + push**

```bash
git add tools/blog-migration/lib/format-date.mjs tools/blog-migration/lib/map-category.mjs tools/blog-migration/test/helpers.test.mjs
git commit -m "feat(blog-tools): helpers de data e mapeamento de categoria"
git push origin main
```

---

## Task 2: Sanitizador de HTML

**Files:**
- Create: `tools/blog-migration/lib/sanitize-html.mjs`
- Test: `tools/blog-migration/test/sanitize-html.test.mjs`

Objetivo: receber o HTML cru do `content.rendered` do WP e devolver HTML semântico só com tags permitidas e atributos mínimos, pronto para a classe `.prose`. Também reescreve `src` de imagens que apontam para `images/blog/` (a reescrita de `../` para a página do post acontece no renderizador, Task 5).

- [ ] **Step 1: Escrever os testes que falham**

Create `tools/blog-migration/test/sanitize-html.test.mjs`:

```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/sanitize-html.test.mjs`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implementar `sanitize-html.mjs`**

```js
// Tags que mantemos (com atributos controlados).
const KEEP = new Set([
  'p', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i',
  'blockquote', 'img', 'br',
]);
// Tags de wrapper que removemos mantendo o conteúdo interno.
const UNWRAP = /<\/?(?:div|span|figure|figcaption|section|article|header|footer|main|table|tbody|tr|td|th|small|font)\b[^>]*>/gi;

function localImageSrc(src) {
  // Reescreve qualquer URL de imagem para o caminho local images/blog/<arquivo>.
  const file = String(src).split('?')[0].split('#')[0].split('/').pop();
  return `images/blog/${file}`;
}

export function sanitizeContent(html) {
  let s = String(html);

  // 1. Remover comentários, scripts e styles inteiros.
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 2. Normalizar headings fora da escala.
  s = s.replace(/<(\/?)h1\b[^>]*>/gi, '<$1h2>');
  s = s.replace(/<(\/?)h[4-6]\b[^>]*>/gi, '<$1h3>');

  // 3. Desembrulhar wrappers (remove a tag, mantém o conteúdo).
  s = s.replace(UNWRAP, '');

  // 4. Limpar atributos das tags que mantemos.
  s = s.replace(/<([a-z0-9]+)\b[^>]*>/gi, (full, tagRaw) => {
    const tag = tagRaw.toLowerCase();
    if (!KEEP.has(tag)) return full; // tags não tratadas tratadas no passo 6
    if (tag === 'a') {
      const href = (full.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i) || [])[0] || '';
      return href ? `<a ${href}>` : '<a>';
    }
    if (tag === 'img') {
      const srcRaw = (full.match(/src\s*=\s*"([^"]*)"/i) || [, ''])[1];
      const alt = (full.match(/alt\s*=\s*"([^"]*)"/i) || [, ''])[1];
      return `<img src="${localImageSrc(srcRaw)}" alt="${alt}">`;
    }
    return `<${tag}>`;
  });
  // Fechamentos: normalizar para minúsculo e sem atributos.
  s = s.replace(/<\/([a-z0-9]+)\b[^>]*>/gi, (full, tagRaw) => {
    const tag = tagRaw.toLowerCase();
    return KEEP.has(tag) ? `</${tag}>` : full;
  });

  // 5. Remover quaisquer tags remanescentes fora da whitelist (abre e fecha).
  s = s.replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (full, tagRaw) =>
    KEEP.has(tagRaw.toLowerCase()) ? full : '');

  // 6. Remover parágrafos/itens vazios (inclui &nbsp; e espaços).
  s = s.replace(/<p>(?:\s|&nbsp;)*<\/p>/gi, '');
  s = s.replace(/<li>(?:\s|&nbsp;)*<\/li>/gi, '');

  // 7. Colapsar espaços em branco entre tags.
  s = s.replace(/>\s+</g, '><').trim();

  return s;
}
```

- [ ] **Step 4: Rodar até passar**

Run: `node --test tools/blog-migration/test/sanitize-html.test.mjs`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit + push**

```bash
git add tools/blog-migration/lib/sanitize-html.mjs tools/blog-migration/test/sanitize-html.test.mjs
git commit -m "feat(blog-tools): sanitizador de HTML do WordPress"
git push origin main
```

---

## Task 3: Transformar post cru em registro normalizado

**Files:**
- Create: `tools/blog-migration/lib/transform-post.mjs`
- Test: `tools/blog-migration/test/transform-post.test.mjs`

Objetivo: dado um objeto de post da API WP (com `_embedded` e `yoast_head_json`), produzir o registro do `posts.json`. Função pura: não baixa imagem, apenas calcula o caminho local de destino.

- [ ] **Step 1: Escrever o teste que falha**

Create `tools/blog-migration/test/transform-post.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformPost } from '../lib/transform-post.mjs';

const raw = {
  id: 1068,
  slug: 'o-que-esperar-da-clinica',
  date: '2026-02-04T14:09:44',
  modified: '2026-02-05T10:00:00',
  title: { rendered: 'O Que Esperar da Cl&#237;nica?' },
  content: { rendered: '<div><p>Texto do corpo</p><img src="https://hd360.com.br/wp-content/uploads/2026/02/foto.png" alt="x"></div>' },
  excerpt: { rendered: '<p>Resumo curto do post.</p>' },
  yoast_head_json: {
    title: 'O Que Esperar | HD360',
    description: 'Meta descrição vinda do Yoast.',
    og_image: [{ url: 'https://hd360.com.br/wp-content/uploads/2026/02/capa.png' }],
  },
  _embedded: {
    'wp:featuredmedia': [{ source_url: 'https://hd360.com.br/wp-content/uploads/2026/02/capa.png' }],
    'wp:term': [[{ taxonomy: 'category', name: 'Terapias' }]],
  },
};

test('transformPost normaliza um post completo', () => {
  const p = transformPost(raw);
  assert.equal(p.id, 1068);
  assert.equal(p.slug, 'o-que-esperar-da-clinica');
  assert.equal(p.title, 'O Que Esperar da Clínica?'); // entidades decodificadas
  assert.equal(p.date, '2026-02-04T14:09:44');
  assert.equal(p.dateLabel, '4 de fevereiro de 2026');
  assert.deepEqual(p.category, { name: 'Terapias e Abordagens', color: 'azul' });
  assert.equal(p.coverImage, 'images/blog/capa.png');
  assert.equal(p.excerpt, 'Resumo curto do post.');
  assert.equal(p.content, '<p>Texto do corpo</p><img src="images/blog/foto.png" alt="x">');
  assert.equal(p.metaDescription, 'Meta descrição vinda do Yoast.');
  assert.equal(p.seoTitle, 'O Que Esperar | HD360');
  assert.equal(p.ogImage, 'images/blog/capa.png');
  assert.equal(p.focusKeyword, '');
  assert.deepEqual(p.tags, []);
  // imageDownloads lista pares {url, dest} para o extractor baixar
  assert.ok(p.imageDownloads.some(d => d.dest === 'images/blog/capa.png'));
  assert.ok(p.imageDownloads.some(d => d.dest === 'images/blog/foto.png'));
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/transform-post.test.mjs`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implementar `transform-post.mjs`**

```js
import { formatDatePtBr } from './format-date.mjs';
import { mapCategory } from './map-category.mjs';
import { sanitizeContent } from './sanitize-html.mjs';

function decodeEntities(str) {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(String(html).replace(/<[^>]+>/g, '').trim());
}

function fileFromUrl(url) {
  if (!url) return '';
  return String(url).split('?')[0].split('#')[0].split('/').pop();
}

function localPath(url) {
  const f = fileFromUrl(url);
  return f ? `images/blog/${f}` : '';
}

export function transformPost(raw) {
  const emb = raw._embedded || {};
  const media = (emb['wp:featuredmedia'] || [])[0] || {};
  const terms = (emb['wp:term'] || []).flat()
    .filter(t => t && t.taxonomy === 'category')
    .map(t => t.name);

  const yoast = raw.yoast_head_json || {};
  const ogUrl = ((yoast.og_image || [])[0] || {}).url || media.source_url || '';
  const coverUrl = media.source_url || ogUrl || '';

  const content = sanitizeContent(raw.content && raw.content.rendered || '');

  // Coletar imagens a baixar: capa + todas as imagens do corpo.
  const downloads = [];
  const seen = new Set();
  const addDownload = (url) => {
    const dest = localPath(url);
    if (dest && !seen.has(dest)) { seen.add(dest); downloads.push({ url, dest }); }
  };
  addDownload(coverUrl);
  addDownload(ogUrl);
  // imagens do corpo: pegar os src originais ANTES da reescrita não é possível aqui
  // (sanitizeContent já reescreveu). Então buscamos no HTML cru:
  const rawImgUrls = [...String(raw.content && raw.content.rendered || '')
    .matchAll(/<img[^>]+src\s*=\s*"([^"]+)"/gi)].map(m => m[1]);
  rawImgUrls.forEach(addDownload);

  return {
    id: raw.id,
    slug: raw.slug,
    title: decodeEntities(raw.title && raw.title.rendered || ''),
    date: raw.date,
    modified: raw.modified || raw.date,
    dateLabel: formatDatePtBr(raw.date),
    category: mapCategory(terms),
    coverImage: localPath(coverUrl),
    excerpt: stripTags(raw.excerpt && raw.excerpt.rendered || ''),
    content,
    metaDescription: decodeEntities(yoast.description || ''),
    seoTitle: decodeEntities(yoast.title || ''),
    ogImage: localPath(ogUrl),
    focusKeyword: '',
    tags: [],
    imageDownloads: downloads,
  };
}
```

- [ ] **Step 4: Rodar até passar**

Run: `node --test tools/blog-migration/test/transform-post.test.mjs`
Expected: PASS (1 test)

- [ ] **Step 5: Rodar a suíte inteira**

Run: `node --test tools/blog-migration/test/`
Expected: PASS (todos os testes das Tasks 1-3)

- [ ] **Step 6: Commit + push**

```bash
git add tools/blog-migration/lib/transform-post.mjs tools/blog-migration/test/transform-post.test.mjs
git commit -m "feat(blog-tools): transformacao de post WP em registro normalizado"
git push origin main
```

---

## Task 4: Extrator (busca a API, baixa imagens, grava posts.json)

**Files:**
- Create: `tools/blog-migration/extract.mjs`
- Create (saída): `assets/blog/posts.json`, `images/blog/*`

Script de I/O, executado uma vez. Sem teste automatizado (faz rede e disco); a verificação é por execução real e inspeção.

- [ ] **Step 1: Implementar `extract.mjs`**

```js
import { writeFile, mkdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { transformPost } from './lib/transform-post.mjs';

const API = 'https://hd360.com.br/wp-json/wp/v2/posts?per_page=100&_embed';
const ROOT = new URL('../../', import.meta.url); // raiz do projeto

async function main() {
  console.log('Buscando posts da API do WordPress...');
  const res = await fetch(API);
  if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  const rawPosts = await res.json();
  console.log(`Recebidos ${rawPosts.length} posts.`);

  const posts = rawPosts.map(transformPost);

  // Baixar todas as imagens (capa + corpo), de-duplicando por destino.
  await mkdir(new URL('images/blog/', ROOT), { recursive: true });
  const allDownloads = new Map();
  for (const p of posts) {
    for (const d of p.imageDownloads) allDownloads.set(d.dest, d.url);
  }
  console.log(`Baixando ${allDownloads.size} imagens...`);
  for (const [dest, url] of allDownloads) {
    try {
      const r = await fetch(url);
      if (!r.ok) { console.warn(`  ! ${url} -> ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      await writeFile(new URL(dest, ROOT), buf);
      console.log(`  ok ${dest}`);
    } catch (e) {
      console.warn(`  ! falha ${url}: ${e.message}`);
    }
  }

  // Gravar posts.json sem o campo auxiliar imageDownloads.
  const clean = posts.map(({ imageDownloads, ...rest }) => rest);
  await mkdir(new URL('assets/blog/', ROOT), { recursive: true });
  await writeFile(
    new URL('assets/blog/posts.json', ROOT),
    JSON.stringify(clean, null, 2) + '\n',
  );
  console.log(`Gravado assets/blog/posts.json com ${clean.length} posts.`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Executar o extrator**

Run: `node tools/blog-migration/extract.mjs`
Expected: imprime "Recebidos 23 posts.", baixa imagens ("ok images/blog/..."), grava `posts.json`.

- [ ] **Step 3: Inspecionar a saída**

Run: `node -e "const p=require('./assets/blog/posts.json'); console.log('posts:',p.length); console.log('slugs:',p.map(x=>x.slug).join('\n')); console.log('sem capa:',p.filter(x=>!x.coverImage).map(x=>x.slug)); console.log('sem categoria mapeada:',p.filter(x=>!x.category||!x.category.name).length);"`
Expected: `posts: 23`, lista de 23 slugs, idealmente nenhum sem capa.

Verificação manual: abrir `assets/blog/posts.json` e conferir 2-3 posts (título com acentos corretos, content limpo começando com `<p>` ou `<h2>`, sem `<div>`, imagens em `images/blog/`, metaDescription presente). Confirmar que `images/blog/` tem os arquivos baixados.

- [ ] **Step 4: Ajuste fino do mapa de categorias (se necessário)**

Se o Step 3 mostrar posts caindo em "Histórias HD360" (fallback) que deveriam ter categoria específica, abrir `tools/blog-migration/lib/map-category.mjs`, adicionar o nome de categoria do WP ao `WP_TO_SITE`, rodar `node --test tools/blog-migration/test/helpers.test.mjs` (deve passar) e re-executar `node tools/blog-migration/extract.mjs`.

- [ ] **Step 5: Commit + push**

```bash
git add tools/blog-migration/extract.mjs assets/blog/posts.json images/blog
git commit -m "feat(blog): extrai 23 posts do WordPress para posts.json + imagens locais"
git push origin main
```

---

## Task 5: Renderizar a página individual do post

**Files:**
- Create: `tools/blog-migration/lib/render-post-page.mjs`
- Test: `tools/blog-migration/test/render-post-page.test.mjs`

A página fica em `/<slug>/index.html`, um nível abaixo da raiz. Todos os caminhos de assets/nav usam prefixo `../`. O conteúdo do post (que tem `src="images/blog/..."`) é reescrito para `src="../images/blog/..."`.

- [ ] **Step 1: Escrever os testes que falham**

Create `tools/blog-migration/test/render-post-page.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPostPage } from '../lib/render-post-page.mjs';

const post = {
  id: 1, slug: 'meu-post', title: 'Meu Post de Teste',
  date: '2026-02-04T14:09:44', modified: '2026-02-04T14:09:44',
  dateLabel: '4 de fevereiro de 2026',
  category: { name: 'Terapias e Abordagens', color: 'azul' },
  coverImage: 'images/blog/capa.png',
  excerpt: 'Resumo do post.',
  content: '<p>Parágrafo um.</p><img src="images/blog/foto.png" alt="Foto"><p>Parágrafo dois.</p>',
  metaDescription: 'Descrição para SEO do post.',
  seoTitle: 'Meu Post | HD360', ogImage: 'images/blog/capa.png',
  focusKeyword: '', tags: [],
};
const related = [
  { slug: 'outro', title: 'Outro Post', dateLabel: '1 de janeiro de 2026',
    category: { name: 'Terapias e Abordagens', color: 'azul' }, coverImage: 'images/blog/o.png' },
];

test('renderiza HTML completo com title e meta de SEO', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /<title>Meu Post \| HD360<\/title>/);
  assert.match(html, /<meta name="description" content="Descrição para SEO do post."/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hd360\.com\.br\/meu-post\/"/);
  assert.match(html, /<meta property="og:title" content="Meu Post \| HD360"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type": ?"Article"/);
});

test('usa caminhos relativos com ../ para assets e nav', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /href="\.\.\/assets\/css\/main\.css"/);
  assert.match(html, /src="\.\.\/assets\/js\/main\.js"/);
  assert.match(html, /href="\.\.\/index\.html"/);
  assert.match(html, /href="\.\.\/blog\.html"/);
});

test('reescreve imagens do corpo e da capa para ../images', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /src="\.\.\/images\/blog\/foto\.png"/);
  assert.match(html, /src="\.\.\/images\/blog\/capa\.png"/);
  assert.doesNotMatch(html, /src="images\/blog/); // nenhum caminho sem ../
});

test('inclui titulo, data, categoria e corpo', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /Meu Post de Teste/);
  assert.match(html, /4 de fevereiro de 2026/);
  assert.match(html, /Terapias e Abordagens/);
  assert.match(html, /Parágrafo um\./);
  assert.match(html, /class="prose"/);
});

test('lista posts relacionados com link para ../slug/', () => {
  const html = renderPostPage(post, related);
  assert.match(html, /href="\.\.\/outro\/"/);
  assert.match(html, /Outro Post/);
});

test('sem relacionados, nao quebra (secao omitida)', () => {
  const html = renderPostPage(post, []);
  assert.doesNotMatch(html, /Leia também/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/render-post-page.test.mjs`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implementar `render-post-page.mjs`**

> O nav, drawer e footer são copiados de `blog.html` com o prefixo `../` aplicado nos `href`/`src`. Mantenha o conteúdo idêntico ao do site (mesmos links, mesmo CTA de WhatsApp).

```js
const SITE = 'https://hd360.com.br';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function rel(html) {
  // conteúdo guarda src="images/blog/..."; na página do post vira ../images/blog/...
  return String(html).replace(/src="images\//g, 'src="../images/');
}

function relatedCard(p) {
  return `<article class="post">
        <a href="../${p.slug}/" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%;">
          <div class="post__cover post__cover--${p.category.color}">
            <img src="../${p.coverImage}" alt="${esc(p.title)}">
          </div>
          <div class="post__body">
            <span class="post__tag">${esc(p.category.name)}</span>
            <h3 class="post__title">${esc(p.title)}</h3>
            <span class="post__meta">${esc(p.dateLabel)}</span>
          </div>
        </a>
      </article>`;
}

function relatedSection(related) {
  if (!related || related.length === 0) return '';
  return `
    <section class="section section--cream">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow eyebrow--lilas" style="margin-inline:auto;"><span class="eyebrow__dot" aria-hidden="true"></span> Leia também</p>
          <h2 class="section__title">Mais do nosso <span class="hl hl--lilas">blog</span></h2>
        </header>
        <div class="posts">
          ${related.map(relatedCard).join('\n          ')}
        </div>
      </div>
    </section>`;
}

export function renderPostPage(post, related = []) {
  const title = post.seoTitle || `${post.title} · Blog HD360 Moinhos`;
  const desc = post.metaDescription || post.excerpt || '';
  const url = `${SITE}/${post.slug}/`;
  const ogImg = `${SITE}/${post.ogImage || post.coverImage}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: desc, image: ogImg,
    datePublished: post.date, dateModified: post.modified,
    author: { '@type': 'Organization', name: 'HD360 Moinhos' },
    publisher: {
      '@type': 'Organization', name: 'HD360 Moinhos',
      logo: { '@type': 'ImageObject', url: `${SITE}/images/logo-3.png` },
    },
    mainEntityOfPage: url,
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(ogImg)}" />
  <meta property="og:url" content="${url}" />
  <link rel="icon" type="image/png" href="../images/icon.png" />
  <link rel="apple-touch-icon" href="../images/icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../assets/css/main.css" />
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>

  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="ic-puzzle" viewBox="0 0 24 24"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></symbol>
  </svg>

  <header class="nav" data-nav>
    <a class="nav__brand" href="../index.html" aria-label="HD360 Moinhos, início">
      <img class="nav__logo" src="../images/logo-3.png" alt="HD360 Moinhos" width="170" height="48" />
    </a>
    <nav class="nav__links" aria-label="Navegação principal">
      <a class="nav__link" href="../index.html" data-color="azul"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Início</a>
      <a class="nav__link" href="../atendimento.html" data-color="rosa"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Atendimento</a>
      <a class="nav__link" href="../equipe.html" data-color="amarelo"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Equipe</a>
      <a class="nav__link" href="../unidades.html" data-color="verde"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Unidades</a>
      <a class="nav__link" href="../ouvidoria.html" data-color="lilas"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Ouvidoria</a>
      <a class="nav__link" href="../blog.html" data-color="azul" aria-current="page"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Blog</a>
    </nav>
    <a class="btn btn--solid btn--lilas nav__cta" href="https://wa.me/555121128884?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20HD360%20Moinhos%20e%20gostaria%20de%20agendar%20uma%20visita." target="_blank" rel="noopener">Agende uma visita</a>
    <button class="nav__burger" data-burger aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer">
      <span></span><span></span><span></span>
    </button>
  </header>

  <div class="drawer-backdrop" data-drawer-backdrop></div>
  <aside class="drawer" id="drawer" data-drawer aria-label="Menu">
    <div class="drawer__head">
      <img class="drawer__logo" src="../images/logo-3.png" alt="HD360 Moinhos" width="150" height="42" />
      <button class="drawer__close" data-drawer-close aria-label="Fechar menu">&times;</button>
    </div>
    <a class="drawer__link" href="../index.html" data-color="azul"><span class="drawer__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Início</a>
    <a class="drawer__link" href="../atendimento.html" data-color="rosa"><span class="drawer__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Atendimento</a>
    <a class="drawer__link" href="../equipe.html" data-color="amarelo"><span class="drawer__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Equipe</a>
    <a class="drawer__link" href="../unidades.html" data-color="verde"><span class="drawer__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Unidades</a>
    <a class="drawer__link" href="../ouvidoria.html" data-color="lilas"><span class="drawer__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Ouvidoria</a>
    <a class="drawer__link" href="../blog.html" data-color="azul"><span class="drawer__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Blog</a>
    <a class="btn btn--solid btn--lilas drawer__cta" href="https://wa.me/555121128884" target="_blank" rel="noopener">Agende uma visita</a>
  </aside>

  <main>
    <section class="page-hero" style="padding-bottom:clamp(28px,4vw,48px);">
      <div class="page-hero__bg" aria-hidden="true">
        <span class="blob blob--azul blob--a"></span>
        <span class="blob blob--rosa blob--b"></span>
      </div>
      <div class="container page-hero__inner" style="max-width:780px;">
        <p class="eyebrow eyebrow--${post.category.color} reveal" style="margin-inline:auto;"><span class="eyebrow__dot" aria-hidden="true"></span> ${esc(post.category.name)}</p>
        <h1 class="page-hero__title reveal" style="--i:1;font-size:clamp(30px,4.4vw,52px);">${esc(post.title)}</h1>
        <p class="page-hero__lede reveal" style="--i:2;font-size:15px;">${esc(post.dateLabel)}</p>
      </div>
      <div class="wave wave--bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0,40 C360,100 1080,0 1440,55 L1440,90 L0,90 Z" fill="#ffffff"/></svg>
      </div>
    </section>

    <section class="section section--white" style="padding-top:clamp(20px,3vw,36px);">
      <div class="container">
        ${post.coverImage ? `<img class="post-hero-img reveal" src="../${post.coverImage}" alt="${esc(post.title)}" />` : ''}
        <article class="prose reveal">
          ${rel(post.content)}
        </article>
        <div class="post-cta reveal">
          <a class="btn btn--solid btn--azul" href="https://wa.me/555121128884?text=Ol%C3%A1!%20Vim%20pelo%20blog%20da%20HD360%20Moinhos." target="_blank" rel="noopener">Fale com a gente no WhatsApp</a>
        </div>
      </div>
    </section>
    ${relatedSection(related)}
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <img class="footer__logo" src="../images/logo-3.png" alt="HD360 Moinhos" width="190" height="54" />
          <p class="footer__tagline">Especialista em autismo, atendimento humanizado. Clínica de desenvolvimento e terapia ABA em Porto Alegre.</p>
        </div>
        <div class="footer__col">
          <h4>Atendimento</h4>
          <a href="tel:+555121128884">(51) 2112-8884</a>
          <a href="mailto:contato@hd360.com.br">contato@hd360.com.br</a>
        </div>
        <nav class="footer__col" aria-label="Navegação do rodapé">
          <h4>Navegue</h4>
          <a href="../index.html">Início</a>
          <a href="../atendimento.html">Atendimento</a>
          <a href="../equipe.html">Equipe</a>
          <a href="../unidades.html">Unidades</a>
          <a href="../blog.html">Blog</a>
        </nav>
      </div>
      <div class="footer__bottom">
        <p class="footer__legal">© <span data-year>2026</span> HD360 Moinhos · CNPJ 36.152.938/0001-74 · <a href="../politica-de-privacidade.html">Política de Privacidade</a></p>
      </div>
    </div>
  </footer>

  <a class="wpp" href="https://wa.me/555121128884?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20HD360%20Moinhos." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.6-6c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c2 .8 2 .5 2.4.5a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>
  </a>

  <script src="../assets/js/main.js"></script>
</body>
</html>
`;
}
```

- [ ] **Step 4: Rodar até passar**

Run: `node --test tools/blog-migration/test/render-post-page.test.mjs`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit + push**

```bash
git add tools/blog-migration/lib/render-post-page.mjs tools/blog-migration/test/render-post-page.test.mjs
git commit -m "feat(blog-tools): renderizador da pagina individual do post"
git push origin main
```

---

## Task 6: Renderizar a grade de cards do índice

**Files:**
- Create: `tools/blog-migration/lib/render-blog-index.mjs`
- Test: `tools/blog-migration/test/render-blog-index.test.mjs`

Gera só o fragmento HTML da grade de cards (será injetado entre marcadores no `blog.html`). Cards na raiz, sem prefixo `../`. Cada card tem `data-category` para o filtro.

- [ ] **Step 1: Escrever os testes que falham**

Create `tools/blog-migration/test/render-blog-index.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderBlogIndex } from '../lib/render-blog-index.mjs';

const posts = [
  { slug: 'a', title: 'Post A', dateLabel: '4 de fevereiro de 2026',
    category: { name: 'Terapias e Abordagens', color: 'azul' },
    coverImage: 'images/blog/a.png', excerpt: 'Resumo A' },
  { slug: 'b', title: 'Post B', dateLabel: '1 de janeiro de 2026',
    category: { name: 'Entendendo o Autismo', color: 'verde' },
    coverImage: 'images/blog/b.png', excerpt: 'Resumo B' },
];

test('gera um card por post com link para /slug/', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /href="a\/"/);
  assert.match(html, /href="b\/"/);
  assert.match(html, /Post A/);
  assert.match(html, /Post B/);
});

test('cards usam caminho de imagem da raiz (sem ../)', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /src="images\/blog\/a\.png"/);
  assert.doesNotMatch(html, /\.\.\/images/);
});

test('cada card tem data-category para o filtro', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /data-category="Terapias e Abordagens"/);
  assert.match(html, /data-category="Entendendo o Autismo"/);
});

test('aplica a cor da categoria na capa', () => {
  const html = renderBlogIndex(posts);
  assert.match(html, /post__cover--azul/);
  assert.match(html, /post__cover--verde/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/render-blog-index.test.mjs`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implementar `render-blog-index.mjs`**

```js
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function card(p, i) {
  return `<article class="post reveal" style="--i:${i % 3}" data-category="${esc(p.category.name)}">
            <a href="${p.slug}/" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%;">
              <div class="post__cover post__cover--${p.category.color}">
                <img src="${p.coverImage}" alt="${esc(p.title)}" loading="lazy">
              </div>
              <div class="post__body">
                <span class="post__tag">${esc(p.category.name)}</span>
                <h3 class="post__title">${esc(p.title)}</h3>
                <p class="post__excerpt">${esc(p.excerpt)}</p>
                <span class="post__meta">${esc(p.dateLabel)}</span>
              </div>
            </a>
          </article>`;
}

export function renderBlogIndex(posts) {
  return posts.map(card).join('\n          ');
}
```

- [ ] **Step 4: Rodar até passar**

Run: `node --test tools/blog-migration/test/render-blog-index.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit + push**

```bash
git add tools/blog-migration/lib/render-blog-index.mjs tools/blog-migration/test/render-blog-index.test.mjs
git commit -m "feat(blog-tools): renderizador da grade de cards do indice"
git push origin main
```

---

## Task 7: Preparar `blog.html` com marcadores de injeção

**Files:**
- Modify: `blog.html`

Edição manual única: envolver a grade `.posts` com marcadores, trocar a faixa de categorias para ter `data-filter`, e remover a seção "Estamos preparando tudo com carinho" (não faz mais sentido com posts reais). A newsletter permanece.

- [ ] **Step 1: Adicionar `data-filter` nas tags de categoria**

Em `blog.html`, na seção CATEGORIAS, substituir o bloco `<div class="taglist reveal"> ... </div>` por (note o primeiro item "Todos" e os atributos `data-filter`):

```html
        <div class="taglist reveal" data-blog-filters>
          <button class="tag tag--filter is-active" data-filter="all"><span class="tag__dot" aria-hidden="true"></span>Todos</button>
          <button class="tag tag--filter" data-filter="Entendendo o Autismo"><span class="tag__dot" aria-hidden="true"></span>Entendendo o Autismo</button>
          <button class="tag tag--filter" data-filter="Terapias e Abordagens"><span class="tag__dot" aria-hidden="true"></span>Terapias e Abordagens</button>
          <button class="tag tag--filter" data-filter="Dia a Dia da Família"><span class="tag__dot" aria-hidden="true"></span>Dia a Dia da Família</button>
          <button class="tag tag--filter" data-filter="Dicas dos Especialistas"><span class="tag__dot" aria-hidden="true"></span>Dicas dos Especialistas</button>
          <button class="tag tag--filter" data-filter="Histórias HD360"><span class="tag__dot" aria-hidden="true"></span>Histórias HD360</button>
        </div>
```

- [ ] **Step 2: Envolver a grade com marcadores**

Substituir todo o bloco `<div class="posts"> ... </div>` (os 6 `<article>` de "Em breve") por:

```html
        <div class="posts" data-blog-grid>
          <!-- POSTS:START -->
          <!-- POSTS:END -->
        </div>
```

- [ ] **Step 3: Remover a seção "Em breve / empty"**

Remover por completo a seção:

```html
    <!-- ============================ EM BREVE / NEWSLETTER ============================ -->
    <section class="section section--cream">
      <div class="container">
        <div class="empty reveal"> ... </div>
      </div>
    </section>
```

(Manter a seção seguinte, a da newsletter `band band--azul`.)

- [ ] **Step 4: Verificar que o arquivo continua válido**

Run: `node -e "const fs=require('fs'); const h=fs.readFileSync('blog.html','utf8'); console.log('START:',h.includes('<!-- POSTS:START -->')); console.log('END:',h.includes('<!-- POSTS:END -->')); console.log('filtros:',h.includes('data-blog-filters')); console.log('empty removido:',!h.includes('Estamos preparando tudo'));"`
Expected: todos `true`.

- [ ] **Step 5: Commit + push**

```bash
git add blog.html
git commit -m "chore(blog): marcadores de injecao e filtros de categoria no blog.html"
git push origin main
```

---

## Task 8: Build (gera blog.html injetado + páginas dos posts)

**Files:**
- Create: `tools/blog-migration/build.mjs`
- Create (saída): `<slug>/index.html` × 23, `blog.html` (grade preenchida)

- [ ] **Step 1: Implementar `build.mjs`**

```js
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderBlogIndex } from './lib/render-blog-index.mjs';
import { renderPostPage } from './lib/render-post-page.mjs';

const ROOT = new URL('../../', import.meta.url);

function relatedFor(post, all) {
  return all
    .filter(p => p.slug !== post.slug && p.category.name === post.category.name)
    .slice(0, 3);
}

async function main() {
  const posts = JSON.parse(await readFile(new URL('assets/blog/posts.json', ROOT), 'utf8'));
  // Ordenar do mais novo para o mais antigo.
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 1. Injetar a grade no blog.html entre os marcadores.
  const blogPath = new URL('blog.html', ROOT);
  let blog = await readFile(blogPath, 'utf8');
  const grid = renderBlogIndex(posts);
  blog = blog.replace(
    /<!-- POSTS:START -->[\s\S]*?<!-- POSTS:END -->/,
    `<!-- POSTS:START -->\n          ${grid}\n          <!-- POSTS:END -->`,
  );
  await writeFile(blogPath, blog);
  console.log('blog.html atualizado com', posts.length, 'cards.');

  // 2. Gerar uma página por post.
  for (const post of posts) {
    const html = renderPostPage(post, relatedFor(post, posts));
    await mkdir(new URL(`${post.slug}/`, ROOT), { recursive: true });
    await writeFile(new URL(`${post.slug}/index.html`, ROOT), html);
    console.log('  ok', `${post.slug}/index.html`);
  }
  console.log('Pronto.');
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Executar o build**

Run: `node tools/blog-migration/build.mjs`
Expected: "blog.html atualizado com 23 cards." e 23 linhas "ok <slug>/index.html".

- [ ] **Step 3: Verificação automática da saída**

Run: `node -e "const fs=require('fs'); const p=require('./assets/blog/posts.json'); let bad=[]; for(const x of p){const f=x.slug+'/index.html'; if(!fs.existsSync(f)) bad.push(f); else {const h=fs.readFileSync(f,'utf8'); if(h.includes('src=\"images/blog')) bad.push(x.slug+' (path sem ../)'); if(!h.includes('canonical')) bad.push(x.slug+' (sem canonical)');}} console.log('paginas:',p.length); console.log('problemas:',bad.length?bad:'nenhum');"`
Expected: `paginas: 23`, `problemas: nenhum`.

- [ ] **Step 4: Commit + push**

```bash
git add tools/blog-migration/build.mjs blog.html
git add .
git commit -m "feat(blog): gera blog.html real + 23 paginas de post em /<slug>/"
git push origin main
```

> O `git add .` inclui as 23 pastas `<slug>/index.html` geradas. Confira com `git status` antes do commit que só entraram as pastas de post, `blog.html` e o `build.mjs`.

---

## Task 9: CSS dos novos elementos

**Files:**
- Modify: `assets/css/main.css`

Adicionar estilos para: imagem dentro do card, meta/excerpt do card, imagem de capa do post, CTA do post, e botões de filtro. Acrescentar ao final do arquivo (ou junto ao bloco `.post*` existente, por volta da linha 423).

- [ ] **Step 1: Adicionar o CSS**

Append em `assets/css/main.css`:

```css
/* ===== Blog: cards com imagem, meta e filtro ===== */
.post__cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.post__excerpt { font: 400 14.5px/1.6 var(--font-body); color: var(--tinta-muted); }
.post__meta { margin-top: auto; font: 600 13px/1 var(--font-body); color: var(--tinta-soft); }

.tag--filter { border: 0; cursor: pointer; font-family: var(--font-body); }
.tag--filter.is-active { box-shadow: 0 0 0 2px var(--azul) inset, 0 6px 16px rgba(46,42,57,.06); }
.post[hidden] { display: none; }

/* ===== Post: imagem de capa e CTA ===== */
.post-hero-img { display: block; width: 100%; max-width: var(--container-narrow); margin: 0 auto clamp(24px,4vw,40px); border-radius: var(--r-lg); aspect-ratio: 16/9; object-fit: cover; box-shadow: 0 18px 44px rgba(46,42,57,.1); }
.post-cta { max-width: var(--container-narrow); margin: clamp(28px,4vw,44px) auto 0; text-align: center; }
```

- [ ] **Step 2: Verificar que as variáveis usadas existem**

Run: `node -e "const c=require('fs').readFileSync('assets/css/main.css','utf8'); ['--container-narrow','--r-lg','--azul','--tinta-muted','--tinta-soft'].forEach(v=>console.log(v, c.includes(v)));"`
Expected: todas `true`. (Se `--container-narrow` não existir, usar `760px` direto nos dois lugares.)

- [ ] **Step 3: Commit + push**

```bash
git add assets/css/main.css
git commit -m "style(blog): cards com imagem, capa do post, CTA e filtros"
git push origin main
```

---

## Task 10: Filtro de categoria (JS)

**Files:**
- Modify: `assets/js/main.js`

Progressive enhancement: clicar num botão de filtro mostra/esconde cards via atributo `hidden`. Sem framework.

- [ ] **Step 1: Adicionar o script**

Append em `assets/js/main.js`:

```js
/* ===== Blog: filtro por categoria ===== */
(function () {
  const filters = document.querySelector('[data-blog-filters]');
  const grid = document.querySelector('[data-blog-grid]');
  if (!filters || !grid) return;

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const cat = btn.getAttribute('data-filter');

    filters.querySelectorAll('[data-filter]').forEach(b =>
      b.classList.toggle('is-active', b === btn));

    grid.querySelectorAll('.post').forEach(card => {
      const match = cat === 'all' || card.getAttribute('data-category') === cat;
      card.hidden = !match;
    });
  });
})();
```

- [ ] **Step 2: Commit + push**

```bash
git add assets/js/main.js
git commit -m "feat(blog): filtro de categoria por clique nos cards"
git push origin main
```

---

## Task 11: Servidor local e verificação manual final

**Files:**
- Create: `tools/blog-migration/serve.mjs`

- [ ] **Step 1: Implementar servidor estático mínimo**

```js
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const full = join(ROOT, normalize(p));
    const info = await stat(full).catch(() => null);
    const file = info && info.isDirectory() ? join(full, 'index.html') : full;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(8000, () => console.log('Servindo em http://localhost:8000'));
```

- [ ] **Step 2: Subir o servidor**

Run (background): `node tools/blog-migration/serve.mjs`
Abrir `http://localhost:8000/blog.html`.

- [ ] **Step 3: Checklist de verificação manual**

Confirmar, com os próprios olhos:
- [ ] `blog.html`: 23 cards aparecem, cada um com capa (imagem), categoria, título, resumo e data.
- [ ] Clicar nos filtros de categoria mostra/esconde os cards corretamente; "Todos" mostra tudo.
- [ ] Abrir 3 posts (`http://localhost:8000/<slug>/`): título, capa, corpo, acentuação e links corretos; layout HD360 intacto.
- [ ] Conferir mobile (DevTools responsive): nav/drawer, cards e prose ok.
- [ ] Nenhuma imagem quebrada (sem 404 em `images/blog/`).
- [ ] Ver fonte de um post: `<title>`, `meta description`, `canonical`, `og:*` e `application/ld+json` presentes.
- [ ] Nenhum travessão (em dash) na copy.

- [ ] **Step 4: Commit + push do servidor**

```bash
git add tools/blog-migration/serve.mjs
git commit -m "chore(blog-tools): servidor estatico para verificacao local"
git push origin main
```

- [ ] **Step 5: Confirmar deploy no GitHub Pages**

Após o push, abrir `https://hd360.com.br/blog.html` (ou a URL do GitHub Pages do projeto) e conferir 1 post no ar. Atenção: as páginas `/<slug>/` só passarão a "valer" para SEO quando o domínio apontar para o site novo; até lá convivem com o WordPress.

---

## Notas para a Fase 2 (não implementar agora)

`posts.json` já contém os campos `metaDescription`, `seoTitle`, `focusKeyword` (vazio), `tags` (vazio) e `category`. Esses campos são a semente do schema do Supabase e dos campos do painel. O `build.mjs` (renderizadores puros) será reaproveitado pela GitHub Action que regenera as páginas a cada publicação.
```
