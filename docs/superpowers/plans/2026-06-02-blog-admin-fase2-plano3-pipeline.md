# Blog Fase 2 — Plano 3: Pipeline de publicação ("Atualizar site")

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **REQUIRED DESIGN SKILL:** Qualquer UI/copy do painel segue `hd360-painel` (`.claude/skills/hd360-painel/`). O controle "Atualizar site" + indicador de status tem anatomia em `references/COMPONENTS.md §14`.

**Goal:** Ligar o botão "Atualizar site" do painel a um rebuild real do site estático: o clique chama uma Edge Function do Supabase (que guarda o GitHub PAT) que dispara um `repository_dispatch`; um GitHub Actions roda o build lendo do Supabase, regenera o HTML (incluindo limpeza de posts excluídos) e commita na `main` (o Pages publica). O painel mostra "alterações não publicadas" e o ciclo "publicando… → site atualizado".

**Architecture:** Uma tabela `site_meta` (linha única) guarda o estado de publicação: `dirty` (há mudanças não publicadas, marcada por trigger em qualquer escrita na `posts`) e `publishing` (rebuild em andamento). O painel lê `site_meta` (RLS: leitura autenticada) pra decidir o indicador e o rótulo do botão. O clique invoca a Edge Function `publish` (verifica o JWT do admin, marca `publishing=true` com a service key, dispara o `repository_dispatch` com o PAT, que nunca chega ao cliente). O workflow `.github/workflows/publish-blog.yml` escuta o evento, roda `build.mjs` com a service key, **prune** dos diretórios de posts removidos (via manifesto de slugs gerados), commita o HTML e, ao final, atualiza `site_meta` (`dirty=false`, `publishing=false`) por REST com a service key. O painel faz polling de `site_meta.publishing` pra mostrar "site atualizado".

**Tech Stack:** Supabase (Postgres trigger + RLS + Edge Function Deno/TypeScript) · GitHub Actions (`repository_dispatch`, Node 20) · GitHub Pages (deploy from `main`) · painel vanilla (`@supabase/supabase-js` v2 já no projeto) · `node:test` para a lógica pura nova.

**Repo:** `fabianohirtzz/hd360-moinhos` · **Projeto Supabase:** `https://euzmbswywwhmicjlszqw.supabase.co`.

**Pré-requisitos de ambiente (peça ao usuário quando chegar nas tasks de integração):**
- **Task 1** (SQL) e **Task 4** (deploy da função + secret) precisam de acesso ao Dashboard/CLI do Supabase.
- **Task 3** precisa dos **secrets do GitHub Actions**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (a service role key, NÃO a anon).
- **Task 4** precisa do secret da função `GITHUB_PAT`: um **fine-grained PAT** com acesso ao repo `hd360-moinhos`, permissão **Contents: Read and write** (e Metadata: Read, obrigatória) — é o mínimo pra `repository_dispatch`.
- **Tasks 2 e 5** têm partes puras que rodam offline; o resto é verificado de ponta a ponta no fim.

**O que NÃO muda:** os renderizadores e a leitura do Supabase (`loadPosts`) do Plano 1 ficam intactos; o painel (Plano 2) só ganha a fiação do botão. O botão hoje é um placeholder desabilitado no `app.js` (será substituído na Task 5).

---

### Task 1: Tabela `site_meta`, trigger de "dirty" e RLS

**Files:**
- Create: `supabase/publish.sql`

- [ ] **Step 1: Escrever o SQL**

Criar `supabase/publish.sql`:

