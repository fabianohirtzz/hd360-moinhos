# Blog Fase 2 — Plano 4: Curtidas no público

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar task a task. Steps usam checkbox (`- [ ]`).
>
> **REQUIRED DESIGN SKILL:** O botão de coração aparece no **site público** (página de post), então segue `hd360-design` (a marca joyful), NÃO a `hd360-painel`. Leia `.claude/skills/hd360-design/` antes de escrever o CSS.

**Goal:** Adicionar curtidas anônimas às páginas de post (`/<slug>/`): um botão de coração que chama `increment_likes(slug)` no Supabase, mostra o total ao vivo, e usa `localStorage` para não recontar a mesma pessoa (e manter o coração ativo ao voltar). O número inicial vem renderizado no build.

**Architecture:** A página de post é estática (SEO intacto). O coração é um widget no sidebar do post (hoje o slot "Curtidas e comentários · Em breve"). O runtime `assets/js/likes.js` (módulo ES, zero dependência) chama a **REST/RPC do Supabase via `fetch`** com a anon key (pública, segura: `increment_likes` é `SECURITY DEFINER` e só incrementa publicados; a leitura do total usa o `select` público de posts publicados). A decisão "já curtiu?" é uma função pura testável (`node:test`), graças a um `assets/js/package.json` com `"type":"module"` (escopado, não afeta o root `commonjs` nem o `main.js` clássico). O renderizador `render-post-page.mjs` injeta o markup do coração (com o total inicial) e a tag do script.

**Tech Stack:** HTML/CSS/JS ESM no browser (`fetch` nativo) · Supabase (PostgREST + a função `increment_likes` já criada no Plano 1) · `node:test` para a lógica pura · build estático existente.

**O que já existe (Plano 1):** `increment_likes(p_slug text)` `SECURITY DEFINER` com `grant execute ... to anon`; policy `posts_public_read` (leitura pública só de `published`). Nada de SQL novo neste plano.

**Endpoints usados pelo browser:**
- Ler total: `GET {SUPABASE_URL}/rest/v1/posts?slug=eq.<slug>&select=likes` (header `apikey: <anon>`).
- Curtir: `POST {SUPABASE_URL}/rest/v1/rpc/increment_likes` body `{"p_slug":"<slug>"}` (headers `apikey`, `Content-Type: application/json`) → devolve o novo total (inteiro).
- O REST do Supabase libera CORS por padrão (diferente das Edge Functions), então `fetch` do navegador funciona local e em produção.

**Estrutura de arquivos:**
```
assets/js/
├── package.json   # { "type": "module" } — torna likes.js ESM testável (não afeta main.js clássico)
└── likes.js       # runtime do coração + funções puras de dedup (exportadas p/ teste)
assets/css/main.css           # estilos do botão de coração (hd360-design)
tools/blog-migration/lib/render-post-page.mjs   # widgetSoon -> widgetLikes + tag do script
tools/blog-migration/test/likes-store.test.mjs  # testes das funções puras
tools/blog-migration/test/render-post-page.test.mjs  # +1 assert do widget
```

Rodar os testes: `node --test tools/blog-migration/test/*.test.mjs` (o glob pega o novo `likes-store.test.mjs`).

---

### Task 1: Runtime do coração + funções puras de dedup

**Files:**
- Create: `assets/js/package.json`
- Create: `assets/js/likes.js`
- Test: `tools/blog-migration/test/likes-store.test.mjs`

- [ ] **Step 1: `assets/js/package.json` (escopa ESM aos scripts do site)**

Criar `assets/js/package.json`:

```json
{
  "name": "hd360-assets-js",
  "private": true,
  "type": "module"
}
```

> Isso faz o Node tratar `assets/js/likes.js` como módulo ES (importável por `node:test`). O `main.js` continua carregado como `<script>` clássico no browser, que ignora o `package.json` — nada muda nele.

- [ ] **Step 2: Escrever o teste que falha (funções puras de dedup)**

Criar `tools/blog-migration/test/likes-store.test.mjs`:

```js
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
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/likes-store.test.mjs`
Expected: FAIL — `Cannot find module '../../../assets/js/likes.js'`.

- [ ] **Step 4: Implementar `assets/js/likes.js`**

Criar `assets/js/likes.js`:

