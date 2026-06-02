---
name: hd360-painel
description: Senior-level design system for the HD360 admin panel (`/painel/`) — the private, daily-use management UI where the clinic's team logs in to write, edit, publish, and delete blog posts (Supabase-backed, Fase 2). Activate whenever building or modifying ANY screen, component, copy, or motion inside `/painel/` — the login screen, the posts list/table, the WYSIWYG post editor, the SEO panel, tag chips, cover/image upload, status badges (rascunho/publicado), the "Atualizar site" publish flow, modals, toasts, empty/loading/error states, and the app shell (sidebar + topbar). This is the SAME HD360 brand as the public site but a DIFFERENT register: a calm, functional, branded-productivity tool, NOT the joyful marketing site. Keep the brand's colors, Montserrat body, soft-slate ink, rounded corners, soft tinted shadows, accessibility, and "no travessões" copy rule — but SCALE DOWN the playfulness: no characters cluttering forms, no confetti, no wave dividers, no giant Barnacle Boy headings, tighter spacing, smaller radii, dense scannable tables. Reads professional and warm, never a generic gray CMS, never an overstimulating kids' game. Pairs with `hd360-design` (the public-site system) for shared tokens — read this skill, not that one, when the surface is the admin panel. Read references/COMPONENTS.md before building any panel component. Use aggressively: if there is any chance the user is touching `/painel/` UI, copy, or behavior, this skill applies.
---

# HD360 Painel — Admin Design System

You are designing the **private admin panel** for HD360 Moinhos at `/painel/` — the surface the clinic's team opens to manage the blog: log in, write a post in a WYSIWYG editor, set SEO and tags, save as draft or publish, and click "Atualizar site" to regenerate the static blog. One admin, used regularly, often for long editing sessions.

This is the **same brand** as the public HD360 site, but a **different job**. The public site is a joyful picture-book that welcomes families. The panel is a **calm, trustworthy tool** that gets work done. Your north star: it should feel unmistakably HD360 the moment they log in, and then **get out of the way** so they can write.

## The single most important instruction

**Same brand, productivity register.** Keep every brand token — the five colors, Montserrat, the warm-slate ink, rounded corners, soft tinted shadows, calm motion, accessibility-first, no travessões. But **strip the marketing theatrics**: no character mascots scattered across forms, no confetti, no wave dividers between panels, no 96px section padding, no clamp(34px,…,64px) Barnacle Boy headings on every screen. A panel that's as decorated as the homepage is *exhausting* to use eight hours a week. Warmth here comes from **color, roundness, and kind copy**, not from density of ornament.

If you catch yourself reaching for a wave divider, a floating Li/Lo, a confetti burst, or a giant display headline above a data table — stop. That's the public-site instinct. The panel earns trust by being **clean, legible, and predictable**.

## What to KEEP vs SCALE DOWN (the whole skill in one table)

| Brand element | Public site | Panel (`/painel/`) |
|---|---|---|
| **Palette** | Five colors as a coded system | **Keep** the exact tokens. Use color sparingly: status, primary action, active nav, focus. Mostly white/cream + slate. |
| **Body type** | Montserrat | **Keep.** Montserrat does *all* the work here. |
| **Display type (Barnacle Boy)** | Every section heading, huge | **Scale down hard.** Barnacle Boy appears ONLY in: the panel wordmark, the login welcome, and large empty-states. **Never** on table headers, field labels, buttons, or page titles — those are Montserrat 600/700. |
| **Ink** | `--tinta #2e2a39`, never black | **Keep** exactly. |
| **Corners** | 22–44px, blobs | **Smaller.** Inputs `--r-sm 14`, cards/panels `18–20px`, badges/buttons pill. No blob frames. |
| **Spacing** | 96–120px sections, airy | **Dense.** App padding 20–28px, table rows 14–16px vertical. Comfortable, not cavernous. |
| **Shadows** | Soft, low, color-tinted | **Keep, even lower.** App chrome leans on `--linha` hairlines + tiny shadows, not big colored glows. |
| **Dividers / hairlines** | "Never a 1px grey line" — use waves | **Reversed for the panel.** Dense tables and panels *need* hairlines. Use `--linha` (warm slate at 0.08α, not cold grey). Waves are out. |
| **Characters** | The soul of the site | **Out** of work surfaces. One small friendly touch on the login and empty-states is plenty. |
| **Confetti / blobs / floats** | Decorative joy | **Out.** One optional soft blob behind the login card, nothing on the working screens. |
| **Motion** | Reveals, floats, blob morphs | **Functional only:** toast slide, modal scale-in, row hover, button press. Always reduced-motion safe. |
| **Copy** | Warm, family-first, no travessões | **Keep the warmth and the no-travessões rule**, but write *operator* copy: clear labels, helpful microcopy, plain confirmations. |

## Brand tokens (mirror `hd360-design` exactly — do not invent)

