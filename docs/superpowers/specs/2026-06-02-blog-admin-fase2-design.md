# Blog HD360 Fase 2: painel admin, Supabase e curtidas

**Data:** 2026-06-02
**Status:** Design aprovado
**Depende de:** Fase 1 (migração do blog) e Fase 1.1 (carrossel, todos os posts, sidebar), ambas concluídas.

## Contexto

O blog está no ar como site estático no GitHub Pages: `posts.json` é a fonte de verdade, o tooling em `tools/blog-migration/` gera `blog.html`, `blog-todos.html` e uma página por post em `/<slug>/` (URLs preservadas pro SEO). A Fase 2 dá ao cliente um painel próprio (com a cara do HD360, não um CMS genérico) para publicar/editar/excluir posts, migra a fonte de verdade pro Supabase e ativa curtidas anônimas. Comentários ficam para uma fase posterior.

O site hoje mora no GitHub Pages só para o cliente aprovar; depois sobe pra ErêHost. A arquitetura é desenhada para que essa migração não exija reescrita de código (ver "Migração ErêHost").

## Decisões

1. **Fonte de verdade migra pro Supabase.** `posts.json` passa a ser apenas semente (seed inicial dos 23 posts). O build lê do Supabase em produção.
2. **Público continua 100% estático.** As páginas `/<slug>/` seguem pré-renderizadas (SEO intacto). Supabase serve só o painel, o build e as curtidas.
3. **Rebuild automático (não blog dinâmico).** Ao publicar, uma GitHub Action regenera o HTML e commita na `main`. O público nunca busca conteúdo do Supabase em runtime (só curtidas).
4. **Editor WYSIWYG** que gera HTML limpo (mesmo formato dos posts atuais). Cliente não vê código.
5. **Comentários fora de escopo** nesta fase. Só curtidas anônimas agora.
6. **Tags curadas** no painel substituem a derivação automática da Fase 1.1. O seed roda a derivação uma vez para pré-preencher; o admin ajusta.
7. **Rascunho vs publicado + botão "Atualizar site".** Edições salvam no Supabase sem mexer no site; o rebuild só dispara quando o admin clica "Atualizar site". Permite juntar várias edições num rebuild só e evita página meio-pronta no ar.
8. **Painel vanilla + Supabase JS** (Abordagem A). SPA em HTML/CSS/JS puro em `/admin/`, `@supabase/supabase-js` via CDN, sem bundler — fiel à pegada zero-dependência do projeto. Editor rico via lib leve por CDN.
9. **1 admin**, login via Supabase Auth (e-mail/senha), usuário criado manualmente.

## Arquitetura e fluxo de dados

```
Painel /admin/ (SPA vanilla)  --Supabase JS-->  Supabase (Postgres + Auth + Storage)
   login + CRUD  <--rascunhos--                        ^
   |  clica "Atualizar site"                           | build lê posts publicados (REST)
   v                                                   |
Edge Function (guarda GitHub PAT) --repository_dispatch--> GitHub Action
   roda build.mjs -> gera HTML -> commit na main -> GitHub Pages (hoje) / ErêHost (depois)

Visitante no post -> curtir -> JS chama increment_likes() no Supabase; página segue estática (SEO)
```

- O **build é reaproveitado**: `build.mjs` passa a ler do Supabase, mas os renderizadores (`render-post-page`, `render-carousel`, `render-blog-index`, etc.) e seus testes da Fase 1 continuam intactos — só troca a fonte de dados.

## Modelo de dados no Supabase

**Tabela `posts`** (espelha o schema atual + campos novos):

`id, slug (único), title, date, modified, category_name, category_color, cover_image, excerpt, content (HTML), meta_description, seo_title, og_image, focus_keyword, tags (text[]), likes (int default 0), status ('draft'|'published'), created_at, updated_at`

- `status` separa rascunho do que vai pro ar. O build só puxa `status='published'`.
- `tags` é curado no painel.

**Storage:** bucket público `blog-images` para capa e imagens inline do editor. URLs absolutas (Supabase), funcionam em qualquer host.

**Segurança (RLS):**
- Leitura pública só de posts `published`; escrita só pelo admin autenticado.
- Curtir: função `increment_likes(slug)` (SECURITY DEFINER) que **só incrementa o contador** — anônimo não lê nem altera mais nada.
- Build na Action usa a **service key** (segredo do GitHub) para ler tudo.

**Auth:** Supabase Auth e-mail/senha, 1 usuário, criado manualmente.

## O painel admin (`/admin/`)

SPA vanilla com identidade HD360 (cores/tipografia da marca via skill `hd360-design`).

