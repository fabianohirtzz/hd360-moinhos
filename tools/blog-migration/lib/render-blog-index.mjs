function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const PLACEHOLDER_SVG = '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="rgba(46,42,57,.35)" stroke-width="1.5" aria-hidden="true"><path d="M19.4 7.9c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.4 0 3.4l-1.6 1.6c-.2.2-.5.3-.8.3-.5-.1-.8-.5-1-.9a2.5 2.5 0 1 0-3.2 3.2c.4.2.8.5.9 1 .1.3 0 .6-.3.8l-1.6 1.6c-.9.9-2.5.9-3.4 0l-1.6-1.6a1 1 0 0 0-.9-.3c-.5.1-.8.5-1 1a2.5 2.5 0 1 1-3.2-3.2c.5-.2.9-.5 1-1a1 1 0 0 0-.3-.9l-1.6-1.5c-.9-1-.9-2.5 0-3.4L4.2 8.8c.2-.2.6-.4.9-.3.5.1.9.5 1.1 1a2.5 2.5 0 1 0 3.3-3.3c-.5-.2-.9-.6-1-1.1-.1-.3 0-.7.3-.9l1.5-1.5c1-.9 2.5-.9 3.4 0l1.6 1.6c.2.2.5.3.9.3.5-.1.8-.5 1-1a2.5 2.5 0 1 1 3.2 3.2c-.4.2-.9.5-1 1Z"/></svg>';

/**
 * Returns cover markup for an index card (no ../ prefix needed, root-level page).
 * If coverImage is empty, returns the branded puzzle SVG placeholder.
 */
function coverMarkup(coverImage, color, alt, prefix) {
  if (coverImage && String(coverImage).length > 0) {
    return `<img src="${prefix}${coverImage}" alt="${esc(alt)}" loading="lazy">`;
  }
  return PLACEHOLDER_SVG;
}

function card(p, i) {
  return `<article class="post reveal" style="--i:${i % 3}" data-category="${esc(p.category.name)}">
            <a href="${p.slug}/" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%;">
              <div class="post__cover post__cover--${p.category.color}">
                ${coverMarkup(p.coverImage, p.category.color, p.title, '')}
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