```sql
-- HD360 blog — Fase 2 / Plano 3: estado de publicação do site.
-- Aplicar no SQL Editor do projeto Supabase (uma vez).

create table if not exists public.site_meta (
  id                 integer primary key default 1,
  dirty              boolean not null default true,   -- há mudanças não publicadas
  publishing         boolean not null default false,  -- rebuild em andamento
  last_published_at  timestamptz,
  constraint site_meta_single_row check (id = 1)
);

insert into public.site_meta (id) values (1) on conflict (id) do nothing;

-- Qualquer escrita na tabela posts marca o site como "sujo" (precisa republicar).
create or replace function public.mark_site_dirty()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_meta set dirty = true where id = 1;
  return null;
end; $$;

drop trigger if exists posts_mark_site_dirty on public.posts;
create trigger posts_mark_site_dirty
  after insert or update or delete on public.posts
  for each statement execute function public.mark_site_dirty();

-- RLS: o painel (admin autenticado) lê o estado; ninguém anônimo lê.
-- Escrita só via service key (Edge Function e workflow), que ignora RLS.
alter table public.site_meta enable row level security;

drop policy if exists site_meta_read on public.site_meta;
create policy site_meta_read on public.site_meta
  for select to authenticated using (true);
```

- [ ] **Step 2: Aplicar no Supabase (precisa do Dashboard)**

SQL Editor → colar e rodar `supabase/publish.sql`. Conferir em Table editor que `site_meta` tem 1 linha (`id=1`, `dirty=true`).

- [ ] **Step 3: Documentar no README**

Acrescentar ao fim de `supabase/README.md`:

```markdown
## Publicação (Plano 3)
- `publish.sql` cria `site_meta` (estado de publicação) e o trigger que marca o site como "sujo" a cada escrita em `posts`.
- A Edge Function `publish` (em `supabase/functions/publish/`) dispara o rebuild; secret necessário: `GITHUB_PAT` (fine-grained, repo `hd360-moinhos`, Contents: Read and write).
- O workflow `.github/workflows/publish-blog.yml` roda o build e atualiza `site_meta` ao terminar. Secrets do GitHub Actions: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
```

- [ ] **Step 4: Commit**

```bash
git add supabase/publish.sql supabase/README.md
git commit -m "feat(blog): site_meta + trigger de dirty + RLS (pipeline Fase 2)"
```

---

### Task 2: Build com manifesto de slugs e prune de posts removidos

**Files:**
- Create: `tools/blog-migration/lib/prune-slugs.mjs`
- Test: `tools/blog-migration/test/prune-slugs.test.mjs`
- Modify: `tools/blog-migration/build.mjs`

> Hoje o build gera um diretório por slug mas nunca remove os de posts excluídos, então "excluir some do site" não funcionaria. A solução: um manifesto `assets/blog/generated-slugs.json` com os slugs gerados; a cada build, apagar os diretórios que estavam no manifesto antigo e não estão no novo. A decisão de "o que apagar" é uma função pura testável.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tools/blog-migration/test/prune-slugs.test.mjs`:

```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tools/blog-migration/test/prune-slugs.test.mjs`
Expected: FAIL — `Cannot find module '../lib/prune-slugs.mjs'`.

- [ ] **Step 3: Implementar `prune-slugs.mjs`**

Criar `tools/blog-migration/lib/prune-slugs.mjs`:

```js
// Dado o conjunto de slugs gerados antes e agora, devolve os que devem ser
// removidos (estavam antes, sumiram agora). Puro, sem efeitos colaterais.
export function slugsToPrune(oldSlugs, newSlugs) {
  const keep = new Set(newSlugs || []);
  return [...new Set(oldSlugs || [])].filter(slug => !keep.has(slug));
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test tools/blog-migration/test/prune-slugs.test.mjs`
Expected: PASS (3 testes).

- [ ] **Step 5: Ligar o manifesto e o prune no `build.mjs`**

Em `tools/blog-migration/build.mjs`:

(a) No import do topo (linha 1), acrescentar `rm` e `readFile` já está lá:
```js
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
```
(b) Importar o módulo novo junto aos outros imports:
```js
import { slugsToPrune } from './lib/prune-slugs.mjs';
```
(c) Entre o fim do `for` que gera as páginas (linha 42, o `}`) e o `console.log('Pronto.')` (linha 43), inserir o bloco de manifesto + prune:

```js
  // Manifesto dos slugs gerados, para apagar diretórios de posts excluídos no próximo build.
  const manifestUrl = new URL('assets/blog/generated-slugs.json', ROOT);
  const newSlugs = posts.map(p => p.slug);
  let oldSlugs = [];
  try { oldSlugs = JSON.parse(await readFile(manifestUrl, 'utf8')); } catch { /* primeiro build */ }
  for (const slug of slugsToPrune(oldSlugs, newSlugs)) {
    await rm(new URL(`${slug}/`, ROOT), { recursive: true, force: true });
    console.log('  removido', `${slug}/`);
  }
  await writeFile(manifestUrl, JSON.stringify(newSlugs, null, 2) + '\n');
