# Blog Fase 2 — Plano 2: Painel admin `/painel/` (login, CRUD, editor, SEO, tags, upload)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **REQUIRED DESIGN SKILL:** Toda UI/copy deste painel segue a skill **`hd360-painel`** (não a `hd360-design`, que é do site público). Leia `.claude/skills/hd360-painel/SKILL.md` e `.claude/skills/hd360-painel/references/COMPONENTS.md` antes de escrever HTML/CSS. Os componentes (shell, tabela, badge, campos, editor, chips, modal, toast, dropzone, login) já têm anatomia HTML/CSS pronta lá; este plano referencia esses blocos em vez de duplicá-los.

**Goal:** Entregar a SPA admin em `/painel/` onde o admin loga (Supabase Auth), lista/cria/edita/exclui posts num editor WYSIWYG com campos de SEO, tags curadas e upload de imagens pro Storage, salvando direto no Supabase (rascunho ou publicado). O gatilho de rebuild do site ("Atualizar site") é do Plano 3.

**Architecture:** SPA vanilla em HTML/CSS/JS puro, zero bundler, fiel à pegada do projeto. `@supabase/supabase-js` v2 e Quill 1.3.7 entram via CDN. O painel usa a **anon key** (pública, segura por RLS: leitura pública só de `published`, escrita só autenticada). A lógica pura (slug, limpeza do HTML do editor, payload pro banco, estado de SEO) vive em `painel/lib/*.js` como módulos ES testáveis por `node:test` (graças a um `painel/package.json` com `"type":"module"`, escopado, que não afeta o root `commonjs`). As telas (login, lista, editor) ficam em `painel/screens/*.js` e são wiring de DOM + Supabase, verificadas manualmente contra o projeto real (precisam da anon key).

**Tech Stack:** HTML/CSS/JS ESM no browser · `@supabase/supabase-js@2` (CDN ESM) · Quill 1.3.7 (CDN) · Node 18+ `node:test` para a lógica pura · Supabase (Auth + Postgres/PostgREST + Storage).

**Pré-requisitos de ambiente:**
- O schema (`supabase/schema.sql`), o bucket público `blog-images` e o usuário admin já existem (Plano 1). Projeto: `https://euzmbswywwhmicjlszqw.supabase.co`.
- As Tasks 2–5 rodam **offline** (lógica pura, sem rede). As Tasks 1 e 6–10 precisam da **anon key** do projeto (Dashboard → Project Settings → API → `anon` `public`) e de rodar o painel num servidor local. A anon key é **pública por design** e pode ser commitada; quando chegar na Task 1, peça a anon key ao usuário.
- Servir local: `node tools/blog-migration/serve.mjs` serve a raiz na porta 8000; abra `http://localhost:8000/painel/`.

**Colunas da tabela `posts`** (do Plano 1, snake_case): `id, slug, title, date, modified, category_name, category_color, cover_image, excerpt, content, meta_description, seo_title, og_image, focus_keyword, tags (text[]), likes, status ('draft'|'published'), created_at, updated_at`.

**Categorias reais (nome → cor de marca):**
```
Terapias e Abordagens → azul
Entendendo o Autismo   → verde
Dia a Dia da Família   → rosa
Histórias HD360        → amarelo
Dicas dos Especialistas→ lilas
```

**Estrutura de arquivos do painel:**
```
painel/
├── package.json          # { "type": "module", "private": true } — escopa ESM ao painel
├── index.html            # shell único: tela de login + app (sidebar/topbar/work), monta CDNs
├── styles.css            # tokens :root + componentes montados a partir da skill hd360-painel
├── config.js             # SUPABASE_URL + SUPABASE_ANON_KEY (pública) + categorias
├── app.js                # entrypoint: client Supabase, gate de auth, router simples, logout
├── lib/
│   ├── slug.js           # slugify(title)                         (puro, testado)
│   ├── clean-html.js     # normalizeEditorHtml(html)              (puro, testado)
│   ├── seo.js            # metaState(text), serp(post)            (puro, testado)
│   ├── post-payload.js   # buildPayload(form)                     (puro, testado)
│   └── upload.js         # uploadImage(file) -> URL pública       (integração)
├── screens/
│   ├── login.js          # render + signInWithPassword
│   ├── list.js           # fetch posts, tabela, filtro, excluir
│   └── editor.js         # Quill + campos + SEO + tags + capa + salvar/prévia
└── test/
    ├── slug.test.js
    ├── clean-html.test.js
    ├── seo.test.js
    └── post-payload.test.js
```

Rodar os testes do painel: `node --test painel/test/*.test.js`.

---

### Task 1: Scaffold do painel (package, shell, tokens, config)

**Files:**
- Create: `painel/package.json`
- Create: `painel/config.js`
- Create: `painel/index.html`
- Create: `painel/styles.css`

- [ ] **Step 1: `painel/package.json` (escopa ESM ao painel)**

Criar `painel/package.json`:

```json
{
  "name": "hd360-painel",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
```

> Isso faz o Node tratar os `.js` sob `painel/` como módulos ES (importáveis por `node:test`) sem mexer no `"type": "commonjs"` da raiz, que os `.mjs` do tooling não usam de qualquer forma.

- [ ] **Step 2: `painel/config.js` (URL + anon key + categorias)**

Criar `painel/config.js`. A anon key é pública (segura por RLS) e pode ser commitada. **Peça a anon key ao usuário** (Dashboard → Project Settings → API → Project API keys → `anon` `public`) e cole no lugar do placeholder.

```js
// Configuração pública do painel HD360. A anon key é segura por design (RLS no banco).
export const SUPABASE_URL = 'https://euzmbswywwhmicjlszqw.supabase.co';
export const SUPABASE_ANON_KEY = 'COLE_A_ANON_KEY_AQUI';

export const STORAGE_BUCKET = 'blog-images';

// As 5 categorias do blog, cada uma na sua cor de marca (ver hd360-design).
export const CATEGORIES = [
  { name: 'Terapias e Abordagens', color: 'azul' },
  { name: 'Entendendo o Autismo', color: 'verde' },
  { name: 'Dia a Dia da Família', color: 'rosa' },
  { name: 'Histórias HD360', color: 'amarelo' },
  { name: 'Dicas dos Especialistas', color: 'lilas' },
];

// Mapa cor de marca -> hex (para a bolinha de categoria na tabela/select).
export const COLOR_HEX = {
  azul: '#00A5EA', amarelo: '#FFC700', rosa: '#FB3C63', lilas: '#8F64C8', verde: '#A8C420',
};
```

