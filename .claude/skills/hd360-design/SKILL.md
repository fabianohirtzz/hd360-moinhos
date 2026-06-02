---
name: hd360-design
description: Senior-level design system for HD360 Moinhos — an autism (TEA) therapy clinic in Porto Alegre/RS that cares for children AND adults, offering ABA therapy, diagnosis, and 11+ specialties. Activate whenever building or modifying UI, pages, sections, components, copy, or animations inside the HD360 project — including the welcoming video hero, the specialties chips/grid, the puzzle-piece nav, the Instagram Reels carousel, the themed-room "Unidades" page (Espaço/Floresta/Fundo do Mar worlds), the character cast (Li, Lo, Turminha HD, pets Zig & Dom), the appointment CTA, FAQ accordions, testimonials, and any blob, wave divider, or confetti accent. Provides the exact color tokens (multicolor azul/amarelo/rosa/lilás/verde on a clean white canvas), the Barnacle Boy × Montserrat type system, the rounded friendly component patterns, the calm + accessible motion vocabulary (prefers-reduced-motion first), and the craft rules that keep the brand reading like a joyful, trustworthy, welcoming clinic for autistic people — never a generic SaaS landing page, never clinical-and-cold, never overstimulating. This brand is LIGHT, not dark — invert every dark-mode instinct. The reference implementation is BUILT (index.html, assets/css/main.css, assets/js/main.js) — treat it as authoritative ground truth and read it before the reference docs. Read references/DESIGN.md before writing any CSS, references/COMPONENTS.md for component anatomy, references/ANIMATIONS.md for motion, references/INTERACTIONS.md for behavior, references/LAYOUT.md for page structure, and references/INSPIRATION.md for the creative library to pull from. Use this skill aggressively — if there is any chance the user is touching HD360's UI, copy, or motion, this skill applies.
---

# HD360 Moinhos Design System

You are designing for **HD360 Moinhos** — an **autism therapy clinic** in Porto Alegre, Rio Grande do Sul that cares for **children and adults** on the spectrum. The brand offers ABA therapy, autism diagnosis, and a full team of specialties (Fono, TO, Psicologia, Musicoterapia, Fisioterapia, and more). The digital identity must feel **joyful, welcoming, trustworthy, and calm** — a place where a family feels *safe* and the person being cared for feels *invited*. Never generic, never cold-clinical, never an over-animated kids' game, never a dark SaaS landing page.

> **Audience note (changed):** the clinic originally read as children-only, but the live copy is now **all-ages and inclusive** — "cada **pessoa**", "**pessoas autistas**", "de quem você ama" instead of "cada criança" / "seu filho". The visual language stays joyful and picture-book warm (that is the *brand*, not a statement that the audience is only kids). When you write copy, address the **family/caregiver** and speak about the **person** in care — not exclusively "a criança".

You are not "a designer who follows a system." You are a senior designer with extraordinary craft instincts who happens to be writing code. Default to warmth. Default to roundness. Default to color used with intention. When in doubt, choose the option that feels more like a **picture book** and less like a hospital intake form — but keep it grown-up enough that parents trust it with their child.

## The single most important instruction

**This brand is LIGHT.** The canvas is white and warm-cream. If you have muscle memory from the dark NOX or Quarezemin systems — near-black backgrounds, glass-on-black, gold-on-black, "cinematic" vignettes — **invert all of it.** Here, surfaces are bright, color lives in cards and characters, ink is a soft dark slate (never pure black), and the mood is sunshine, not midnight. Every time you reach for `#0a0807` or a dark glass panel, stop: you're in the wrong project.

## Brand DNA in one paragraph

A clinic for autistic people (children and adults) that is **specialist but human, structured but warm.** The mark is a triangle filled with **puzzle-piece texture** (autism awareness) wrapped in a **360° ring** (whole, all-around care). The palette is the **autism spectrum made friendly** — five saturated brand colors (azul, amarelo, rosa, lilás, verde) arranged like a box of crayons on a clean white page. The brand has a **cast of characters** — Li, Lo, the Turminha HD, and the pets Zig & Dom — many wearing headphones, a quiet nod to sensory care. The clinic's therapy rooms are **themed worlds**: Space, Forest, and Under the Sea. Tradition here is not heritage — it's *consistency, safety, and predictability*, which for this audience is the highest form of care.

## How this skill is organized

Always read the relevant reference file before producing code. The SKILL.md only holds principles; the heavy detail lives in `references/` so you load only what you need.

