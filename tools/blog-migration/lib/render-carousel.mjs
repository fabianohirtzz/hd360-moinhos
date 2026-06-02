function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const PLACEHOLDER_SVG = '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="rgba(46,42,57,.35)" stroke-width="1.5" aria-hidden="true"><path d="M19.4 7.9c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.4 0 3.4l-1.6 1.6c-.2.2-.5.3-.8.3-.5-.1-.8-.5-1-.9a2.5 2.5 0 1 0-3.2 3.2c.4.2.8.5.9 1 .1.3 0 .6-.3.8l-1.6 1.6c-.9.9-2.5.9-3.4 0l-1.6-1.6a1 1 0 0 0-.9-.3c-.5.1-.8.5-1 1a2.5 2.5 0 1 1-3.2-3.2c.5-.2.9-.5 1-1a1 1 0 0 0-.3-.9l-1.6-1.5c-.9-1-.9-2.5 0-3.4L4.2 8.8c.2-.2.6-.4.9-.3.5.1.9.5 1.1 1a2.5 2.5 0 1 0 3.3-3.3c-.5-.2-.9-.6-1-1.1-.1-.3 0-.7.3-.9l1.5-1.5c1-.9 2.5-.9 3.4 0l1.6 1.6c.2.2.5.3.9.3.5-.1.8-.5 1-1a2.5 2.5 0 1 1 3.2 3.2c-.4.2-.9.5-1 1Z"/></svg>';

// Seta diagonal (canto superior direito), no espírito do card de referência.
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

function cover(coverImage, title) {
  if (coverImage && String(coverImage).length > 0) {
    return `<img src="${coverImage}" alt="${esc(title)}" loading="lazy">`;
  }
  return PLACEHOLDER_SVG;
}

// Layout: bolinha+categoria (topo-esq) e seta (topo-dir), título acima da
// imagem, imagem, e texto curto abaixo da imagem.
function slide(p) {
  return `<article class="showcase" data-category="${esc(p.category.name)}">
            <a class="showcase__link" href="${p.slug}/" aria-label="Ler: ${esc(p.title)}">
              <div class="showcase__top">
                <span class="showcase__cat"><span class="showcase__dot showcase__dot--${p.category.color}" aria-hidden="true"></span>${esc(p.category.name)}</span>
                <span class="showcase__arrow" aria-hidden="true">${ARROW}</span>
              </div>
              <h3 class="showcase__title">${esc(p.title)}</h3>
              <div class="showcase__cover showcase__cover--${p.category.color}">
                ${cover(p.coverImage, p.title)}
              </div>
              <p class="showcase__excerpt">${esc(p.excerpt)}</p>
              <span class="showcase__meta">${esc(p.dateLabel)}</span>
            </a>
          </article>`;
}

export function renderCarousel(posts) {
  return posts.map(slide).join('\n          ');
}