- [ ] **Step 3: `painel/index.html` (shell único)**

Criar `painel/index.html`. Carrega Montserrat, Quill 1.3.7 e o `app.js` como módulo. Tem dois containers: `#login-root` e `#app-root` (o `app.js` mostra um ou outro conforme a sessão). O `<aside>`/`<header>` seguem a anatomia do shell em `hd360-painel/references/COMPONENTS.md §1`.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Painel · HD360</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- Tela de login (mostrada quando não há sessão) -->
  <div id="login-root" hidden></div>
  <!-- App (mostrado quando há sessão) -->
  <div id="app-root" hidden></div>
  <!-- Região de toasts (acessível) -->
  <div class="toasts" id="toasts" aria-live="polite" aria-atomic="false"></div>

  <script src="https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js"></script>
  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 4: `painel/styles.css` (tokens + componentes da skill)**

Criar `painel/styles.css`. Começa com o reset mínimo + o bloco `:root` de tokens **exatamente** como em `hd360-painel/SKILL.md` (seção "Brand tokens"), depois cola/adapta os componentes de `hd360-painel/references/COMPONENTS.md` que este plano usa: app shell (§1), buttons (§2), badge (§3), table (§4), fields (§5), chips (§6), editor chrome (§7), dropzone (§8), serp (§9), modal (§10), toast (§11), states (§12), login (§13). Carregar Barnacle Boy via `@font-face` apontando para `../fonts/Barnacle%20Boy.otf` (o CSS está em `/painel/`, um nível abaixo da raiz).

Cabeçalho obrigatório do arquivo (resto vem da skill):

```css
/* HD360 Painel — estilos. Tokens e componentes seguem a skill hd360-painel.
   Este painel é a marca em registro de PRODUTIVIDADE: calmo, denso, legível.
   Sem travessões em nenhuma copy. */
@font-face{
  font-family:"Barnacle Boy";
  src:url("../fonts/Barnacle%20Boy.otf") format("opentype");
  font-weight:400 700; font-style:normal; font-display:swap;
}
*,*::before,*::after{ box-sizing:border-box; }
html,body{ margin:0; }
body{ font-family:var(--font-body); color:var(--tinta); background:var(--app-bg); }
[hidden]{ display:none !important; }

:root{
  /* === colar o bloco :root completo de hd360-painel/SKILL.md aqui === */
}
/* === colar os componentes usados de hd360-painel/references/COMPONENTS.md aqui === */
```

> Não inventa tokens nem cores fora da skill. Se precisar de um componente que não está na COMPONENTS.md, construa "no mesmo espírito" (superfície neutra, tinta slate, hairline `--linha`, uma cor codificada só se carregar status/ação, cantos `--r-sm`/`--r-md`/pill, uma motion funcional, reduced-motion, label e foco visíveis).

- [ ] **Step 5: Verificação visual do scaffold**

Servir e abrir. Como `app.js` ainda não existe, crie um `app.js` mínimo temporário OU pule pro fim e volte: por ora, apenas confirme que `styles.css` e as fontes carregam sem erro 404.

Run: `node tools/blog-migration/serve.mjs` e abra `http://localhost:8000/painel/`.
Expected: página em branco (containers `hidden`), **sem 404** de `styles.css`, Montserrat, Quill CSS ou Barnacle Boy no console de rede.

- [ ] **Step 6: Commit**

```bash
git add painel/package.json painel/config.js painel/index.html painel/styles.css
git commit -m "feat(painel): scaffold do painel admin (shell, tokens, config)"
```

---

### Task 2: `slugify` (lógica pura, TDD)

**Files:**
- Create: `painel/lib/slug.js`
- Test: `painel/test/slug.test.js`

- [ ] **Step 1: Escrever o teste que falha**

Criar `painel/test/slug.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../lib/slug.js';

test('slugify normaliza título pt-BR para slug de URL', () => {
  assert.equal(slugify('O Que Esperar da Clínica?'), 'o-que-esperar-da-clinica');
  assert.equal(slugify('Educação, Família & Autismo'), 'educacao-familia-autismo');
  assert.equal(slugify('  Espaços   múltiplos  '), 'espacos-multiplos');
  assert.equal(slugify('Histórias HD360'), 'historias-hd360');
});

test('slugify lida com vazio e só-símbolos', () => {
  assert.equal(slugify(''), '');
  assert.equal(slugify('—  —'), '');
  assert.equal(slugify(undefined), '');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test painel/test/slug.test.js`
Expected: FAIL — `Cannot find module '../lib/slug.js'`.

- [ ] **Step 3: Implementar `slug.js`**

Criar `painel/lib/slug.js`:

```js
// Título -> slug de URL: minúsculo, sem acento, só [a-z0-9-], hífens colapsados.
export function slugify(title) {
  return String(title ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')                       // não-alfanumérico -> hífen
    .replace(/^-+|-+$/g, '');                          // tira hífens das pontas
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test painel/test/slug.test.js`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add painel/lib/slug.js painel/test/slug.test.js
git commit -m "feat(painel): slugify de título para URL (puro, testado)"
```

---

### Task 3: `normalizeEditorHtml` (limpa a saída do Quill, TDD)

**Files:**
- Create: `painel/lib/clean-html.js`
- Test: `painel/test/clean-html.test.js`

> O Quill 1.3.7 produz HTML semântico (`<p>`, `<strong>`, `<em>`, `<h2>`, `<h3>`, `<ul><li>`, `<ol><li>`, `<blockquote>`, `<a>`, `<img>`), mas adiciona classes `ql-*` (align/indent) e parágrafos vazios `<p><br></p>`. Esta função pura limpa pro mesmo formato dos posts existentes. É string/regex, sem DOM, então roda no `node:test`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `painel/test/clean-html.test.js`:

```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test painel/test/clean-html.test.js`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `clean-html.js`**

Criar `painel/lib/clean-html.js`:

```js
// Limpa a saída do editor (Quill) para o formato HTML dos posts:
// tira classes ql-* e parágrafos vazios. Sem DOM (regex puro), testável no Node.
export function normalizeEditorHtml(html) {
  return String(html ?? '')
    .replace(/\s*class="[^"]*\bql-[^"]*"/g, '') // remove atributos class que contêm ql-*
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '')   // <p><br></p> -> nada
    .replace(/<p>\s*<\/p>/g, '')                // <p></p> -> nada
    .trim();
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test painel/test/clean-html.test.js`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add painel/lib/clean-html.js painel/test/clean-html.test.js
git commit -m "feat(painel): normalizeEditorHtml limpa saida do editor (puro, testado)"
```

