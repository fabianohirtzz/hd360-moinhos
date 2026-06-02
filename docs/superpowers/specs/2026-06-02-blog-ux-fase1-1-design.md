# Blog HD360 Fase 1.1: carrossel, página "todos os posts" e sidebar do post

**Data:** 2026-06-02
**Status:** Design aprovado
**Depende de:** Fase 1 (migração do blog, já concluída)

## Contexto

O blog da Fase 1 está no ar: `blog.html` com grade de 23 posts + filtro, e uma página por post em `/<slug>/`. Esta iteração (1.1) melhora a UX a pedido do cliente, sem backend (continua estático no GitHub Pages).

## Decisões

1. **Curtir + comentários:** adiados para a Fase 2 (precisam de backend Supabase). Agora o sidebar do post reserva o espaço, sem botões não funcionais.
2. **Chips de categoria no `blog.html`:** viram rótulo visual (não filtram). O filtro interativo de verdade vive na nova página "todos os posts".
3. **Componente 21st.dev `showcase-card-1`:** é React/Tailwind escuro. Não é usado diretamente; portamos o MODELO (card com capa grande, título, descrição, botão de seta, hover com zoom, carrossel) para o estilo CLARO do HD360.
4. **Tags:** vazias no WordPress. Derivadas automaticamente agora por palavra-chave; o painel da Fase 2 permitirá curar.
5. **Página "todos os posts":** arquivo `blog-todos.html` na raiz.

## Mudanças por área

### A. `blog.html` (landing do blog)
- **Espaçamento:** a seção de categorias passa a ficar colada ao carrossel (remover o `padding` grande que hoje separa as duas seções). Categorias e carrossel viram uma única seção visual.
- **Categorias = rótulo visual:** os chips deixam de ser `<button data-filter>` e voltam a ser `<span class="tag">` com bolinha colorida (sem interação). Removemos `data-blog-filters` daqui.
- **Carrossel showcase:** substitui a grade fixa. Mostra 3 cards no desktop (2 no tablet, 1 no mobile) e desliza horizontalmente. Controles: setas anterior/próximo, arrastar/swipe, e bolinhas de paginação. Acessível (botões com aria-label, navegação por teclado nas setas).
  - **Card showcase (claro):** card branco arredondado, capa grande no topo (16/10), **bolinha da cor da categoria + nome da categoria** (no lugar do ícone do componente original), título, resumo curto, e um botão circular de seta no canto inferior direito que leva ao post. Hover: card eleva e a imagem dá leve zoom (1.03). Sem capa: usa o placeholder de quebra-cabeça já existente.
  - O carrossel passa por todos os 23 posts (ordem: mais recentes primeiro).
- **Botão "Ver todos os posts":** `btn btn--solid btn--azul` centralizado abaixo do carrossel, linkando para `blog-todos.html`.
- Hero e newsletter permanecem.

### B. `blog-todos.html` (nova página)
- Estrutura padrão HD360 (nav, hero curto, footer, WhatsApp, cookies) no mesmo padrão das outras páginas de raiz (caminhos sem `../`).
- Hero curto: título "Todos os conteúdos".
- **Filtro de categorias interativo** (os `<button data-filter>` que saíram do `blog.html`) + a **grade completa** dos 23 posts (reusa `renderBlogIndex`).
- **Pré-filtro por URL:** ao carregar, lê `?cat=<nome>` (decodificado) e aplica o filtro correspondente, marcando o botão ativo. Sem parâmetro: mostra "Todos".
- Gerada pelo `build.mjs` (mesmos marcadores de injeção da grade).

### C. Página do post (`/<slug>/index.html`) com sidebar direito
- O conteúdo passa a um **layout de duas colunas** no desktop: artigo (coluna principal) + sidebar à direita (~300px, `position: sticky`). No mobile, o sidebar vai para baixo do artigo, empilhado.
- A imagem de capa (hero) e o CTA de WhatsApp continuam, dentro da coluna do artigo.
- **Widgets do sidebar:**
  - **Categorias:** as 5 categorias com bolinha colorida; a categoria do post atual em destaque. Cada uma linka para `blog-todos.html?cat=<nome>`.
  - **Tags:** as tags do post (derivadas) como pílulas. Se o post não tiver tags, o widget é omitido.
  - **Posts recentes:** os 5 posts mais novos (excluindo o atual), em mini lista com miniatura + título, linkando para `../<slug>/`.
  - **Reservado (Fase 2):** um bloco discreto indicando que curtidas e comentários chegam em breve (texto curto, sem controles funcionais). Pode ser omitido se ficar ruidoso; decisão de implementação.
- A seção "Leia também" (relacionados) permanece abaixo, em largura total.

### D. Dados e geração (tooling)
- **`transform-post.mjs` / limpeza de excerpt:** remover o marcador `[…]`/`[&hellip;]` e o texto de CTA coladin ("CLIQUE AQUI E SAIBA MAIS" e variações) do resumo; decodificar entidades; cortar num tamanho limpo (~200 caracteres, sem quebrar palavra).
- **Derivação de tags:** novo módulo `lib/derive-tags.mjs` com `deriveTags(post)` que escaneia título + conteúdo por um dicionário de palavras-chave do domínio (TEA, ABA, Fonoaudiologia, Terapia Ocupacional, Diagnóstico, Família, Escola, Comunicação/CAA, Desenvolvimento, Alimentação, Neurologia) e retorna de 2 a 5 tags. Preenche `post.tags` no `transform-post`.
- **Renderizadores:**
  - Novo `lib/render-carousel.mjs` (`renderCarousel(posts)`) que produz os slides do carrossel (cards showcase).
  - `render-blog-index.mjs` continua para a grade da `blog-todos`.
  - `render-post-page.mjs` ganha a coluna de sidebar e seus widgets (recebe `recentPosts` e usa `post.tags`/`post.category`).
  - Novo `lib/render-todos-page.mjs` (ou estende o gerador) para a `blog-todos.html`, ou usa um arquivo-base com marcadores como o `blog.html`.
- **`build.mjs`:** injeta o carrossel no `blog.html`, gera `blog-todos.html` (grade + filtro), e gera os posts com sidebar (passando os 5 recentes).
- **CSS (`assets/css/main.css`):** carrossel (trilho, slides, setas, dots), card showcase, layout duas colunas do post, widgets do sidebar, e ajuste de espaçamento das categorias.
- **JS (`assets/js/main.js`):** controlador do carrossel (setas, swipe/drag, dots, responsivo) e o filtro da `blog-todos` (incluindo leitura de `?cat=`).
- **Testes (`node:test`):** `deriveTags`, limpeza de excerpt, `renderCarousel` (estrutura do slide, bolinha de cor, link), e o pré-filtro por URL (função pura que decide a categoria ativa a partir da querystring).

## Fora de escopo
- Curtidas e comentários funcionais (Fase 2).
- Paginação real na `blog-todos` (23 posts cabem; filtro por categoria basta).
- Curadoria manual de tags (Fase 2).

## Verificação
1. `blog.html`: categorias coladas ao carrossel; carrossel mostra 3 cards, setas/swipe/dots funcionam; bolinha colorida por categoria; botão "Ver todos" abre `blog-todos.html`.
2. `blog-todos.html`: 23 cards, filtro funciona, `?cat=` pré-filtra.
3. Post: duas colunas no desktop, sidebar com categorias/tags/recentes; empilha no mobile; relacionados abaixo.
4. Resumos sem `[…]` nem "CLIQUE AQUI"; tags coerentes com o tema.
5. Sem travessões; layout HD360 intacto; testes verdes.
