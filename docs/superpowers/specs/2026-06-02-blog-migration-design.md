# Blog HD360: migração do WordPress + fundação para painel próprio

**Data:** 2026-06-02
**Status:** Design aprovado, aguardando plano de implementação
**Autor:** Fabiano + Claude

## Contexto

O site atual da HD360 (`hd360.com.br`) é um WordPress com 23 posts de blog, fortemente
orientados a SEO local (ex.: "Fonoaudiologia no Autismo em Porto Alegre"). O site novo é
estático (HTML/CSS/JS puro), publicado via **GitHub Pages** a partir da branch `main`, sem
servidor. O `blog.html` já existe com o layout HD360 pronto, porém com cards "Em breve" no
lugar dos posts reais.

O objetivo é trazer o conteúdo do blog para o site novo e, futuramente, dar ao cliente um
painel administrativo para publicar, editar e excluir posts.

## Decisões tomadas

1. **Faseamento.** Fase 1 (agora): migrar os 23 posts e colocar o blog público no ar. Fase 2
   (depois): painel administrativo próprio.
2. **Painel da Fase 2 será próprio**, com a identidade visual do HD360 (não um CMS genérico).
   A fonte de verdade futura será um banco (Supabase). Por isso a Fase 1 já nasce alinhada
   nessa direção, mas sem depender de nenhum serviço externo ainda.
3. **SEO é prioridade.** As páginas públicas são HTML real pré-renderizado (não conteúdo
   montado só por JavaScript), porque o conteúdo existe para ranquear no Google.
4. **Preservação de URLs.** Cada post é gerado no mesmo caminho em que já está indexado:
   `/<slug>/` (via `/<slug>/index.html`), para não perder o ranqueamento quando o site novo
   assumir o domínio.
5. **Campos de SEO no modelo de dados** desde a Fase 1: meta description, palavra-chave foco,
   tags, categoria, etc. Alguns são importados do WordPress, outros ficam como campo a ser
   preenchido no painel da Fase 2.

## Arquitetura

Princípio único que conecta as duas fases:

```
  [ Fonte de dados ]  ->  [ Gerador ]  ->  [ Páginas HTML estáticas ]
   Fase 1: posts.json                       blog.html + /<slug>/index.html
   Fase 2: Supabase
```

O **gerador** é a peça estável: lê os posts de uma fonte e emite as páginas estáticas. Na
Fase 1 a fonte é um arquivo JSON no repositório. Na Fase 2 a fonte passa a ser o Supabase e
o mesmo gerador roda numa automação a cada publicação. O blog público nunca muda de natureza:
é sempre HTML estático servido pelo GitHub Pages.

## Fase 1: componentes

### 1. Extrator (script único, descartável após uso)

Script Node que consome a API REST aberta do WordPress:
`https://hd360.com.br/wp-json/wp/v2/posts?per_page=100&_embed`

Para cada post, monta um registro normalizado e grava em `assets/blog/posts.json`.

A API expõe dados do Yoast (`yoast_head_json`), então importamos automaticamente o que dá.
As categorias vêm como IDs e são resolvidas via `/wp-json/wp/v2/categories`.

### 2. Modelo de dados (`assets/blog/posts.json`)

Cada post:

| Campo               | Origem na Fase 1                          | Observação                                  |
|---------------------|-------------------------------------------|---------------------------------------------|
| `id`                | WP `id`                                    | identificador estável                       |
| `slug`              | WP `slug`                                  | define a URL `/<slug>/`                      |
| `title`             | WP `title.rendered`                        |                                             |
| `date`              | WP `date`                                  | publicação                                  |
| `modified`          | WP `modified`                              |                                             |
| `category`          | mapeada dos IDs WP para as 5 do site       | ver mapa abaixo                             |
| `coverImage`        | imagem destacada, baixada para `images/blog/` | caminho local                            |
| `excerpt`           | WP `excerpt` limpo                          | resumo do card                              |
| `content`           | WP `content.rendered` limpo + reclassificado | HTML do corpo do post                     |
| `metaDescription`   | `yoast_head_json.description`              | editável na Fase 2                          |
| `seoTitle`          | `yoast_head_json.title`                    | editável na Fase 2                          |
| `ogImage`           | `yoast_head_json.og_image[0].url` (local)  | editável na Fase 2                          |
| `focusKeyword`      | vazio (Yoast não expõe na API)             | preenchido no painel da Fase 2              |
| `tags`              | WP `tags` (hoje vazias) -> `[]`            | preenchidas no painel da Fase 2             |