```js
// Curtidas anônimas do blog HD360. Módulo ES: as funções puras são testadas no Node;
// o runtime só roda no navegador (guardado por `typeof document`).
// A anon key é pública por design (RLS + increment_likes SECURITY DEFINER no banco).
const SUPABASE_URL = 'https://euzmbswywwhmicjlszqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1em1ic3d5d3dobWljamxzenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDEyODYsImV4cCI6MjA5NjAxNzI4Nn0.oSIv6fSKVxO9Umuii6xt98cT0yoSqepTIzVCdcocfuU';
const STORAGE_KEY = 'hd360_liked';

// ---- Funções puras (testáveis) ----
export function readLiked(raw) {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
export function hasLiked(slug, list) {
  return (list || []).includes(slug);
}
export function addLiked(slug, list) {
  return [...new Set([...(list || []), slug])];
}

// ---- Acesso ao Supabase (REST/RPC, zero dependência) ----
async function fetchLikes(slug) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=likes`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ? rows[0].likes : null;
  } catch { return null; }
}

async function sendLike(slug) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_likes`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
    });
    if (!res.ok) return null;
    return await res.json(); // o RPC devolve o novo total (inteiro)
  } catch { return null; }
}

// ---- Runtime (só no navegador) ----
function initLikes() {
  const root = document.querySelector('[data-like]');
  if (!root) return;
  const slug = root.dataset.like;
  const btn = root.querySelector('.like__btn');
  const countEl = root.querySelector('.like__count');

  const markLiked = () => { btn.classList.add('is-liked'); btn.setAttribute('aria-pressed', 'true'); };
  const alreadyLiked = () => hasLiked(slug, readLiked(localStorage.getItem(STORAGE_KEY)));

  if (alreadyLiked()) markLiked();

  // Atualiza o total ao vivo (o número do build pode estar defasado).
  fetchLikes(slug).then(n => { if (n != null) countEl.textContent = n; });

  btn.addEventListener('click', async () => {
    if (alreadyLiked()) return;          // de-dup: uma curtida por pessoa/navegador
    btn.disabled = true;
    const n = await sendLike(slug);
    btn.disabled = false;
    if (n == null) return;               // falhou: não marca como curtido
    countEl.textContent = n;
    markLiked();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addLiked(slug, readLiked(localStorage.getItem(STORAGE_KEY)))));
  });
}

if (typeof document !== 'undefined') initLikes();
```

- [ ] **Step 5: Rodar e ver passar**

Run: `node --test tools/blog-migration/test/likes-store.test.mjs`
Expected: PASS (3 testes). O `if (typeof document...)` impede o runtime de rodar no Node.

- [ ] **Step 6: Commit**

```bash
git add assets/js/package.json assets/js/likes.js tools/blog-migration/test/likes-store.test.mjs
git commit -m "feat(blog): runtime de curtidas + funcoes puras de dedup (testadas)"
```

---

### Task 2: Estilos do botão de coração (hd360-design)

**Files:**
- Modify: `assets/css/main.css`

> Marca pública (joyful): pílula arredondada, cor codificada **rosa** (acolhimento/carinho), coração que preenche ao curtir, sombra suave colorida, motion calmo com `prefers-reduced-motion`. Nada de cores frias ou cantos retos.

- [ ] **Step 1: Acrescentar os estilos ao fim de `assets/css/main.css`**

```css
/* ============================ Curtidas (página de post) */
.like{ display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
.like__btn{
  display:inline-flex; align-items:center; gap:10px;
  padding:10px 18px; border-radius:999px; cursor:pointer;
  font-family:var(--font-body, "Montserrat", sans-serif); font-size:15px; font-weight:600;
  color:var(--rosa-ink, #c01b40); background:var(--rosa-soft, #FEE4EA);
  border:1px solid transparent;
  transition:transform .25s var(--ease-bounce, cubic-bezier(.34,1.4,.5,1)), box-shadow .25s ease, background .2s ease;
}
.like__btn:hover{ transform:translateY(-2px) scale(1.03); box-shadow:0 10px 24px rgba(251,60,99,.22); }
.like__btn:focus-visible{ outline:3px solid var(--rosa, #FB3C63); outline-offset:3px; }
.like__heart{ width:20px; height:20px; fill:none; stroke:var(--rosa, #FB3C63); stroke-width:2; transition:fill .2s ease, transform .25s var(--ease-bounce, cubic-bezier(.34,1.4,.5,1)); }
.like__count{ font-variant-numeric:tabular-nums; min-width:1ch; }
.like__hint{ font-size:13px; color:var(--tinta-muted, #6b6577); }
.like__btn.is-liked{ background:var(--rosa, #FB3C63); color:#fff; cursor:default; }
.like__btn.is-liked .like__heart{ fill:#fff; stroke:#fff; transform:scale(1.12); }
.like__btn.is-liked:hover{ transform:none; box-shadow:none; }
@media (prefers-reduced-motion:reduce){
  .like__btn, .like__heart{ transition:none; }
  .like__btn:hover{ transform:none; }
}
```