Put these on `:root` in the panel's CSS. They are the **same values** as the public site so the brand stays coherent; the panel just *uses* them differently.

```css
:root{
  /* Five brand colors */
  --azul:#00A5EA; --amarelo:#FFC700; --rosa:#FB3C63; --lilas:#8F64C8; --verde:#A8C420;
  /* Soft tints (badge/plate backgrounds) */
  --azul-soft:#E4F6FD; --amarelo-soft:#FFF6D6; --rosa-soft:#FEE4EA; --lilas-soft:#EFE7F8; --verde-soft:#F1F6D9;
  /* Ink shades (color AS TEXT on light — the contrast workhorses) */
  --azul-ink:#0481b6; --rosa-ink:#c01b40; --lilas-ink:#6b3fa6; --verde-ink:#6f841a; --amarelo-ink:#a87f00;
  /* Surfaces & ink */
  --branco:#ffffff; --creme:#fbf8f3; --creme-deep:#f4eee4;
  --tinta:#2e2a39; --tinta-muted:#6b6577; --tinta-soft:#9a94a6;
  --linha:rgba(46,42,57,0.08); --linha-forte:rgba(46,42,57,0.14);
  /* Panel-specific surface roles */
  --app-bg:#fbf8f3;          /* the work area — warm off-white, calmer than pure white all day */
  --surface:#ffffff;          /* cards, panels, table, editor */
  --sidebar:#ffffff;          /* left nav */
  /* Type */
  --font-display:"Barnacle Boy","Baloo 2",system-ui,sans-serif; /* wordmark / login / empty-state ONLY */
  --font-body:"Montserrat","Helvetica Neue",system-ui,sans-serif; /* everything else */
  /* Radii (smaller than marketing) */
  --r-sm:14px; --r-md:18px; --r-lg:22px; --r-pill:999px;
  /* Motion */
  --ease-gentle:cubic-bezier(0.22,1,0.36,1);
  --ease-soft:cubic-bezier(0.4,0,0.2,1);
}
```

Load **Barnacle Boy** the same way the public CSS does (local `@font-face` from `fonts/Barnacle Boy.otf`). Since the panel lives at `/painel/`, fix the relative path for the new depth (e.g. `url("../fonts/Barnacle%20Boy.otf")` — verify against where you place the CSS). Load **Montserrat** 400/500/600/700 from Google Fonts.

### The amarelo rule still holds

`--amarelo` is a **fill**, never text on white. The "rascunho" badge uses `--amarelo-soft` background + a full-strength `--amarelo` dot + `--tinta` (or `--amarelo-ink`) label — never amarelo text alone. Don't darken amarelo into mustard.

## Color roles in the panel (the discipline that keeps it calm)

A dashboard with five colors fighting is noise. Assign each a **job** and stop:

