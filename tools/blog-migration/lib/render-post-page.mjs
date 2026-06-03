const SITE = 'https://hd360.com.br';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rel(html) {
  // Content stores src="images/blog/..."; on a post page it becomes ../images/blog/...
  return String(html).replace(/src="images\//g, 'src="../images/');
}

const PLACEHOLDER_SVG = '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="rgba(46,42,57,.35)" stroke-width="1.5" aria-hidden="true"><path d="M19.4 7.9c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.4 0 3.4l-1.6 1.6c-.2.2-.5.3-.8.3-.5-.1-.8-.5-1-.9a2.5 2.5 0 1 0-3.2 3.2c.4.2.8.5.9 1 .1.3 0 .6-.3.8l-1.6 1.6c-.9.9-2.5.9-3.4 0l-1.6-1.6a1 1 0 0 0-.9-.3c-.5.1-.8.5-1 1a2.5 2.5 0 1 1-3.2-3.2c.5-.2.9-.5 1-1a1 1 0 0 0-.3-.9l-1.6-1.5c-.9-1-.9-2.5 0-3.4L4.2 8.8c.2-.2.6-.4.9-.3.5.1.9.5 1.1 1a2.5 2.5 0 1 0 3.3-3.3c-.5-.2-.9-.6-1-1.1-.1-.3 0-.7.3-.9l1.5-1.5c1-.9 2.5-.9 3.4 0l1.6 1.6c.2.2.5.3.9.3.5-.1.8-.5 1-1a2.5 2.5 0 1 1 3.2 3.2c-.4.2-.9.5-1 1Z"/></svg>';

const PLACEHOLDER_THUMB = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="rgba(46,42,57,.35)" stroke-width="1.5" aria-hidden="true"><path d="M19.4 7.9c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.4 0 3.4l-1.6 1.6c-.2.2-.5.3-.8.3-.5-.1-.8-.5-1-.9a2.5 2.5 0 1 0-3.2 3.2c.4.2.8.5.9 1 .1.3 0 .6-.3.8l-1.6 1.6c-.9.9-2.5.9-3.4 0l-1.6-1.6a1 1 0 0 0-.9-.3c-.5.1-.8.5-1 1a2.5 2.5 0 1 1-3.2-3.2c.5-.2.9-.5 1-1a1 1 0 0 0-.3-.9l-1.6-1.5c-.9-1-.9-2.5 0-3.4L4.2 8.8c.2-.2.6-.4.9-.3.5.1.9.5 1.1 1a2.5 2.5 0 1 0 3.3-3.3c-.5-.2-.9-.6-1-1.1-.1-.3 0-.7.3-.9l1.5-1.5c1-.9 2.5-.9 3.4 0l1.6 1.6c.2.2.5.3.9.3.5-.1.8-.5 1-1a2.5 2.5 0 1 1 3.2 3.2c-.4.2-.9.5-1 1Z"/></svg>';

const CATEGORIES = [
  { name: 'Entendendo o Autismo', color: 'verde' },
  { name: 'Terapias e Abordagens', color: 'azul' },
  { name: 'Dia a Dia da Família', color: 'rosa' },
  { name: 'Dicas dos Especialistas', color: 'lilas' },
  { name: 'Histórias HD360', color: 'amarelo' },
];

/**
 * Returns cover markup for a card (related post card, prefix = '../').
 * If coverImage is empty, returns the branded puzzle SVG placeholder.
 * This helper is for CARD covers only; the post hero image is handled separately.
 */
function coverMarkup(coverImage, color, alt, prefix) {
  if (coverImage && String(coverImage).length > 0) {
    return `<img src="${prefix}${coverImage}" alt="${esc(alt)}" loading="lazy">`;
  }
  return PLACEHOLDER_SVG;
}

function recentThumb(p) {
  if (p.coverImage && String(p.coverImage).length > 0) {
    return `<img src="../${p.coverImage}" alt="${esc(p.title)}" loading="lazy">`;
  }
  return PLACEHOLDER_THUMB;
}

function widgetCategories(post) {
  const currentName = (post.category && post.category.name) || '';
  const items = CATEGORIES.map(cat => {
    const isCurrent = cat.name === currentName;
    const encoded = encodeURIComponent(cat.name);
    return `<li${isCurrent ? ' class="is-current"' : ''}><a href="../blog-todos.html?cat=${encoded}"><span class="side-dot side-dot--${cat.color}" aria-hidden="true"></span>${esc(cat.name)}</a></li>`;
  }).join('\n        ');
  return `<section class="side-card">
      <h4 class="side-card__title">Categorias</h4>
      <ul class="side-cats">
        ${items}
      </ul>
    </section>`;
}

function widgetTags(post) {
  const tags = post.tags || [];
  if (!tags.length) return '';
  const tagSpans = tags.map(t => `<span class="side-tag">#${esc(t)}</span>`).join('\n        ');
  return `<section class="side-card">
      <h4 class="side-card__title">Tags</h4>
      <div class="side-tags">
        ${tagSpans}
      </div>
    </section>`;
}

function widgetRecent(recentPosts) {
  if (!recentPosts || recentPosts.length === 0) return '';
  const items = recentPosts.slice(0, 5).map(p => {
    return `<li><a href="../${p.slug}/"><span class="side-recent__thumb">${recentThumb(p)}</span><span class="side-recent__t">${esc(p.title)}</span></a></li>`;
  }).join('\n        ');
  return `<section class="side-card">
      <h4 class="side-card__title">Posts recentes</h4>
      <ul class="side-recent">
        ${items}
      </ul>
    </section>`;
}

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

function sidebar(post, recentPosts) {
  return [
    widgetCategories(post),
    widgetTags(post),
    widgetRecent(recentPosts),
    widgetLikes(post),
  ].filter(Boolean).join('\n    ');
}

function relatedCard(p) {
  return `<article class="post">
        <a href="../${p.slug}/" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%;">
          <div class="post__cover post__cover--${p.category.color}">
            ${coverMarkup(p.coverImage, p.category.color, p.title, '../')}
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

export function renderPostPage(post, related = [], recentPosts = []) {
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
        <div class="post-layout">
          <div class="post-main">
            ${post.coverImage ? `<img class="post-hero-img reveal" src="../${post.coverImage}" alt="${esc(post.title)}" />` : ''}
            <article class="prose">
              ${rel(post.content)}
            </article>
            <div class="post-cta reveal">
              <a class="btn btn--solid btn--azul" href="https://wa.me/555121128884?text=Ol%C3%A1!%20Vim%20pelo%20blog%20da%20HD360%20Moinhos." target="_blank" rel="noopener">Fale com a gente no WhatsApp</a>
            </div>
          </div>
          <aside class="post-side">
            ${sidebar(post, recentPosts)}
          </aside>
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
  <script type="module" src="../assets/js/likes.js"></script>
</body>
</html>
`;
}