| File | When to read |
|---|---|
| `references/DESIGN.md` | Before writing CSS or picking a color, type size, or token. Full palette, the Barnacle Boy `@font-face` setup, type scale, voice, brand DNA, copy conventions, accessibility rules. |
| `references/COMPONENTS.md` | Before adding or modifying any component. HTML/CSS anatomy for the soft nav, welcoming hero, specialty cards, the themed-room "Unidades" cards, character blocks, stats, testimonials, FAQ accordion, appointment CTA, footer, WhatsApp float. |
| `references/ANIMATIONS.md` | Before adding any motion. Easing tokens, gentle reveals, floaty bobs, blob morphs, confetti, hover wobble, stagger — and the **reduced-motion contract** that this audience requires. |
| `references/INTERACTIONS.md` | Before wiring behavior. Accordion, specialty filter/tabs, character carousel, mobile drawer, appointment form, unit switcher. |
| `references/LAYOUT.md` | Before laying out a page or section. Section anatomy (wave dividers, blob backdrops), grid templates, container scales, the full sitemap, and the responsive playbook. |
| `references/INSPIRATION.md` | When ideating a new feature or unsure how to approach something. Maps creative directions to source libraries and references for joyful, accessible, child-and-family brands. |

## The ten commandments of HD360 craft

These rule out the vast majority of generic mistakes before they happen.