---

### Task 4: Helpers de SEO (`metaState`, `serp`) (TDD)

**Files:**
- Create: `painel/lib/seo.js`
- Test: `painel/test/seo.test.js`

- [ ] **Step 1: Escrever o teste que falha**

Criar `painel/test/seo.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metaState, serp } from '../lib/seo.js';

test('metaState classifica o comprimento da meta description', () => {
  assert.deepEqual(metaState(''), { count: 0, level: 'empty' });
  assert.deepEqual(metaState('curtinha'), { count: 8, level: 'short' });
  assert.equal(metaState('x'.repeat(140)).level, 'ok');
  assert.equal(metaState('x'.repeat(175)).level, 'over');
});

test('serp monta a prévia do Google com fallbacks', () => {
  const full = serp({
    title: 'O Que Esperar', slug: 'o-que-esperar',
    seoTitle: 'O Que Esperar | HD360', metaDescription: 'Resumo de SEO.', excerpt: 'Resumo do post.',
  });
  assert.equal(full.title, 'O Que Esperar | HD360');
  assert.equal(full.url, 'hd360.com.br › blog › o-que-esperar');
  assert.equal(full.desc, 'Resumo de SEO.');

  // sem seoTitle/meta: cai pro título + sufixo da marca e pro excerpt
  const fallback = serp({ title: 'Bem-vindo', slug: 'bem-vindo', excerpt: 'Texto do resumo.' });
  assert.equal(fallback.title, 'Bem-vindo | HD360');
  assert.equal(fallback.desc, 'Texto do resumo.');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test painel/test/seo.test.js`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `seo.js`**

Criar `painel/lib/seo.js`:

```js
// Estado do contador da meta description (faixa recomendada 120–160).
export function metaState(text, { min = 120, max = 160 } = {}) {
  const count = String(text ?? '').length;
  let level = 'ok';
  if (count === 0) level = 'empty';
  else if (count < min) level = 'short';
  else if (count > max) level = 'over';
  return { count, level };
}

// Prévia estilo Google (SERP), com fallbacks sensatos.
export function serp({ title = '', slug = '', seoTitle = '', metaDescription = '', excerpt = '' } = {}) {
  return {
    title: seoTitle.trim() || `${title} | HD360`,
    url: `hd360.com.br › blog › ${slug}`,
    desc: (metaDescription.trim() || excerpt.trim()).slice(0, 160),
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test painel/test/seo.test.js`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add painel/lib/seo.js painel/test/seo.test.js
git commit -m "feat(painel): helpers de SEO (contador de meta + previa SERP)"
```

---

### Task 5: `buildPayload` (estado do form → linha do banco) (TDD)

**Files:**
- Create: `painel/lib/post-payload.js`
- Test: `painel/test/post-payload.test.js`

> Mapeia o estado do formulário (camelCase) para as colunas snake_case da tabela `posts`, do mesmo jeito que `toSupabaseRow` faz no tooling. Não inclui `id`/`date`/`modified` (o banco preenche `date`/`modified`/`created_at`/`updated_at` por default/trigger no insert; o update preserva o `date` original). Limpa o `content` com `normalizeEditorHtml`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `painel/test/post-payload.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload } from '../lib/post-payload.js';

const form = {
  title: 'Novo Post',
  slug: 'novo-post',
  categoryName: 'Terapias e Abordagens',
  categoryColor: 'azul',
  content: '<p class="ql-align-center">Corpo</p><p><br></p>',
  excerpt: 'Resumo.',
  coverImage: 'https://img/capa.png',
  metaDescription: 'Meta.',
  seoTitle: 'Novo Post | HD360',
  ogImage: 'https://img/og.png',
  focusKeyword: 'autismo',
  tags: ['TEA', 'Família'],
  status: 'draft',
};

test('buildPayload achata o form para colunas do banco e limpa o content', () => {
  const row = buildPayload(form);
  assert.equal(row.title, 'Novo Post');
  assert.equal(row.slug, 'novo-post');
  assert.equal(row.category_name, 'Terapias e Abordagens');
  assert.equal(row.category_color, 'azul');
  assert.equal(row.content, '<p>Corpo</p>'); // normalizado
  assert.equal(row.cover_image, 'https://img/capa.png');
  assert.equal(row.meta_description, 'Meta.');
  assert.equal(row.seo_title, 'Novo Post | HD360');
  assert.equal(row.og_image, 'https://img/og.png');
  assert.equal(row.focus_keyword, 'autismo');
  assert.deepEqual(row.tags, ['TEA', 'Família']);
  assert.equal(row.status, 'draft');
  // não manda chaves camelCase nem id
  assert.equal('categoryName' in row, false);
  assert.equal('id' in row, false);
});