> Os tokens (`--rosa`, `--rosa-soft`, `--rosa-ink`, `--tinta-muted`, `--ease-bounce`, `--font-body`) já existem no `:root` do `main.css` (ver `hd360-design`); os fallbacks no `var(...)` são só rede de segurança.

- [ ] **Step 2: Commit**

```bash
git add assets/css/main.css
git commit -m "style(blog): botao de coracao das curtidas (hd360-design)"
```

---

### Task 3: Renderizador injeta o coração + a tag do script

**Files:**
- Modify: `tools/blog-migration/lib/render-post-page.mjs`
- Modify: `tools/blog-migration/test/render-post-page.test.mjs`

- [ ] **Step 1: Adicionar o teste que falha (o widget renderiza com slug e total)**

Acrescentar ao `tools/blog-migration/test/render-post-page.test.mjs` (dentro do bloco de testes; usa o `post` de fixture já existente no arquivo, que tem `slug`). Adicionar um teste novo:

```js
test('renderPostPage injeta o widget de curtidas com slug e total inicial', () => {
  const out = renderPostPage({ ...post, likes: 7 }, [], []);
  assert.match(out, /data-like="o-que-esperar-da-clinica"/); // o slug do fixture
  assert.match(out, /class="like__count">7</);
  assert.match(out, /assets\/js\/likes\.js/);
  assert.doesNotMatch(out, /Em breve você vai poder curtir/); // o slot antigo saiu
});
```

> Ajuste o slug esperado para o `slug` do `post` de fixture do arquivo, e garanta que `renderPostPage` está importado no teste (já está). Se o fixture não tiver `likes`, o spread `{ ...post, likes: 7 }` cobre.

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/render-post-page.test.mjs`
Expected: FAIL — ainda renderiza o widget "Em breve", sem `data-like` nem o script.

- [ ] **Step 3: Trocar `widgetSoon` por `widgetLikes` no renderizador**

Em `tools/blog-migration/lib/render-post-page.mjs`, substituir a função `widgetSoon` (linhas ~84-89) por:

```js
function widgetLikes(post) {
  const slug = esc(post.slug);
  const likes = Number(post.likes) || 0;
  return `<section class="side-card">
      <h4 class="side-card__title">Curtidas</h4>
      <div class="like" data-like="${slug}">
        <button class="like__btn" type="button" aria-pressed="false" aria-label="Curtir este post">
          <svg class="like__heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.2 5c2 0 3.3 1.1 4.1 2.3.4.6.7.6 1.4.6h2.6c.7 0 1-.0 1.4-.6C16.5 6.1 17.8 5 19.8 5 23 5 24.6 8.4 22 11.7 19.5 16.4 12 21 12 21z" stroke-linejoin="round"/></svg>
          <span class="like__count">${likes}</span>
        </button>
        <span class="like__hint">Gostou? Deixe seu coração.</span>
      </div>
    </section>`;
}
```

E na função `sidebar(post, recentPosts)` (linhas ~91-98), trocar `widgetSoon(),` por `widgetLikes(post),`:

```js
function sidebar(post, recentPosts) {
  return [
    widgetCategories(post),
    widgetTags(post),
    widgetRecent(recentPosts),
    widgetLikes(post),
  ].filter(Boolean).join('\n    ');
}
```

- [ ] **Step 4: Adicionar a tag do script `likes.js` no rodapé da página**

Em `render-post-page.mjs`, achar a linha que injeta o `main.js` (`<script src="../assets/js/main.js"></script>`, ~linha 276) e acrescentar logo abaixo:

```js
  <script type="module" src="../assets/js/likes.js"></script>
