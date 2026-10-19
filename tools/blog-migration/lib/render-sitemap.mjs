const SITE = 'https://hd360.com.br';

// Páginas fixas do site, na ordem de importância. Página nova entra aqui.
export const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'atendimento.html', priority: '0.9', changefreq: 'monthly' },
  { path: 'unidades.html', priority: '0.9', changefreq: 'monthly' },
  { path: 'equipe.html', priority: '0.8', changefreq: 'monthly' },
  { path: 'faq.html', priority: '0.8', changefreq: 'monthly' },
  { path: 'blog.html', priority: '0.7', changefreq: 'weekly' },
  { path: 'blog-todos.html', priority: '0.6', changefreq: 'weekly' },
  { path: 'trabalhe-conosco.html', priority: '0.4', changefreq: 'yearly' },
  { path: 'ouvidoria.html', priority: '0.3', changefreq: 'yearly' },
  { path: 'politica-de-privacidade.html', priority: '0.2', changefreq: 'yearly' },
  { path: 'politica-de-cookies.html', priority: '0.2', changefreq: 'yearly' },
  { path: 'termos-de-uso.html', priority: '0.2', changefreq: 'yearly' },
];

const day = (d) => (d ? String(d).slice(0, 10) : '');

// sitemap.xml com as páginas fixas e um <url> por post (lastmod = última edição do post).
export function renderSitemap(posts, pages = STATIC_PAGES) {
  const urls = [
    ...pages.map((p) => ({ loc: `${SITE}/${p.path}`, changefreq: p.changefreq, priority: p.priority })),
    ...posts.map((p) => ({ loc: `${SITE}/${p.slug}/`, lastmod: day(p.modified || p.date), changefreq: 'monthly', priority: '0.6' })),
  ];
  const body = urls.map((u) => [
    '  <url>',
    `    <loc>${u.loc}</loc>`,
    u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