**Telas:**
1. **Login** — e-mail/senha (Supabase Auth). Sem cadastro público.
2. **Lista de posts** — tabela: título, categoria, status, data, curtidas. Ações: novo, editar, excluir. Filtro por status. Indicador de "alterações não publicadas" + botão **"Atualizar site"**.
3. **Editor de post**:
   - **Conteúdo:** título, editor WYSIWYG (negrito, itálico, H2/H3, listas, link, citação, inserir imagem → Storage), capa (upload).
   - **Organização:** categoria (as 5 existentes, com bolinha de cor), tags curadas (chips add/remove), slug (auto do título, editável — aviso de que mudar slug muda URL/SEO).
   - **SEO:** seo_title, meta_description (com contador de caracteres), focus_keyword, og_image, e prévia de como aparece no Google.
   - **Status:** salvar como rascunho / marcar como publicado; botão "ver prévia".

**Comportamento:** salvar grava no Supabase na hora (não rebuilda). O site só muda ao clicar "Atualizar site".

## Build, gatilho e curtidas

**Build (`build.mjs` adaptado):**
- Nova camada `lib/load-posts.mjs` com `fromSupabase()` (produção/CI) e `fromJson()` (fallback/local), decidindo pela presença das env vars do Supabase.
- Mapeia o registro do Supabase pro mesmo formato interno que os renderizadores já esperam → renderizadores e testes da Fase 1 ficam intactos.
- Gera o mesmo conjunto de hoje: `blog.html`, `blog-todos.html`, `/<slug>/index.html`.

**Gatilho do rebuild:**
- Botão "Atualizar site" → Edge Function do Supabase → dispara `repository_dispatch` no GitHub (PAT guardado como segredo do Supabase, nunca no cliente).
- Workflow `.github/workflows/publish-blog.yml` escuta o evento, roda o build com a service key, commita o HTML na `main`. O Pages publica.
- Painel mostra status: "publicando…" → "site atualizado" (via estado do workflow ou timestamp).

**Curtidas (público, no `/<slug>/`):**
- Botão de coração no post. JS chama `increment_likes(slug)` e mostra o total.
- `localStorage` guarda slugs já curtidos para não recontar a mesma pessoa e manter o coração ativo. Anti-abuso simples, suficiente para blog de clínica.
- O número inicial vem renderizado no build; é atualizado ao vivo via Supabase.

## Migração ErêHost (futuro, sem reescrita)

1. Adicionar o domínio de produção nas allowed origins/redirect do Supabase (config no dashboard).
2. Trocar **só o passo de deploy** do workflow: de "commit pro Pages" para "upload via FTP/SSH pra ErêHost". Resto idêntico.
3. (Opcional) transferir o projeto Supabase pra conta do cliente.

Tudo que é código (Supabase schema, painel, build, curtidas) é independente de host; só o destino do deploy muda.

## Segredos e configuração

- **GitHub Actions:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
- **Supabase Edge Function:** `GITHUB_PAT` (fine-grained, só `repository_dispatch` no repo).
- **Painel (público):** só a `anon key` do Supabase (segura por design + RLS).

## Testes (`node:test`, padrão da Fase 1)

- `load-posts`: mapeamento Supabase→formato interno (fixtures, sem rede).
- Renderizadores: continuam verdes (não mudam).
- Função pura do anti-abuso de curtidas (decisão "já curtiu?" a partir do localStorage).
- RLS: checagem manual documentada (anon não escreve, não lê rascunho).

## Fora de escopo (Fase 2)

- Comentários (adiados).
- Multi-usuário / papéis (só 1 admin).
- Agendamento de publicação, versionamento de posts, analytics.

## Verificação

1. Login no `/admin/` funciona; sem sessão, não acessa o CRUD.
2. Criar post no editor WYSIWYG, subir capa + imagem inline, salvar como rascunho: aparece na lista como rascunho e **não** sai no site.
3. Marcar como publicado + "Atualizar site": a Action roda, regenera `/<slug>/`, `blog.html` e `blog-todos.html`, e o post aparece no ar com SEO (meta tags, URL preservada).
4. Editar tags/SEO de um post e republicar reflete no HTML estático.
5. Excluir post some da lista e, após "Atualizar site", some do site.
6. Curtir um post incrementa o contador no Supabase; recarregar mantém o coração ativo (localStorage) e o total atualizado.
7. RLS: cliente anônimo não consegue escrever nem ler rascunhos; só `increment_likes` é permitido.
8. Sem travessões nas telas/copys; identidade HD360 no painel; testes verdes; renderizadores da Fase 1 inalterados.