```

- [ ] **Step 6: Rodar o build e gerar o manifesto inicial**

Run: `node tools/blog-migration/build.mjs`
Expected: gera tudo como antes e cria `assets/blog/generated-slugs.json` com os 23 slugs. (Nenhum diretório removido no primeiro build.)

- [ ] **Step 7: Suíte inteira do tooling**

Run: `node --test tools/blog-migration/test/*.test.mjs`
Expected: PASS — Fase 1/Plano 1 (65) + `prune-slugs` (3).

- [ ] **Step 8: Commit (inclui o manifesto inicial)**

```bash
git add tools/blog-migration/lib/prune-slugs.mjs tools/blog-migration/test/prune-slugs.test.mjs tools/blog-migration/build.mjs assets/blog/generated-slugs.json
git commit -m "feat(blog): manifesto de slugs e prune de posts removidos no build"
```

---

### Task 3: GitHub Actions — workflow de rebuild

**Files:**
- Create: `.github/workflows/publish-blog.yml`

> Escuta o `repository_dispatch` (tipo `publish-blog`), roda o build lendo do Supabase, commita o HTML na `main` e atualiza `site_meta`. O Pages publica no push (deploy from branch).

- [ ] **Step 1: Escrever o workflow**

Criar `.github/workflows/publish-blog.yml`:

```yaml
name: Publicar blog

on:
  repository_dispatch:
    types: [publish-blog]

permissions:
  contents: write

concurrency:
  group: publish-blog
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build do site lendo do Supabase
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: node tools/blog-migration/build.mjs

      - name: Commit do HTML gerado
        run: |
          git config user.name "HD360 Bot"
          git config user.email "bot@hd360.com.br"
          git add -A
          git diff --cached --quiet || git commit -m "chore(blog): rebuild automatico do site [skip ci]"
          git push

      - name: Marcar site como publicado
        if: success()
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: |
          curl -sS -X PATCH "$SUPABASE_URL/rest/v1/site_meta?id=eq.1" \
            -H "apikey: $SUPABASE_SERVICE_KEY" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"dirty\":false,\"publishing\":false,\"last_published_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

      - name: Liberar flag de publicação (mesmo se falhar)
        if: always()
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: |
          curl -sS -X PATCH "$SUPABASE_URL/rest/v1/site_meta?id=eq.1" \
            -H "apikey: $SUPABASE_SERVICE_KEY" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"publishing\":false}"
```

> Em caso de sucesso, o passo "Marcar site como publicado" zera `dirty` e `publishing`; em caso de falha no build, só o passo `always()` roda e libera `publishing` (mantendo `dirty=true`, pois as mudanças seguem não publicadas). O `[skip ci]` evita qualquer loop; o Pages publica no push independente disso.

- [ ] **Step 2: Configurar os secrets do GitHub Actions (precisa do usuário)**

No GitHub: repo → Settings → Secrets and variables → Actions → New repository secret. Criar:
- `SUPABASE_URL` = `https://euzmbswywwhmicjlszqw.supabase.co`
- `SUPABASE_SERVICE_KEY` = a **service role key** (Dashboard → Project Settings → API → `service_role`).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish-blog.yml
git commit -m "feat(blog): workflow de rebuild via repository_dispatch"
```

> O workflow só roda de verdade quando a Edge Function disparar o evento (Task 4) ou via teste manual da API do GitHub (ver Task 4, Step 4).

---

### Task 4: Edge Function `publish` (guarda o PAT, dispara o rebuild)

**Files:**
- Create: `supabase/functions/publish/index.ts`
- Create: `supabase/functions/publish/deno.json`

- [ ] **Step 1: Escrever a função**

Criar `supabase/functions/publish/index.ts`:

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OWNER = 'fabianohirtzz';
const REPO = 'hd360-moinhos';
const EVENT_TYPE = 'publish-blog';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const pat = Deno.env.get('GITHUB_PAT');
    if (!pat) return json({ error: 'GITHUB_PAT não configurado.' }, 500);

    // 1. Garantir que quem chama é o admin autenticado.
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Não autorizado.' }, 401);

    // 2. Marcar como publicando (service key ignora RLS).
    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from('site_meta').update({ publishing: true }).eq('id', 1);

    // 3. Disparar o rebuild no GitHub.
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'hd360-painel',
      },
      body: JSON.stringify({ event_type: EVENT_TYPE }),
    });

    if (!res.ok) {
      // Reverter a flag se o GitHub recusou.
      await admin.from('site_meta').update({ publishing: false }).eq('id', 1);
      return json({ error: `GitHub ${res.status}: ${await res.text()}` }, 502);
    }

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
```

Criar `supabase/functions/publish/deno.json` (mínimo, ajuda o deploy/editor):

```json
{
  "imports": {}
}
```

- [ ] **Step 2: Deploy da função e secret (precisa do usuário / Supabase CLI)**

Com a Supabase CLI logada:
```bash
supabase functions deploy publish --project-ref euzmbswywwhmicjlszqw
supabase secrets set GITHUB_PAT=<o-fine-grained-PAT> --project-ref euzmbswywwhmicjlszqw
```
(Alternativa sem CLI: Dashboard → Edge Functions → criar `publish`, colar o `index.ts`, e em Secrets adicionar `GITHUB_PAT`.) As variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente pelo Supabase nas funções, não precisa setar.

> **IMPORTANTE — Verify JWT DESLIGADO.** A função tem que ser deployada com `--no-verify-jwt` (CLI) ou com o toggle "Verify JWT" off (Dashboard). Com o verify_jwt ligado, o gateway barra o **preflight CORS** (OPTIONS, que vem sem token) antes de chegar no código, e o painel recebe erro de CORS. A segurança não cai: a própria função valida o JWT do admin via `auth.getUser()` e devolve 401 sem sessão.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/publish/index.ts supabase/functions/publish/deno.json
git commit -m "feat(blog): Edge Function publish (dispara rebuild via repository_dispatch)"
```

- [ ] **Step 4: Teste isolado do disparo (opcional, precisa do PAT)**

Antes de ligar o painel, dá pra validar o workflow disparando o evento direto pela API do GitHub:
```bash
curl -sS -X POST https://api.github.com/repos/fabianohirtzz/hd360-moinhos/dispatches \
  -H "Authorization: Bearer <PAT>" \
  -H "Accept: application/vnd.github+json" \
  -d '{"event_type":"publish-blog"}'
```
Expected: HTTP 204; em Actions, o workflow "Publicar blog" roda, regenera o HTML e (se houve mudança) commita na `main`. Conferir que `site_meta.dirty` virou `false`.

---

### Task 5: Painel — botão "Atualizar site", indicador e polling

**Files:**
- Create: `painel/lib/publish.js`
- Test: `painel/test/publish.test.js`
- Modify: `painel/app.js`

- [ ] **Step 1: Escrever o teste da lógica pura (estado do controle)**

Criar `painel/test/publish.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishUiState } from '../lib/publish.js';

test('publicando: rótulo ocupado, botão travado, sem flag', () => {
  assert.deepEqual(publishUiState({ dirty: true, publishing: true }), {
    flagVisible: false, btnLabel: 'Publicando…', btnDisabled: true,
  });
});

test('com mudanças não publicadas: flag visível, botão ativo', () => {
  assert.deepEqual(publishUiState({ dirty: true, publishing: false }), {
    flagVisible: true, btnLabel: 'Atualizar site', btnDisabled: false,
  });
});

test('site em dia: sem flag, botão ativo (permite rebuild manual)', () => {
  assert.deepEqual(publishUiState({ dirty: false, publishing: false }), {
    flagVisible: false, btnLabel: 'Atualizar site', btnDisabled: false,
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test painel/test/publish.test.js`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `publish.js`**

Criar `painel/lib/publish.js`:

```js
// Estado puro do controle "Atualizar site" a partir do site_meta.
export function publishUiState({ dirty, publishing } = {}) {
  if (publishing) return { flagVisible: false, btnLabel: 'Publicando…', btnDisabled: true };
  return { flagVisible: !!dirty, btnLabel: 'Atualizar site', btnDisabled: false };
}

// Lê o estado de publicação (linha única id=1).
export async function fetchSiteMeta(supabase) {
  const { data, error } = await supabase
    .from('site_meta').select('dirty,publishing,last_published_at').eq('id', 1).single();
  if (error) return { dirty: false, publishing: false };
  return data;
}

// Invoca a Edge Function que dispara o rebuild.
export async function requestPublish(supabase) {
  const { data, error } = await supabase.functions.invoke('publish', { body: {} });
  if (error) throw error;
  return data;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test painel/test/publish.test.js`
Expected: PASS (3 testes).

- [ ] **Step 5: Ligar o controle no `app.js`**

Em `painel/app.js`:

(a) Acrescentar aos imports do topo:
```js
import { publishUiState, fetchSiteMeta, requestPublish } from './lib/publish.js';
import { toast } from './lib/ui.js';
```

(b) Substituir, dentro de `shell()`, o bloco `topbar__actions` (o placeholder desabilitado) por:
```html
          <div class="topbar__actions">
            <span class="publish__flag" id="publish-flag" hidden><span class="publish__dot"></span>Alterações não publicadas</span>
            <button class="btn btn--primary" id="publish-btn">Atualizar site</button>
          </div>
```

(c) Ao final de `shell(innerTitle)`, antes do `return appRoot.querySelector('#work');`, ligar o controle:
```js
  initPublishControl();
```

(d) Acrescentar as funções de controle no `app.js` (fora de `shell`, no escopo do módulo):
```js
let publishTimer = null;

async function refreshPublishControl() {
  const flag = appRoot.querySelector('#publish-flag');
  const btn = appRoot.querySelector('#publish-btn');
  if (!flag || !btn) return null;
  const meta = await fetchSiteMeta(supabase);
  const ui = publishUiState(meta);
  flag.hidden = !ui.flagVisible;
  btn.textContent = ui.btnLabel;
  btn.disabled = ui.btnDisabled;
  return meta;
}

function initPublishControl() {
  const btn = appRoot.querySelector('#publish-btn');
  btn.addEventListener('click', onPublishClick);
  refreshPublishControl();
}

async function onPublishClick() {
  try {
    await requestPublish(supabase);          // marca publishing=true e dispara
    await refreshPublishControl();           // botão vira "Publicando…"
    toast('Publicando o site…', 'info');
    pollPublish(Date.now());
  } catch {
    toast('Não deu para iniciar a publicação.', 'err');
  }
}

function pollPublish(startedAt) {
  clearTimeout(publishTimer);
  publishTimer = setTimeout(async () => {
    const meta = await refreshPublishControl();
    if (meta && !meta.publishing) {
      toast('Site atualizado.', 'ok');
      return;
    }
    if (Date.now() - startedAt > 180000) {   // 3 min de teto
      toast('A publicação está demorando. Confira o GitHub Actions.', 'err');
      return;
    }
    pollPublish(startedAt);
  }, 4000);
}
```

> Como o trigger marca `dirty=true` a cada salvar/excluir, o indicador aparece sozinho na próxima vez que a topbar é desenhada (troca de tela) ou via `refreshPublishControl`. Para refletir na hora após salvar sem trocar de tela, é suficiente o comportamento atual (salvar redireciona pra lista, redesenhando a topbar).

- [ ] **Step 6: Suíte do painel + checagem de sintaxe**

Run: `node --test painel/test/*.test.js`
Expected: PASS — slug, clean-html, seo, post-payload, publish (13 testes).
Run: `node --check painel/app.js`
Expected: sem erro de sintaxe.

- [ ] **Step 7: Commit**

```bash
git add painel/lib/publish.js painel/test/publish.test.js painel/app.js
git commit -m "feat(painel): botao Atualizar site, indicador e polling de status"
```

---

### Task 6: Verificação de ponta a ponta

**Files:** nenhum (verificação)

- [ ] **Step 1: Suítes automatizadas verdes**

Run: `node --test painel/test/*.test.js` e `node --test tools/blog-migration/test/*.test.mjs`
Expected: tudo verde (painel 13; tooling 68).

- [ ] **Step 2: Fluxo real (precisa de tudo configurado: SQL aplicado, função deployada, secrets postos)**

Servir o painel (`node tools/blog-migration/serve.mjs` → `http://localhost:8000/painel/`), logar, então:

1. Criar ou editar um post e salvar. Voltar pra lista: a topbar mostra **"Alterações não publicadas"** (trigger marcou `dirty`).
2. Clicar **"Atualizar site"**: o botão vira **"Publicando…"** e trava; toast "Publicando o site…".
3. Em ~1 a 2 min o workflow termina: o botão volta a "Atualizar site", a flag some, toast **"Site atualizado."** (o painel detectou `publishing=false`).
4. Conferir no GitHub Actions que "Publicar blog" rodou e commitou o HTML; abrir o site publicado e ver a mudança no ar (URL/SEO preservados).
5. **Excluir** um post de teste, "Atualizar site": após o rebuild, o post some do site e o diretório `/<slug>/` é removido no commit (prune). Conferir que `blog.html`/`blog-todos.html` não listam mais o post.
6. RLS: deslogado, o painel não acessa `site_meta` nem invoca a função (`verify_jwt`).

- [ ] **Step 3: Atualizar a memória do projeto**

Registrar que a Fase 2 está completa (Planos 1–3); o Plano 4 (curtidas) é o que resta.

- [ ] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore(blog): verificacao do pipeline de publicacao (Plano 3)"
```

---

## Verificação do Plano 3

1. `site_meta` criada, com trigger marcando `dirty` a cada escrita em `posts`; RLS deixa só o admin autenticado ler.
2. `build.mjs` mantém o manifesto de slugs e remove diretórios de posts excluídos (prune testado).
3. Workflow `publish-blog.yml` escuta `repository_dispatch`, builda com a service key, commita o HTML e atualiza `site_meta`.
4. Edge Function `publish` valida o JWT do admin, guarda o PAT e dispara o evento; o PAT nunca chega ao cliente.
5. Painel: botão "Atualizar site" funcional, indicador "alterações não publicadas" e ciclo "publicando… → site atualizado" via polling.
6. Renderizadores e leitura do Supabase do Plano 1 intactos; testes verdes (painel 13, tooling 68).
7. Sem travessões; identidade `hd360-painel` no controle de publicação.

## Próximo e último plano da Fase 2
- **Plano 4** — Curtidas no público: coração no `/<slug>/`, chamada a `increment_likes(slug)`, de-dup por `localStorage`, número inicial renderizado no build.

## Migração ErêHost (lembrete, sem reescrita)
Quando sair do Pages: trocar só o passo de deploy do workflow (de "commit pro Pages" para upload FTP/SSH) e adicionar o domínio nas allowed origins do Supabase. Código (schema, função, build, painel) não muda.