test('buildPayload tolera campos ausentes', () => {
  const row = buildPayload({ title: 'X', slug: 'x', categoryName: 'Histórias HD360', categoryColor: 'amarelo' });
  assert.equal(row.cover_image, '');
  assert.deepEqual(row.tags, []);
  assert.equal(row.status, 'draft'); // default seguro
  assert.equal(row.content, '');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test painel/test/post-payload.test.js`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `post-payload.js`**

Criar `painel/lib/post-payload.js`:

```js
import { normalizeEditorHtml } from './clean-html.js';

// Estado do formulário (camelCase) -> linha da tabela `posts` (snake_case).
// status default 'draft' (seguro: nada vai pro ar sem escolha explícita).
export function buildPayload(form = {}) {
  return {
    slug: form.slug || '',
    title: form.title || '',
    category_name: form.categoryName || '',
    category_color: form.categoryColor || '',
    cover_image: form.coverImage || '',
    excerpt: form.excerpt || '',
    content: normalizeEditorHtml(form.content || ''),
    meta_description: form.metaDescription || '',
    seo_title: form.seoTitle || '',
    og_image: form.ogImage || '',
    focus_keyword: form.focusKeyword || '',
    tags: Array.isArray(form.tags) ? form.tags : [],
    status: form.status === 'published' ? 'published' : 'draft',
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test painel/test/post-payload.test.js`
Expected: PASS (2 testes).

- [ ] **Step 5: Rodar a suíte inteira do painel**

Run: `node --test painel/test/*.test.js`
Expected: PASS — slug, clean-html, seo, post-payload (todos verdes).

- [ ] **Step 6: Commit**

```bash
git add painel/lib/post-payload.js painel/test/post-payload.test.js
git commit -m "feat(painel): buildPayload mapeia form para linha do banco (puro, testado)"
```

---

### Task 6: Client Supabase, gate de auth e shell do app

**Files:**
- Create: `painel/app.js`
- Create: `painel/screens/login.js`
- Create: `painel/lib/ui.js` (helpers de toast + escapeHtml, compartilhados)

> Integração: precisa da anon key na `config.js` (Task 1, Step 2) e do usuário admin (já criado no Plano 1). Verificação é manual no navegador.

- [ ] **Step 1: Helpers de UI compartilhados**

Criar `painel/lib/ui.js`:

```js
// Toast acessível (verde=ok, rosa=erro, azul=info). Some sozinho.
export function toast(message, kind = 'ok') {
  const host = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `<span class="toast__dot"></span>${escapeHtml(message)}`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// Escapa texto para inserção segura em HTML (títulos de posts vêm do usuário).
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
```

- [ ] **Step 2: Tela de login**

Criar `painel/screens/login.js`. Markup segue `hd360-painel/references/COMPONENTS.md §13`.

```js
import { toast } from '../lib/ui.js';

export function renderLogin(root, { onLogin }) {
  root.innerHTML = `
    <main class="login">
      <div class="login__blob" aria-hidden="true"></div>
      <form class="login__card" id="login-form">
        <img class="login__mark" src="../images/logo-3.png" alt="HD360" />
        <h1 class="login__title">Painel HD360</h1>
        <p class="login__sub">Entre para gerenciar o blog.</p>
        <div class="field">
          <label class="field__label" for="email">E-mail</label>
          <input class="input" id="email" type="email" autocomplete="username" required />
        </div>
        <div class="field">
          <label class="field__label" for="pw">Senha</label>
          <input class="input" id="pw" type="password" autocomplete="current-password" required />
        </div>
        <button class="btn btn--primary login__submit" type="submit">Entrar</button>
        <p class="login__err" id="login-err" role="alert" hidden>E-mail ou senha incorretos.</p>
      </form>
    </main>`;

  const form = root.querySelector('#login-form');
  const err = root.querySelector('#login-err');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#pw').value;
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      await onLogin(email, password);
    } catch (e2) {
      err.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
}
```

- [ ] **Step 3: Entrypoint `app.js` (client, gate, router, logout)**

Criar `painel/app.js`. Importa o Supabase do CDN ESM, decide login vs app pela sessão, monta a sidebar/topbar e roteia entre lista e editor por hash.

```js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { renderLogin } from './screens/login.js';
import { renderList } from './screens/list.js';
import { renderEditor } from './screens/editor.js';
import { toast } from './lib/ui.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginRoot = document.getElementById('login-root');
const appRoot = document.getElementById('app-root');

function shell(innerTitle) {
  appRoot.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <a class="sidebar__brand" href="#/posts">
          <img class="sidebar__mark" src="../images/logo-3.png" alt="HD360" />
          <span class="sidebar__word">Painel</span>
        </a>
        <nav class="sidebar__nav">
          <a class="navitem navitem--active" href="#/posts">Posts</a>
        </nav>
        <button class="navitem navitem--foot" type="button" id="logout">Sair</button>
      </aside>
      <div class="main">
        <header class="topbar">
          <h1 class="topbar__title" id="page-title">${innerTitle}</h1>
          <div class="topbar__actions">
            <!-- "Atualizar site" entra no Plano 3; placeholder desabilitado por ora -->
            <button class="btn btn--primary" disabled title="Disponível na próxima etapa">Atualizar site</button>
          </div>
        </header>
        <main class="work" id="work"></main>
      </div>
    </div>`;
  appRoot.querySelector('#logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
  return appRoot.querySelector('#work');
}

async function route() {
  const hash = location.hash || '#/posts';
  const work = shell('Posts');
  const titleEl = appRoot.querySelector('#page-title');
  if (hash.startsWith('#/editor')) {
    const id = new URLSearchParams(hash.split('?')[1] || '').get('id');
    titleEl.textContent = id ? 'Editar post' : 'Novo post';
    await renderEditor(work, { supabase, id });
  } else {
    titleEl.textContent = 'Posts';
    await renderList(work, { supabase });
  }
}

function showLogin() {
  appRoot.hidden = true;
  loginRoot.hidden = false;
  renderLogin(loginRoot, {
    onLogin: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
  });
}

function showApp() {
  loginRoot.hidden = true;
  appRoot.hidden = false;
  route();
}

window.addEventListener('hashchange', () => { if (!appRoot.hidden) route(); });

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) showApp(); else showLogin();
});

// Estado inicial
const { data } = await supabase.auth.getSession();
if (data.session) showApp(); else showLogin();
```

> `renderList` e `renderEditor` ainda não existem; crie stubs temporários que exportam funções vazias para o `app.js` carregar, ou implemente as Tasks 7–8 antes de testar a navegação. Sugestão: criar stubs agora (`export async function renderList(){}` e `export async function renderEditor(){}`) e substituí-los nas próximas tasks.

- [ ] **Step 4: Stubs temporários para carregar**

Criar `painel/screens/list.js` e `painel/screens/editor.js` com stubs:

```js
// list.js (stub — substituído na Task 7)
export async function renderList(work) { work.textContent = 'Lista (em construção)'; }
```
```js
// editor.js (stub — substituído na Task 8)
export async function renderEditor(work) { work.textContent = 'Editor (em construção)'; }
```

- [ ] **Step 5: Verificação manual do login**

Pré: anon key colada na `config.js`. Servir e abrir `http://localhost:8000/painel/`.

1. Sem sessão: aparece a tela de login com a marca (wordmark Barnacle Boy, blob suave).
2. Logar com o admin (`hd360.mkt@gmail.com` + senha definida no Supabase). Deve trocar pro shell do app (sidebar "Posts" + topbar) mostrando "Lista (em construção)".
3. Recarregar a página: continua logado (sessão persistida).
4. Clicar "Sair": volta pro login.
5. Tentar senha errada: mostra "E-mail ou senha incorretos." sem travar.

Expected: todos os 5 passos OK. Sem erros no console além de avisos esperados.

- [ ] **Step 6: Commit**

```bash
git add painel/app.js painel/screens/login.js painel/screens/list.js painel/screens/editor.js painel/lib/ui.js
git commit -m "feat(painel): client Supabase, gate de auth, shell e login"
```

---

### Task 7: Tela de lista de posts (tabela, filtro, excluir)

**Files:**
- Modify: `painel/screens/list.js` (substitui o stub)

> Integração: lê posts do Supabase (autenticado lê todos os status via RLS `posts_admin_all`). Markup segue `hd360-painel/references/COMPONENTS.md §4` (tabela), §3 (badge), §10 (modal de exclusão), §12 (empty/loading).

- [ ] **Step 1: Implementar a lista**

Substituir `painel/screens/list.js` por:

```js
import { escapeHtml, toast } from '../lib/ui.js';
import { COLOR_HEX } from '../config.js';

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export async function renderList(work, { supabase }) {
  work.innerHTML = `
    <div class="panel">
      <div class="panel__head">
        <div class="seg" role="tablist" aria-label="Filtrar por status">
          <button class="seg__btn seg__btn--on" data-filter="all" role="tab">Todos</button>
          <button class="seg__btn" data-filter="published" role="tab">Publicados</button>
          <button class="seg__btn" data-filter="draft" role="tab">Rascunhos</button>
        </div>
        <a class="btn btn--primary" href="#/editor">Novo post</a>
      </div>
      <div id="list-body"><div class="skel" aria-hidden="true">
        <span class="skel__row"></span><span class="skel__row"></span><span class="skel__row"></span>
      </div></div>
    </div>`;

  const body = work.querySelector('#list-body');
  let filter = 'all';

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id,slug,title,category_name,category_color,status,date,likes')
    .order('date', { ascending: false });

  if (error) {
    body.innerHTML = `<div class="state"><h2 class="state__title">Não deu para carregar</h2>
      <p class="state__sub">Tente recarregar a página.</p></div>`;
    toast('Erro ao carregar posts.', 'err');
    return;
  }

  function rowsHtml(list) {
    if (!list.length) {
      return `<div class="state">
        <img class="state__art" src="../images/Turminha/turma-acena.png" alt="" aria-hidden="true" />
        <h2 class="state__title">Nenhum post aqui</h2>
        <p class="state__sub">Quando você criar um post, ele aparece nesta lista.</p>
        <a class="btn btn--primary" href="#/editor">Escrever um post</a>
      </div>`;
    }
    const tr = list.map(p => `
      <tr>
        <td class="table__title">${escapeHtml(p.title)}</td>
        <td><span class="cat"><span class="cat__dot" style="background:${COLOR_HEX[p.category_color] || '#ccc'}"></span>${escapeHtml(p.category_name)}</span></td>
        <td>${badge(p.status)}</td>
        <td class="table__meta">${p.date ? DATE_FMT.format(new Date(p.date)) : ''}</td>
        <td class="table__num">${p.likes ?? 0}</td>
        <td class="table__actions">
          <a class="iconbtn" href="#/editor?id=${p.id}" aria-label="Editar">✎</a>
          <button class="iconbtn iconbtn--danger" data-del="${p.id}" data-title="${escapeHtml(p.title)}" aria-label="Excluir">🗑</button>
        </td>
      </tr>`).join('');
    return `<table class="table">
      <thead><tr><th>Título</th><th>Categoria</th><th>Status</th><th>Data</th><th class="table__num">Curtidas</th><th></th></tr></thead>
      <tbody>${tr}</tbody></table>`;
  }

  function draw() {
    const list = filter === 'all' ? posts : posts.filter(p => p.status === filter);
    body.innerHTML = rowsHtml(list);
    body.querySelectorAll('[data-del]').forEach(btn =>
      btn.addEventListener('click', () => confirmDelete(btn.dataset.del, btn.dataset.title)));
  }

  work.querySelectorAll('.seg__btn').forEach(b => b.addEventListener('click', () => {
    work.querySelectorAll('.seg__btn').forEach(x => x.classList.remove('seg__btn--on'));
    b.classList.add('seg__btn--on');
    filter = b.dataset.filter;
    draw();
  }));

  async function confirmDelete(id, title) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-t">
        <h2 class="modal__title" id="m-t">Excluir post?</h2>
        <p class="modal__body">Excluir “${escapeHtml(title)}”? Essa ação não pode ser desfeita.</p>
        <div class="modal__actions">
          <button class="btn btn--quiet" data-close>Cancelar</button>
          <button class="btn btn--danger" data-confirm>Excluir post</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-close]').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);} });
    overlay.querySelector('[data-confirm]').addEventListener('click', async () => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      close();
      if (error) { toast('Não deu para excluir.', 'err'); return; }
      const i = posts.findIndex(p => String(p.id) === String(id));
      if (i >= 0) posts.splice(i, 1);
      draw();
      toast('Post excluído.', 'ok');
    });
  }

  draw();
}

function badge(status) {
  return status === 'published'
    ? '<span class="badge badge--pub"><span class="badge__dot"></span>Publicado</span>'
    : '<span class="badge badge--draft"><span class="badge__dot"></span>Rascunho</span>';
}
```

> Os ícones de ação usam `✎`/`🗑` como placeholder textual; troque por SVGs inline (Lucide/Phosphor rounded, 2px) conforme a skill quando integrar os ícones reais. Emoji não fica em chrome definitivo (regra da marca), então isto é só andaime até os SVGs.

- [ ] **Step 2: Verificação manual da lista**

Servir, logar, abrir `#/posts`.
1. A tabela carrega os 23 posts (semeados no Plano 1), ordenados por data desc, todos com badge "Publicado".
2. Filtro "Rascunhos" mostra vazio (empty state); "Todos" volta a mostrar tudo.
3. Cada linha mostra título, categoria com bolinha na cor certa, status, data pt-BR, curtidas.
4. "Excluir" abre o modal; "Cancelar"/Esc/click fora fecham sem excluir.
5. Confirmar exclusão remove a linha e mostra toast "Post excluído." (recarregar confirma que sumiu do banco). **Cuidado: isto exclui de verdade. Crie um post de teste antes, ou pule a confirmação real até a Task 8.**

Expected: 1–4 OK. Para o 5, prefira testar exclusão depois de criar um post descartável na Task 8.

- [ ] **Step 3: Commit**

```bash
git add painel/screens/list.js
git commit -m "feat(painel): tela de lista de posts (tabela, filtro de status, excluir)"
```

---

### Task 8: Editor de post (Quill, campos, SEO, tags, salvar, prévia)

**Files:**
- Modify: `painel/screens/editor.js` (substitui o stub)

> A peça maior. Integração: Quill (CDN global `window.Quill`), campos, slug automático, tags em chips, painel SEO ao vivo (usa `metaState`/`serp`), salvar (usa `buildPayload`) como rascunho ou publicado, prévia. Upload de capa/imagem fica na Task 9 (aqui deixamos os ganchos). Markup segue `hd360-painel/references/COMPONENTS.md` §5 (campos), §6 (chips), §7 (editor), §8 (dropzone), §9 (SERP), §2 (botões).

- [ ] **Step 0: Stub de `upload.js` (para o import do editor resolver)**

O editor importa `../lib/upload.js`, que só é implementado de verdade na Task 9. Para o módulo carregar agora sem quebrar, criar um stub mínimo em `painel/lib/upload.js`:

```js
// Stub temporário — implementação real na Task 9.
export async function uploadImage() {
  throw new Error('Upload disponível na Task 9.');
}
```

> Como o upload só é acionado por clique (capa/imagem da toolbar), o stub não atrapalha o teste dos demais campos na Task 8; tentar subir uma imagem só mostra um toast de erro até a Task 9.

- [ ] **Step 1: Implementar o editor**

Substituir `painel/screens/editor.js` por:

```js
import { escapeHtml, toast } from '../lib/ui.js';
import { CATEGORIES, COLOR_HEX } from '../config.js';
import { slugify } from '../lib/slug.js';
import { metaState, serp } from '../lib/seo.js';
import { buildPayload } from '../lib/post-payload.js';
// uploadImage é integrado na Task 9:
import { uploadImage } from '../lib/upload.js';

export async function renderEditor(work, { supabase, id }) {
  // Estado de edição: carrega o post se houver id.
  let existing = null;
  if (id) {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error || !data) { toast('Post não encontrado.', 'err'); location.hash = '#/posts'; return; }
    existing = data;
  }

  const tags = new Set(existing?.tags || []);
  let slugTouched = !!existing; // em edição não regerar slug automaticamente
  let coverImage = existing?.cover_image || '';

  work.innerHTML = `
    <form id="editor" class="editor-grid">
      <section class="panel panel--pad">
        <p class="eyebrow">Conteúdo</p>
        <div class="field">
          <label class="field__label" for="f-title">Título</label>
          <input class="input" id="f-title" type="text" value="${escapeHtml(existing?.title || '')}" />
        </div>
        <div class="field">
          <span class="field__label">Texto</span>
          <div class="editor"><div id="quill"></div></div>
        </div>
        <div class="field">
          <span class="field__label">Imagem de capa</span>
          <div id="cover-slot"></div>
        </div>
      </section>

      <section class="panel panel--pad">
        <p class="eyebrow">Organização</p>
        <div class="field">
          <label class="field__label" for="f-cat">Categoria</label>
          <select class="input" id="f-cat">
            ${CATEGORIES.map(c => `<option value="${c.name}" data-color="${c.color}" ${existing?.category_name===c.name?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <span class="field__label">Tags</span>
          <div class="chips" id="chips">
            <input class="chips__input" id="chip-input" placeholder="Adicionar tag…" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="f-slug">Slug (URL)</label>
          <input class="input" id="f-slug" type="text" value="${escapeHtml(existing?.slug || '')}" />
          <p class="field__help">Mudar o endereço muda a URL e pode afetar o SEO.</p>
        </div>
      </section>

      <section class="panel panel--pad">
        <p class="eyebrow">SEO</p>
        <div class="field">
          <label class="field__label" for="f-seotitle">Título de SEO</label>
          <input class="input" id="f-seotitle" type="text" value="${escapeHtml(existing?.seo_title || '')}" />
        </div>
        <div class="field">
          <label class="field__label" for="f-meta">Meta description</label>
          <textarea class="input" id="f-meta" rows="3">${escapeHtml(existing?.meta_description || '')}</textarea>
          <p class="field__help"><span class="counter" id="meta-count">0</span>/160 caracteres</p>
        </div>
        <div class="field">
          <label class="field__label" for="f-kw">Palavra-chave foco</label>
          <input class="input" id="f-kw" type="text" value="${escapeHtml(existing?.focus_keyword || '')}" />
        </div>
        <div class="field">
          <label class="field__label" for="f-excerpt">Resumo (excerpt)</label>
          <textarea class="input" id="f-excerpt" rows="2">${escapeHtml(existing?.excerpt || '')}</textarea>
        </div>
        <div class="serp" id="serp"></div>
      </section>

      <div class="editor-actions">
        <button class="btn btn--quiet" type="button" id="btn-preview">Ver prévia</button>
        <button class="btn btn--ghost" type="button" id="btn-draft">Salvar rascunho</button>
        <button class="btn btn--primary" type="button" id="btn-publish">Publicar</button>
      </div>
    </form>`;

  // --- Quill ---
  const quill = new window.Quill('#quill', {
    theme: 'snow',
    modules: { toolbar: [
      ['bold', 'italic'], [{ header: 2 }, { header: 3 }],
      [{ list: 'bullet' }], ['blockquote', 'link', 'image'],
    ] },
  });
  if (existing?.content) quill.clipboard.dangerouslyPasteHTML(existing.content);

  // Handler de imagem inline (Task 9 implementa uploadImage).
  quill.getModule('toolbar').addHandler('image', () => pickImage(async (file) => {
    const url = await uploadImage(supabase, file);
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'image', url, 'user');
  }));

  // --- Campos ---
  const $ = sel => work.querySelector(sel);
  const titleEl = $('#f-title'), slugEl = $('#f-slug'), catEl = $('#f-cat');
  const seoTitleEl = $('#f-seotitle'), metaEl = $('#f-meta'), excerptEl = $('#f-excerpt');

  titleEl.addEventListener('input', () => {
    if (!slugTouched) slugEl.value = slugify(titleEl.value);
    refreshSerp();
  });
  slugEl.addEventListener('input', () => { slugTouched = true; refreshSerp(); });
  seoTitleEl.addEventListener('input', refreshSerp);
  excerptEl.addEventListener('input', refreshSerp);
  metaEl.addEventListener('input', () => { refreshMeta(); refreshSerp(); });

  function refreshMeta() {
    const { count, level } = metaState(metaEl.value);
    const c = $('#meta-count'); c.textContent = count;
    c.style.color = level === 'over' ? 'var(--rosa-ink)' : level === 'ok' ? 'var(--verde-ink)' : 'var(--tinta-muted)';
  }
  function refreshSerp() {
    const s = serp({ title: titleEl.value, slug: slugEl.value, seoTitle: seoTitleEl.value, metaDescription: metaEl.value, excerpt: excerptEl.value });
    $('#serp').innerHTML = `<span class="serp__url">${escapeHtml(s.url)}</span>
      <span class="serp__title">${escapeHtml(s.title)}</span>
      <span class="serp__desc">${escapeHtml(s.desc)}</span>`;
  }

  // --- Tags (chips) ---
  const chips = $('#chips'), chipInput = $('#chip-input');
  function drawChips() {
    chips.querySelectorAll('.chip').forEach(c => c.remove());
    [...tags].forEach(t => {
      const el = document.createElement('span');
      el.className = 'chip';
      el.innerHTML = `${escapeHtml(t)}<button type="button" class="chip__x" aria-label="Remover ${escapeHtml(t)}">×</button>`;
      el.querySelector('.chip__x').addEventListener('click', () => { tags.delete(t); drawChips(); });
      chips.insertBefore(el, chipInput);
    });
  }
  chipInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const v = chipInput.value.trim().replace(/,$/, '');
      if (v) { tags.add(v); chipInput.value = ''; drawChips(); }
    } else if (e.key === 'Backspace' && !chipInput.value && tags.size) {
      const last = [...tags].pop(); tags.delete(last); drawChips();
    }
  });
  drawChips();

  // --- Capa (dropzone; upload real na Task 9) ---
  renderCover();
  function renderCover() {
    const slot = $('#cover-slot');
    if (coverImage) {
      slot.innerHTML = `<figure class="cover"><img class="cover__img" src="${escapeHtml(coverImage)}" alt="Prévia da capa" />
        <div class="cover__bar"><button class="btn btn--quiet" type="button" id="cover-change">Trocar</button>
        <button class="btn btn--danger" type="button" id="cover-remove">Remover</button></div></figure>`;
      slot.querySelector('#cover-remove').addEventListener('click', () => { coverImage = ''; renderCover(); });
      slot.querySelector('#cover-change').addEventListener('click', chooseCover);
    } else {
      slot.innerHTML = `<button type="button" class="dropzone" id="cover-pick">
        <span class="dropzone__t">Clique para enviar a capa</span>
        <span class="dropzone__hint">JPG ou PNG, 16:9 recomendado</span></button>`;
      slot.querySelector('#cover-pick').addEventListener('click', chooseCover);
    }
  }
  function chooseCover() {
    pickImage(async (file) => {
      try { coverImage = await uploadImage(supabase, file); renderCover(); }
      catch { toast('Falha no upload da capa.', 'err'); }
    });
  }

  // --- Salvar ---
  async function save(status) {
    const selected = catEl.options[catEl.selectedIndex];
    const form = {
      title: titleEl.value.trim(),
      slug: (slugEl.value.trim() || slugify(titleEl.value)),
      categoryName: catEl.value,
      categoryColor: selected.dataset.color,
      content: quill.root.innerHTML,
      excerpt: excerptEl.value.trim(),
      coverImage,
      metaDescription: metaEl.value.trim(),
      seoTitle: seoTitleEl.value.trim(),
      ogImage: existing?.og_image || coverImage,
      focusKeyword: $('#f-kw').value.trim(),
      tags: [...tags],
      status,
    };
    if (!form.title) { toast('Dê um título ao post.', 'err'); return; }
    if (!form.slug) { toast('O slug ficou vazio.', 'err'); return; }
    const payload = buildPayload(form);

    let res;
    if (existing) res = await supabase.from('posts').update(payload).eq('id', existing.id);
    else res = await supabase.from('posts').insert(payload);

    if (res.error) {
      toast(res.error.code === '23505' ? 'Já existe um post com esse slug.' : 'Não deu para salvar.', 'err');
      return;
    }
    toast(status === 'published' ? 'Post publicado.' : 'Rascunho salvo.', 'ok');
    location.hash = '#/posts';
  }

  $('#btn-draft').addEventListener('click', () => save('draft'));
  $('#btn-publish').addEventListener('click', () => save('published'));
  $('#btn-preview').addEventListener('click', () => openPreview(titleEl.value, quill.root.innerHTML, coverImage));

  refreshMeta(); refreshSerp();
}

// Abre um seletor de arquivo de imagem e chama back(file).
function pickImage(back) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.addEventListener('change', () => { if (input.files[0]) back(input.files[0]); });
  input.click();
}

// Prévia simples num overlay, com a tipografia do post.
function openPreview(title, html, cover) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal" style="width:min(760px,100%);max-height:86vh;overflow:auto;text-align:left">
    ${cover ? `<img src="${cover}" alt="" style="width:100%;border-radius:var(--r-md);margin-bottom:16px" />` : ''}
    <h1 style="font-family:var(--font-display);font-weight:400;font-size:30px;margin:0 0 16px">${escapeHtml(title || 'Sem título')}</h1>
    <div class="editor__body" style="padding:0">${html}</div>
    <div class="modal__actions" style="margin-top:20px"><button class="btn btn--quiet" data-close>Fechar</button></div>
  </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('[data-close]').addEventListener('click', close);
}
```

- [ ] **Step 2: CSS do grid do editor**

Adicionar ao fim de `painel/styles.css` (o resto dos componentes já veio da skill na Task 1):

```css
.editor-grid{ display:grid; grid-template-columns:1fr; gap:18px; }
.editor-grid .panel--pad{ margin:0; }
@media (min-width:1000px){
  .editor-grid{ grid-template-columns:1.6fr 1fr; grid-auto-flow:row dense; }
  .editor-grid > section:nth-child(1){ grid-row:span 2; } /* Conteúdo ocupa a coluna esquerda */
  .editor-actions{ grid-column:1 / -1; }
}
.editor-actions{ display:flex; justify-content:flex-end; gap:10px; padding-top:4px; }
/* Harmoniza a toolbar do Quill com a chrome da marca */
.ql-toolbar.ql-snow{ border:0; border-bottom:1px solid var(--linha); background:var(--creme); border-radius:0; }
.ql-container.ql-snow{ border:0; font-family:var(--font-body); font-size:16px; }
.ql-editor{ min-height:320px; }
```

- [ ] **Step 3: Verificação manual do editor (criar)**

Servir, logar, clicar "Novo post".
1. Digitar um título: o slug se preenche sozinho (sem acento, com hífens). Editar o slug à mão para de auto-gerar.
2. Escrever texto no editor, aplicar negrito/itálico, H2/H3, lista, citação, link. (Imagem: testa na Task 9.)
3. Escolher categoria; o SERP e a contagem de meta atualizam ao vivo (contador fica verde na faixa, vermelho acima de 160).
4. Adicionar 2–3 tags (Enter/vírgula), remover uma com o ×.
5. "Salvar rascunho": toast "Rascunho salvo.", volta pra lista; o post aparece com badge "Rascunho" (filtro "Rascunhos" mostra ele).
6. Abrir esse rascunho de novo: todos os campos vêm preenchidos, o slug **não** se regenera ao editar o título.
7. "Publicar": badge vira "Publicado".
8. Excluir o post de teste (fecha o ciclo da Task 7, Step 2.5).

Expected: 1–8 OK. Conferir no Supabase Table editor que o registro reflete o conteúdo e o `status`.

- [ ] **Step 4: Commit**

```bash
git add painel/screens/editor.js painel/styles.css
git commit -m "feat(painel): editor WYSIWYG com SEO, tags, slug e previa"
```

---

### Task 9: Upload de imagens pro Storage (capa + inline)

**Files:**
- Modify: `painel/lib/upload.js` (substitui o stub da Task 8)

> Integração: sobe o arquivo pro bucket público `blog-images` e devolve a **URL pública absoluta** (funciona em qualquer host, inclusive depois na ErêHost). Já está plugado no editor (capa e handler de imagem do Quill na Task 8).

- [ ] **Step 1: Implementar `upload.js` (substituindo o stub)**

Substituir `painel/lib/upload.js` por:

```js
import { STORAGE_BUCKET } from '../config.js';

// Sobe uma imagem pro bucket público e devolve a URL pública absoluta.
// Caminho com timestamp + nome higienizado evita colisão e mantém legível.
export async function uploadImage(supabase, file) {
  const safe = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase();
  const path = `posts/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
```

> Observação de RLS do Storage: o bucket `blog-images` é público para leitura; o upload exige usuário autenticado. Se o upload retornar 403, confira no Dashboard → Storage → Policies que há uma policy de `insert` para o role `authenticated` no bucket (criar uma vez, análoga à de escrita da tabela). Documente em `supabase/README.md` se precisar adicionar.

- [ ] **Step 2: Verificação manual do upload**

Servir, logar, abrir o editor.
1. Na capa, clicar "Clique para enviar a capa", escolher um JPG/PNG: aparece a prévia da capa; "Trocar"/"Remover" funcionam.
2. No editor, botão de imagem da toolbar: escolher um arquivo insere a imagem no texto pela URL do Supabase (não base64).
3. Salvar e reabrir: a capa e a imagem inline persistem (URLs absolutas do Supabase no `content`/`cover_image`).
4. Conferir no Dashboard → Storage → `blog-images/posts/`: os arquivos estão lá.

Expected: 1–4 OK. Se der 403 no upload, aplicar a policy de insert do Storage (Step 1, observação) e repetir.

- [ ] **Step 3: Commit**

```bash
git add painel/lib/upload.js
git commit -m "feat(painel): upload de imagens (capa e inline) pro Storage"
```

---

### Task 10: Passe final de verificação e ajustes

**Files:**
- Modify: conforme necessário (ícones SVG, ajustes de copy/contraste)

- [ ] **Step 1: Trocar emojis placeholder por SVGs da marca**

Em `painel/screens/list.js`, substituir os `✎`/`🗑` dos `iconbtn` por SVGs inline rounded (Lucide/Phosphor, `stroke="currentColor"`, 2px, linecaps round), conforme `hd360-painel/references/COMPONENTS.md` (iconografia). Emoji não fica em chrome definitivo (regra da marca).

- [ ] **Step 2: Rodar a suíte de testes do painel inteira**

Run: `node --test painel/test/*.test.js`
Expected: PASS — slug, clean-html, seo, post-payload (todos verdes).

- [ ] **Step 3: Garantir que o build do site segue intacto**

Run: `node --test tools/blog-migration/test/*.test.mjs`
Then: `node tools/blog-migration/build.mjs` e `git status --porcelain`.
Expected: testes da Fase 1/Plano 1 verdes; o build (a partir do JSON, sem env vars) não muda nenhum HTML commitado (`git status` limpo, fora os arquivos do painel). O painel é uma área nova e **não** altera o build.

- [ ] **Step 4: Checklist de verificação do Plano 2 (manual, no navegador)**

Servir e logar. Confirmar, na ordem:
1. Sem sessão não acessa o CRUD; com login (Supabase Auth) entra no painel; "Sair" encerra.
2. Lista mostra os posts do Supabase com categoria/cor, status, data, curtidas; filtro por status funciona.
3. Criar post no editor WYSIWYG, com capa + imagem inline (Storage), salvar como **rascunho**: aparece na lista como rascunho.
4. Marcar como **publicado**: badge muda; o registro no Supabase fica `status=published`.
5. Editar tags/SEO de um post e salvar reflete no banco; o slug não se regenera ao editar título de um post existente.
6. Excluir um post (modal de confirmação) remove do banco e da lista.
7. Identidade HD360 presente (skill `hd360-painel`): wordmark, cores codificadas, badges, cantos arredondados, foco visível, registro calmo/denso. **Sem travessões** em nenhuma copy.
8. Acessibilidade: navegação por teclado do login → lista → editor; foco visível; toasts anunciados; modal fecha com Esc.

> O botão "Atualizar site" está como placeholder **desabilitado** de propósito: o gatilho de rebuild é o Plano 3. Salvar/publicar grava no Supabase mas **não** regenera o site ainda, exatamente como a decisão 7 do spec prevê.

- [ ] **Step 5: Commit final**

```bash
git add painel/
git commit -m "feat(painel): passe final, icones SVG e verificacao do painel admin"
```

---

## Verificação do Plano 2

1. `node --test painel/test/*.test.js` — lógica pura (slug, clean-html, seo, post-payload) toda verde.
2. `node --test tools/blog-migration/test/*.test.mjs` — Fase 1/Plano 1 intactos.
3. Login Supabase Auth funciona; sem sessão não há CRUD.
4. Lista lê do Supabase, filtra por status, exclui com confirmação.
5. Editor cria/edita post com WYSIWYG, slug automático, tags curadas, painel de SEO ao vivo (contador + prévia SERP), upload de capa e imagem inline pro Storage (URLs absolutas), salvar como rascunho ou publicado, prévia.
6. Identidade HD360 pela skill `hd360-painel` (registro calmo/produtivo, não o joyful do site público). Sem travessões.
7. O build do site segue inalterado; o painel não toca no pipeline (rebuild é Plano 3).

## Próximos planos da Fase 2
- **Plano 3** — Pipeline de publicação: Edge Function (`repository_dispatch` com PAT), workflow `publish-blog.yml`, e o botão "Atualizar site" + indicador "alterações não publicadas" (ativar o placeholder do shell, `hd360-painel/references/COMPONENTS.md §14`).
- **Plano 4** — Curtidas no público: widget de coração no `/<slug>/`, chamada a `increment_likes`, de-dup por `localStorage`, número inicial renderizado no build.