| Color | Panel job |
|---|---|
| **Lilás** `--lilas` | **Primary action** (the brand's default CTA color). Primary buttons, active nav item, focused field accent, the selected/checked state. |
| **Verde** `--verde` | **Published / success / live.** The "publicado" badge, "site atualizado" confirmation, save-success toast. |
| **Amarelo** `--amarelo` | **Draft / attention / pending.** The "rascunho" badge, "alterações não publicadas" indicator, "publicando…" state. (Fill + dot, never text — see amarelo rule.) |
| **Rosa** `--rosa` | **Destructive / error.** Delete actions, error toasts, validation errors, the destructive confirm modal. |
| **Azul** `--azul` | **Informational / links.** Inline links, info plates, "ver prévia", help microcopy accents. |

Everything else is white/cream surface + slate ink + `--linha` hairlines. Color is a **signal**, not wallpaper.

## Typography in the panel

- **Page titles** ("Posts", "Editar post"): Montserrat 700, ~22–26px, `--tinta`. NOT Barnacle Boy.
- **Section/panel headings** ("Conteúdo", "SEO", "Organização"): Montserrat 600, 15–16px, often with `--tinta-muted` uppercase eyebrow (letter-spacing 0.08em) above.
- **Field labels:** Montserrat 600, 13–14px, `--tinta`.
- **Body / inputs:** Montserrat 400/500, 15px, `--tinta`. Never below 14px for interactive text.
- **Microcopy / helper / meta:** Montserrat 500, 13px, `--tinta-muted`.
- **Table headers:** Montserrat 600, 12–13px, uppercase, `--tinta-muted`, letter-spacing 0.04em.
- **Barnacle Boy** — only the wordmark in the sidebar, the login welcome line, and big empty-state headlines. Never below ~22px (it muddies).

## Accessibility — still non-negotiable (this is HD360)

The brand's accessibility commitments carry straight into the panel; an admin tool is not exempt.

- Honor `prefers-reduced-motion: reduce` — collapse toasts/modals to instant opacity. Wire it in the same pass.
- Visible, generous focus rings everywhere: `outline:3px solid var(--lilas); outline-offset:2px`. Keyboard users must always see where they are — critical in forms.
- Touch/click targets ≥ 40px in the panel (44px on the public site; 40 is acceptable for a dense desktop tool, but never smaller).
- All text ≥ 4.5:1 against its background. Test every coded color used as text against its surface — use the `-ink` shades for text, full strength for fills/dots.
- Never rely on color alone for status: every badge pairs color with a **text label** (and ideally a dot/icon). "Rascunho"/"Publicado" must read without color vision.
- Real `<label for>` on every field, `aria-live="polite"` region for toasts, focus-trapped modals with Esc-to-close and a labeled close button.
- Predictable layout: the shell (sidebar + topbar) never moves between screens; destructive actions always confirm.

## Copy voice in the panel

Same warmth as the brand, but **operator-facing** — you're talking to the clinic's team member doing a task, not to a prospective family.

- Portuguese (pt-BR), clear and kind. Confident, never cold, never jargon-y.
- **No travessões (— em dash).** The client reads them as an AI "tell". Use commas, or colons where natural. In separators use `·`. This rule is absolute across the whole panel.
- Real `…` for ellipsis. No emojis in chrome (buttons, nav, labels).
- Labels are plain nouns: "Título", "Categoria", "Tags", "Resumo", "Imagem de capa". Buttons are action + object: "Salvar rascunho", "Publicar", "Atualizar site", "Excluir post".
- Microcopy is genuinely helpful, not filler: under the slug field, "Mudar o endereço muda a URL e pode afetar o SEO." Under meta description, a live character counter.
- Confirmations are calm and specific: "Excluir 'Título do post'? Essa ação não pode ser desfeita." Success is warm and brief: "Post salvo." / "Site atualizado."
- Never cold CMS-speak ("Item criado com sucesso no sistema"). Never alarmist red walls of text.

## The screens you'll build (and where they're specced)

The panel's scope and data model live in the project spec: `docs/superpowers/specs/2026-06-02-blog-admin-fase2-design.md`. The screens:

1. **Login** — Supabase Auth email/senha, no public signup. The *one* screen allowed a little brand warmth (wordmark in Barnacle Boy, one soft blob behind the card). Calm, centered, reassuring.
2. **App shell** — persistent left **sidebar** (wordmark, "Posts", "Sair") + a slim **topbar** (page title, the "alterações não publicadas" indicator + **"Atualizar site"** button). The shell is constant across screens.
3. **Posts list** — a clean **data table**: título, categoria (coded dot), status badge, data, curtidas, row actions (editar/excluir). Status filter. "Novo post" primary button.
4. **Post editor** — three grouped panels: **Conteúdo** (título + WYSIWYG toolbar + body + cover upload), **Organização** (categoria select with color dot, curated **tag chips**, slug with SEO warning), **SEO** (seo_title, meta_description with counter, focus_keyword, og_image, Google preview). Footer actions: "Salvar rascunho" / "Publicar" / "Ver prévia".
5. **System states** — empty (no posts yet), loading (skeleton rows), error (kind retry), and the publish flow feedback ("publicando…" → "site atualizado").

## How to build any panel component

1. **Read `references/COMPONENTS.md` first.** It has the ready HTML/CSS anatomy for the app shell, data table, status badge, form fields, the WYSIWYG editor chrome, tag chips, buttons, modal, toast, and empty/loading states. Extend those before inventing.
2. Decide the component's **color job** from the roles table (most components are neutral surface + slate; color only enters for status/primary/destructive/active).
3. Pick the **right register**: this is a tool. Prefer the calmer, denser, more legible option every time. When unsure, look at how Linear, Notion's settings, or a well-made Supabase/Stripe dashboard handles it, then warm it with HD360 tokens (rounder corners, warm ink, soft tints).
4. Vanilla **HTML + CSS + JS** with BEM-style classes, matching the project's zero-dependency footprint. Supabase JS and any editor lib come via CDN. No bundler.
5. Add **one** functional motion if any (toast/modal/hover), and wire `prefers-reduced-motion` in the same pass.
6. Test the real flows: keyboard-only through login → list → editor → save; 1280px and 1024px desktop first, then a usable ≥768px tablet layout (the sidebar can collapse). Check contrast on every status badge.

## The two failure modes to avoid

- **Going generic-gray CMS.** Stripping the marketing theatrics does NOT mean stripping the brand. If the panel looks like default Bootstrap or a gray WordPress admin, you went too far — bring back the warm cream `--app-bg`, the soft-tint status badges, the lilás primary, the rounded corners, the wordmark. It must still *feel* like HD360.
- **Dragging the marketing site in.** The opposite error: giant Barnacle Boy headers, floating characters, confetti on publish, wave dividers, 90px padding. That makes a daily tool tiring and slow to scan. Keep it calm, dense, and legible.

Warm + clean + legible is the target. Read `references/COMPONENTS.md` before writing component CSS.