O modelo já contém os campos de SEO da Fase 2 mesmo quando vazios, para a fundação nascer
completa.

### 3. Limpeza e reclassificação de conteúdo

O HTML do WordPress/Elementor traz ruído (classes WP, estilos inline, divs de layout,
comentários de bloco). O extrator limpa para manter apenas conteúdo semântico: parágrafos,
títulos (h2/h3), listas, links, imagens, citações, negrito/itálico. Em seguida aplica as
classes do design HD360 para o texto ler como o resto do site (tipografia Montserrat, ritmo,
links na cor da marca).

Regra de copy da marca: **sem travessões (em dashes)** em nada que apareça no site.

### 4. Imagens

Imagem de capa e imagens dentro do corpo são baixadas para `images/blog/` e os caminhos no
JSON/HTML são reescritos para locais. O site novo não fica dependente do servidor WordPress
antigo.

### 5. Mapa de categorias

Categorias do WP -> 5 categorias já exibidas no `blog.html`:

| WP                         | Site novo                  |
|----------------------------|----------------------------|
| Terapias / Therapies       | Terapias e Abordagens      |
| Diagnóstico / Diagnosis    | Entendendo o Autismo       |
| Sem categoria              | Histórias HD360 (fallback) |

Mapa final ajustado ao revisar os posts reais; as 5 categorias do site são: Entendendo o
Autismo, Terapias e Abordagens, Dia a Dia da Família, Dicas dos Especialistas, Histórias HD360.

### 6. Gerador de páginas

Script Node que lê `posts.json` e produz:

- **`blog.html` reescrito**: lista real dos 23 posts no lugar dos cards "Em breve", cada card
  com capa, categoria, título, data e link para `/<slug>/`. Hero, faixa de categorias e
  newsletter existentes são preservados. Filtro por categoria por cima da grade.
- **`/<slug>/index.html` por post**: cabeçalho com título/categoria/data, imagem de capa,
  corpo do post, CTA de WhatsApp, bloco de "posts relacionados" (mesma categoria), tudo no
  padrão visual HD360 (nav, footer, blobs, ondas, botão flutuante de WhatsApp, banner de
  cookies).

### 7. SEO por página

Cada `/<slug>/index.html` recebe: `<title>` (seoTitle ou title), `meta description`
(metaDescription), `link rel=canonical`, Open Graph (og:title, og:description, og:image),
e JSON-LD do tipo `Article` (headline, datePublished, dateModified, author, image, publisher).

## Fase 2: esboço (detalhado depois)

- **Banco:** Supabase com tabela `posts` (mesmos campos do modelo acima), Storage para imagens,
  Auth para 1 administrador (e-mail + senha).
- **Painel:** `admin.html` 100% no design HD360. Login, lista de posts, criar/editar/excluir
  com editor de texto e upload de capa, e campos de SEO (meta description, palavra-chave foco,
  tags, categoria).
- **Publicação:** ao salvar, uma automação (GitHub Action) roda o mesmo gerador da Fase 1 com
  a fonte trocada para o Supabase, regenerando `blog.html` e as páginas `/<slug>/`. O SEO
  estático é mantido.
- **Migração de dados:** `posts.json` da Fase 1 serve de semente para popular a tabela.

## Verificação (Fase 1)

1. Servir a pasta localmente e abrir `blog.html`: os 23 posts aparecem, com capa, categoria e
   data corretas; filtro por categoria funciona.
2. Abrir 2-3 posts em `/<slug>/`: título, imagem, acentuação, links e formatação corretos;
   layout HD360 intacto em mobile e desktop.
3. Conferir no HTML gerado: `<title>`, meta description, canonical, Open Graph e JSON-LD
   presentes e corretos.
4. Conferir que nenhum caminho aponta mais para `hd360.com.br/wp-content` (imagens locais).
5. Conferir ausência de travessões na copy.

## Fora de escopo (Fase 1)

- Painel administrativo, Supabase, autenticação (Fase 2).
- Paginação/busca no blog (23 posts cabem numa grade com filtro por categoria).
- Comentários, newsletter funcional (o formulário visual já existe; integração é outro tema).
- Redirecionamentos 301 server-side (não há servidor; a preservação de URL no mesmo caminho
  já evita 404 quando o domínio migrar).