```

(No template literal do HTML; manter a indentação do arquivo. Módulos já são `defer` por padrão, então rodam após o DOM.)

- [ ] **Step 5: Rodar e ver passar**

Run: `node --test tools/blog-migration/test/render-post-page.test.mjs`
Expected: PASS (incluindo o novo teste do widget).

- [ ] **Step 6: Suíte inteira do tooling**

Run: `node --test tools/blog-migration/test/*.test.mjs`
Expected: tudo verde (Fase 1 + prune + likes-store + render atualizado).

- [ ] **Step 7: Commit**

```bash
git add tools/blog-migration/lib/render-post-page.mjs tools/blog-migration/test/render-post-page.test.mjs
git commit -m "feat(blog): pagina de post renderiza o coracao de curtidas"
```

---

### Task 4: Rebuild, verificação e publicação

**Files:** nenhum (build + verificação)

- [ ] **Step 1: Rebuild das páginas (lê do JSON local, sem env vars)**

Run: `node tools/blog-migration/build.mjs`
Expected: regenera as 23 páginas de post agora com o widget de coração; `assets/blog/generated-slugs.json` igual (mesmos slugs).

- [ ] **Step 2: Conferir o HTML gerado**

Run: `node --check assets/js/likes.js` (sintaxe do módulo) e abrir uma página gerada para conferência rápida.
Expected: cada `/<slug>/index.html` contém `data-like="<slug>"`, `class="like__count">N<` e `<script type="module" src="../assets/js/likes.js">`. O slot "Em breve" sumiu.

- [ ] **Step 3: Teste manual no navegador (precisa do banco)**

Servir (`node tools/blog-migration/serve.mjs`) e abrir uma página de post, ex.: `http://localhost:8000/o-que-esperar-da-clinica/`.
1. O coração aparece no sidebar com o total atual (atualizado ao vivo do Supabase).
2. Clicar: o número sobe 1, o coração preenche (fica rosa cheio), e o botão trava.
3. Recarregar a página: o coração continua ativo (localStorage) e o total reflete o novo valor.
4. Conferir no Supabase (Table editor → posts) que `likes` do post incrementou.
5. Tentar curtir de novo (mesmo navegador): não incrementa (de-dup por localStorage).
6. `prefers-reduced-motion`: sem animação de "pulo", só a mudança de cor.

- [ ] **Step 4: Commit do rebuild**

```bash
git add -A
git commit -m "build(blog): rebuild das paginas com o coracao de curtidas"
```

- [ ] **Step 5: Publicar pelo painel (fecha o ciclo da Fase 2)**

Com o pipeline do Plano 3 no ar: abrir `/painel/`, clicar **"Atualizar site"**. O rebuild no CI regenera as páginas (idênticas às locais) e publica. (Alternativa: o push da Task 4 já leva o HTML pro Pages, já que o build local e o do CI são equivalentes.)

- [ ] **Step 6: Atualizar a memória do projeto**

Registrar que a Fase 2 está **completa** (Planos 1 a 4); curtidas no ar.

---

## Verificação do Plano 4

1. Funções puras de dedup (`readLiked`/`hasLiked`/`addLiked`) testadas no `node:test`.
2. Página de post renderiza o coração com o total inicial e carrega `likes.js`.
3. Clicar chama `increment_likes` (anon), o total sobe e persiste; `localStorage` impede recontagem e mantém o coração ativo.
4. Total atualizado ao vivo na carga (não só o número do build).
5. SEO/estática intactos (o widget é progressivo: sem JS, a página segue válida, só sem interação).
6. Marca pública (hd360-design) no botão: rosa, arredondado, motion calmo, reduced-motion respeitado. Sem travessões.
7. Renderizadores e schema do Plano 1 intactos; suíte verde.

## Fase 2 — completa
- **Plano 1** Supabase como fonte de verdade + build adaptado.
- **Plano 2** Painel `/painel/` (login, CRUD, editor, SEO, tags, upload).
- **Plano 3** Pipeline "Atualizar site" (Edge Function + Action + rebuild + prune).
- **Plano 4** Curtidas anônimas no público.

Fora de escopo (futuro): comentários; multiusuário/papéis; agendamento; analytics.