1. **The canvas is white/cream, color lives in cards.** Base background is `--branco: #ffffff` and `--creme: #fbf8f3`. Never a dark section as the default. Color enters through cards, blobs, character backdrops, eyebrows, and accents — not through flooding the whole viewport. One *optional* full-color band per page (a CTA or a featured world), never more.
2. **Ink is soft, never pure black.** Body text is `--tinta: #2e2a39` (a warm dark slate borrowed from the brandbook's panels). Never `#000`. Pure black is harsh; this brand is gentle.
3. **Round everything.** Cards `border-radius: 24–32px`, buttons and chips `999px`, images and character frames blob-rounded. The brand has *no sharp corners*. If you draw a square corner, you've broken brand.
4. **Each of the five colors carries meaning — use them as a coded system, not confetti.** Azul = trust/calm (primary structure, links), Amarelo = optimism/attention, Rosa = warmth/welcome, Lilás = creativity (the brand's default button/CTA color), Verde = health/growth. Assign one brand color per specialty, per world, per character — consistently. **Amarelo (`#FFC700`) is a *fill* color, not a text color on white** — darkening it for contrast turns it into an off-brand mustard (client rejected this). When a heading word needs to read as "amarelo", use the brand gradient instead (`.hl--amarelo` clips `--grad-marca`, which contains the yellow). (See `references/DESIGN.md` § Color system.)
5. **Display type is Barnacle Boy; body is Montserrat.** Headings are the chunky, rounded, hand-friendly Barnacle Boy (loaded via local `@font-face`). Everything else — body, UI, eyebrows, labels — is Montserrat. Never set a heading in Montserrat-bold and call it a display. Never set body in Barnacle Boy (it's display-only, single weight).
6. **Motion is calm and accessible — this is non-negotiable for this audience.** Gentle fades, soft floats, slow blob morphs. **No** harsh flashing, **no** rapid strobing, **no** aggressive parallax, **no** autoplay that can't be paused. Always honor `prefers-reduced-motion: reduce` by collapsing to instant/opacity-only. Calm motion *is* the brand. (See `references/ANIMATIONS.md` § Reduced-motion contract.)
7. **Characters are the soul — place them with intent.** Li, Lo, the Turminha HD, and pets Zig & Dom appear across the site (hero, section mascots, empty states, the "A Turma" page). The **themed-world characters (Espaço / Floresta / Fundo do Mar)** are reserved for the **Unidades** page, where they represent the real therapy rooms. Don't scatter characters randomly — each one anchors a moment.
8. **Sections breathe with soft shapes, not hard rules.** Separate sections with **wavy dividers**, **blob backdrops**, and generous whitespace — never a 1px grey line across the page. The brandbook's room murals use flowing waves; echo that everywhere.
9. **Shadows are soft, colored, and low.** Use large, soft, slightly **color-tinted** shadows (`0 18px 40px rgba(0,165,234,0.14)`) under cards — never hard black drop-shadows. Elevation here feels like a gentle hover, not a hard cutout.
10. **Warm, plain, family-first copy. No clinical jargon walls, no emojis in the UI chrome.** Speak to a tired, hopeful caregiver: clear, kind, specific. Use the real taglines ("Especialista em autismo, atendimento humanizado"). Avoid cold terms like "unidade de atendimento" where "nossa casa" fits. Address the family as "você"; speak about "cada **pessoa**" / "quem você ama" (the audience is all ages, not only children). **"Paciente" is allowed and is what the client uses** — e.g. the live stat "+3000 pacientes atendidos" and "no ritmo de cada paciente". (This reverses an earlier rule; just keep it person-first — never "portador" or "sofre de autismo".) Emojis may appear *only* inside playful editorial content if the user asks — never in nav, buttons, or headings.

## The motion vocabulary (one-liner each)

You always have these tools available — picking the right one is the senior move. All of them must degrade gracefully under `prefers-reduced-motion`.

- **Gentle reveal** — `IntersectionObserver` adds `is-in`; elements rise `14px` and fade in over `600–800ms` with `--ease-gentle`. The default for almost everything. (See `references/ANIMATIONS.md` § Reveal.)
- **Floaty bob** — characters and blobs drift `±8px` vertically over `4–7s` `ease-in-out infinite`. Slow enough to feel like breathing, never bouncing.
- **Blob morph** — background blobs slowly animate `border-radius` between organic values over `12–20s`. The "alive but calm" backdrop.
- **Soft hover lift** — cards translate `-6px` and deepen their colored shadow over `250ms`. Buttons get a `scale(1.03)` + brighten.
- **Stagger-in** — grids of specialty cards or characters reveal in sequence with a `60–90ms` step, so the page assembles warmly instead of all at once.
- **Confetti / dot accents** — small static or gently-drifting colored dots and puzzle bits as decorative texture (CSS or SVG). Decoration only; never load-bearing, always `aria-hidden`.
- **Count-up** — stat numbers (anos de atuação, especialidades, crianças atendidas) tick up once on reveal. One per stat, never looping.

## How to start any new piece of UI

1. Read `references/DESIGN.md`. Know the tokens, the Barnacle Boy setup, and the per-color meaning before you reach for hex.
2. Read `references/LAYOUT.md` for the section template (eyebrow → display title → content → soft divider) and the sitemap so you know which page you're building.
3. Read `references/COMPONENTS.md` for the closest existing analog. HD360 already has a defined card, hero, world-card, and character-block language — extend before inventing.
4. Decide the **one brand color** this section is coded to, and which **character** (if any) anchors it. Color discipline is what keeps five saturated hues from becoming chaos.
5. Write semantic HTML with BEM-style classes (`section__element--modifier`). The project's CSS is BEM throughout.
6. Implement CSS using existing tokens. Add **one** calm motion (reveal or float), not three. Wire the `prefers-reduced-motion` fallback in the same pass — not later.
7. Test mobile first at 390px, then 768px, then 1024px. Touch targets ≥ 44px; text never below 15px body. Check color contrast against white for every text color you use.

## The two biggest failure modes

- **Defaulting to dark / cold.** The strongest pull will be to make it "sleek" with dark sections, thin grey lines, and pure-black text. That is the *opposite* of this brand. If a section feels corporate-cold, add a character, round the corners more, swap the divider for a wave, and warm the background to cream.
- **Over-stimulating.** The second pull is to over-color and over-animate because "it's for kids." Resist. The audience is autistic people (children and adults) and their families — calm, predictable, and uncluttered is the *caring* choice. Plenty of white space, one coded color per section, slow motion, reduced-motion respected. Joy comes from warmth and character, not from saturation and speed.

## Where the live system lives (BUILT — this is ground truth)

The reference implementation **exists** in this project. It is authoritative: when the docs and the code disagree, the code wins. Scan it first.

- `index.html` — the Home, fully composed. Page anatomy and real component markup. Other pages (atendimento, equipe, unidades, ouvidoria, blog) are linked from the nav.
- `assets/css/main.css` — every token, every component, every media query. BEM throughout, tokens on `:root`, mobile-first.
- `assets/js/main.js` — behavior: calm toggle, scrolled-nav, mobile drawer, scroll reveal + count-up, cookie banner, **hero video** (muted calm-aware autoplay + controls), **Reels carousel** (one video at a time, sound on play, prev/next).
- `fonts/Barnacle Boy.otf` — the display face, loaded via `@font-face` as `url("../../fonts/Barnacle%20Boy.otf")` (CSS lives two folders deep).
- `assets/img/` — the **built** site imagery: `hero-poster.jpg`, `hero-turma.png` (the hero peek character), `cta-abraco.png` (Li & Lo hugging, used in the final CTA), `turma-trio.png`, `li-desenho.png`, `lo-astronauta.png`, `pets-zig-dom.png`, and `reels/*.jpg` poster frames.
- `assets/video/` — `institucional.mp4` (hero) and `reels/*.mp4` (the Instagram-style carousel).
- `images/` — source character/brand art and logos: `logo-3.png` (nav/drawer logo), `logo-branco.png`, plus folders `Li/`, `Lo/`, `Turminha/`, `Pets/`, `Profissionais/` (everyday cast) and `Espaço/`, `Floresta/`, `Fundo do Mar/`, `Casa ABA/`, `Quintino/` (the themed worlds & unit photos for the **Unidades** page).
- An inline SVG sprite at the top of `<body>` defines `#ic-puzzle` — reference it with `<svg><use href="#ic-puzzle"/></svg>` for any puzzle-piece accent.

When the user asks for something new, **first scan `index.html` + `main.css`** for the closest analog and extend the existing language. Do not reach for dark-mode patterns from the NOX or Quarezemin projects — this brand is their opposite.
