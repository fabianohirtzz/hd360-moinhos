# DESIGN.md — Tokens, palette, typography, voice

This is the source of truth for every visual decision. Read it end-to-end before writing your first CSS rule. Once the reference implementation exists, mirror its `main.css` structure and naming.

**Remember the prime directive: this brand is LIGHT.** White canvas, soft slate ink, color in cards. If you catch yourself typing a near-black background, you're in the wrong project.

## Table of contents
1. Brand DNA
2. Color system (tokens + per-color meaning)
3. Typography (Barnacle Boy + Montserrat)
4. Spacing & radii
5. Shadows & elevation
6. Motion tokens
7. Voice & copy conventions
8. Content building blocks (specialties, characters, worlds, contact)
9. Iconography
10. Accessibility (TEA-aware) — not optional
11. Anti-patterns to avoid

---

## 1. Brand DNA

HD360 Moinhos is a **children's autism (TEA) therapy clinic** in **Porto Alegre, RS**, offering **Terapia ABA**, autism **diagnosis**, and a multidisciplinary team. The identity must hold these tensions:

| Tension | Resolution |
|---|---|
| Specialist vs. human | Real clinical credibility (ABA, diagnosis, named professionals) delivered with warm, plain, parent-first language |
| Joyful vs. trustworthy | Playful characters and bright color, but grown-up structure, generous whitespace, and calm motion — parents must trust it |
| Colorful vs. calm | Five saturated brand colors used as a *coded system* (one per section), on a white canvas, with soft motion — never confetti chaos |
| Childlike vs. clinical | Picture-book roundness and a character cast, but accessible, legible, predictable — never a noisy kids' game, never a cold intake form |

The mark: a **triangle of puzzle pieces** (autism awareness) inside a **360° ring** (whole, all-around care). The tone is **warm, hopeful, safe, specific.**

---

## 2. Color system

All colors live as CSS custom properties on `:root`. **Do not use raw hex in component CSS.** Reach for the token. The five brand colors come straight from the brandbook.

### The five brand colors (exact brandbook values)

| Token | Hex | RGB | Role in brandbook | Use in UI |
|---|---|---|---|---|
| `--azul` | `#00A5EA` | 0,165,234 | Primary — confiança, calma, segurança | Primary structure, links, the "trust" world (Fundo do Mar), default accent |
| `--amarelo` | `#FFC700` | 255,199,0 | Primary — otimismo, atenção, alegria | Highlights, the primary CTA, sunny accents, the "energy" world (Espaço/sol) |
| `--rosa` | `#FB3C63` | 251,60,99 | Secondary — acolhimento, delicadeza | Warmth, welcome moments, the character Li, love/care accents |
| `--lilas` | `#8F64C8` | 143,100,200 | Secondary — criatividade, nobreza | Creativity, sensory/play, the Espaço world, Musicoterapia |
| `--verde` | `#A8C420` | 168,196,32 | Secondary — saúde, crescimento | Health, growth, the Floresta world, the character Lo |

### Tints & soft fills (derive these — they make the light system work)

Each brand color needs a **soft tint** for card backgrounds and a **wash** for large areas. Build them as low-alpha mixes over white, named consistently:

| Token | Value | Use |
|---|---|---|
| `--azul-soft` | `#E4F6FD` | Tinted card background, info plates |
| `--amarelo-soft` | `#FFF6D6` | Tinted card background, highlight blocks |
| `--rosa-soft` | `#FEE4EA` | Tinted card background, welcome blocks |
| `--lilas-soft` | `#EFE7F8` | Tinted card background, play blocks |
| `--verde-soft` | `#F1F6D9` | Tinted card background, growth blocks |

(If you prefer runtime mixing, `color-mix(in srgb, var(--azul) 12%, white)` produces the same family — but commit the static tokens to `:root` for stability.)

### Core surfaces & ink

| Token | Value | Use |
|---|---|---|
| `--branco` | `#ffffff` | Default page/section background |
| `--creme` | `#fbf8f3` | Warm alternate background — the "breathing" off-white for alternating sections |
| `--creme-deep` | `#f4eee4` | Slightly deeper cream for nested fills |
| `--tinta` | `#2e2a39` | Default body & heading ink — warm dark slate. **Never `#000`.** |
| `--tinta-muted` | `#6b6577` | Secondary copy, captions, meta |
| `--tinta-soft` | `#9a94a6` | Placeholders, disabled, faint labels |
| `--linha` | `rgba(46,42,57,0.08)` | Hairlines when truly needed (prefer waves/blobs instead) |

### Gradients (used sparingly, on CTAs and feature bands)

The brand's signature multicolor sweep — pull from the logo's rainbow puzzle. Use on the *one* full-color band per page, hero blobs, or the primary CTA.

```css
:root {
  --grad-marca: linear-gradient(100deg, #00A5EA 0%, #8F64C8 32%, #FB3C63 58%, #FFC700 100%);
  --grad-ceu:   linear-gradient(180deg, #E4F6FD 0%, #ffffff 100%);   /* gentle sky wash */
  --grad-sol:   linear-gradient(135deg, #FFC700 0%, #FB3C63 100%);   /* warm CTA */
}
```

### Per-color coding rule (the discipline that saves you)

Five saturated colors will read as chaos unless each one *means* something consistently. Lock these assignments and reuse them everywhere:

| Color | Specialty anchors | World | Character |
|---|---|---|---|
| Azul | Fonoaudiologia, Avaliação Neuro | Fundo do Mar 🐠 | — |
| Verde | Terapia Ocupacional, Fisioterapia | Floresta 🌳 | Lo |
| Lilás | Musicoterapia, Psicologia | Espaço 🪐 | — |
| Rosa | Psicopedagogia, Orientação Parental | — | Li |
| Amarelo | Terapia ABA, Estimulação Precoce | (sol / energia) | Turminha (group accent) |

When you add a new specialty or section, assign it the *nearest* existing color — never invent a sixth hue.

---

## 3. Typography

### Font stack

| Family | Role | Source | Weights |
|---|---|---|---|
| **Barnacle Boy** | Display headings only (chunky, rounded, hand-friendly) | Local `@font-face` from `fonts/Barnacle Boy.otf` | Single weight (treat as one face) |
| **Montserrat** | All body, UI, eyebrows, labels, buttons | Google Fonts | 400, 500, 600, 700 |

### Loading Barnacle Boy (local face)

The file ships in the project at `fonts/Barnacle Boy.otf`. Declare it once. For production, convert to `.woff2` for size/perf and update the `src` — but `.otf` works for dev.

```css
@font-face {
  font-family: "Barnacle Boy";
  src: url("../fonts/BarnacleBoy.woff2") format("woff2"),
       url("../fonts/Barnacle Boy.otf") format("opentype");
  font-weight: 400 700;        /* single physical weight; map the range so `bold` doesn't synthesize ugly */
  font-style: normal;
  font-display: swap;
}
```

> Note: the filename has a space (`Barnacle Boy.otf`). It works URL-encoded, but **rename the deliverable to `BarnacleBoy.otf` / `.woff2`** to avoid path bugs. Generate the woff2 with any otf→woff2 converter before launch.

### Loading Montserrat

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

```css
:root {
  --font-display: "Barnacle Boy", "Baloo 2", "Comic Sans MS", system-ui, sans-serif;
  --font-body: "Montserrat", "Helvetica Neue", system-ui, sans-serif;
}
```

### Display title pattern

Barnacle Boy is already characterful — keep titles **simple and confident**, let the font do the work. The brand emphasis pattern is **one colored word** inside a slate title (not italic — the font has no italic). Pattern: a single word wrapped in `<span class="hl">` tinted to the section's coded color.

```html
<h2 class="especialidades__title">
  Nossas <span class="hl">especialidades</span>
</h2>
```

```css
.especialidades__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;                  /* Barnacle Boy is single-weight; do not bold it */
  font-size: clamp(34px, 5.2vw, 68px);
  line-height: 1.02;
  letter-spacing: 0.005em;           /* the font is chunky — a hair of tracking, never negative */
  color: var(--tinta);
}
.hl { color: var(--lilas); }         /* set to the section's coded color */
```

Barnacle Boy quirks to respect: it is **chunky and round**, so (a) never apply negative letter-spacing (letters collide), (b) never set it below ~22px (detail muddies — use Montserrat for small text), (c) never synthesize italic or extra-bold, (d) line-height stays tight (`1.0–1.05`) because the font already feels generous.

### Type scale

| Use | Family | Size | Weight | Letter-spacing |
|---|---|---|---|---|
| Hero title | display | `clamp(44px, 7vw, 92px)` | 400 | `0.005em` |
| Section title (H2) | display | `clamp(34px, 5.2vw, 68px)` | 400 | `0.005em` |
| Sub-title / card title (display) | display | `clamp(22px, 2.6vw, 32px)` | 400 | `0.01em` |
| Card title (UI) | body | `19–22px` | 700 | `-0.005em` |
| Lede / intro paragraph | body | `clamp(17px, 1.6vw, 20px)` | 500 | normal |
| Body | body | `16–17px` | 400 | normal |
| Eyebrow (uppercase) | body | `12–13px` | 600 | `0.16em` |
| Meta / caption | body | `13–14px` | 500 | normal |
| Button / chip label | body | `15px` | 600 | `0.01em` |
| Small / legal | body | `13px` | 400 | normal |

Body line-height `1.65` for comfortable reading (parents reading carefully). Titles `1.0–1.1`.

### Eyebrow pattern (the brand's title plate)

A **rounded color pill** with the section's coded color — friendly, not a hairline rule (that's the dark-brand vocabulary). Optionally prefixed by a tiny puzzle/dot icon.

```html
<p class="eyebrow eyebrow--lilas">
  <span class="eyebrow__dot" aria-hidden="true"></span>
  Equipe multidisciplinar
</p>
```

```css
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px 7px 12px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.eyebrow__dot { width: 9px; height: 9px; border-radius: 50%; }
.eyebrow--lilas { background: var(--lilas-soft); color: #6b3fa6; }
.eyebrow--lilas .eyebrow__dot { background: var(--lilas); }
/* one modifier per brand color: --azul, --amarelo, --rosa, --verde */
```

The eyebrow text color is a *darker* shade of the coded color (for contrast on the soft pill); the dot is the full-strength color.

---

## 4. Spacing & radii

Semantic scale tuned per component; the common steps:

| Step | Value | Use |
|---|---|---|
| xs | 8px | Icon+label gap, chip internals |
| sm | 12–16px | Card internal gaps, form rows |
| md | 20–28px | Card padding, component internals |
| lg | 36–48px | Card outer padding, block rhythm |
| xl | 72–96px | Between major sections |
| xxl | 120px+ | Hero / featured-band vertical padding (desktop) |

### Section padding

`96–120px` top/bottom × `clamp(20px, 5vw, 80px)` side on desktop. Tablet trims to `80px`, mobile to `64px`. Generous whitespace is a brand value — never cramp.

### Radius scale — round is the brand

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 14px | Inputs, small buttons, chips' inner elements |
| `--r-md` | 22px | Default cards, info plates |
| `--r-lg` | 30px | Feature cards, world cards, images |
| `--r-xl` | 44px | Big hero panels, the featured band |
| `--r-pill` | 999px | All buttons, chips, eyebrows, the nav bar, avatars |
| blob | organic | Character frames & backdrops — see Animations § Blob |

**No element should have a sharp 0px corner.** Even full-bleed bands get a wave or rounded mask top/bottom.

---

## 5. Shadows & elevation

Shadows are **soft, low, large, and color-tinted** — never hard black. The tint matches the card's coded color, at low alpha.

### Card shadow (resting)

```css
box-shadow: 0 12px 30px rgba(46, 42, 57, 0.06),
            0 4px 10px rgba(46, 42, 57, 0.04);
```

### Colored card shadow (coded card, e.g. azul)

```css
box-shadow: 0 16px 38px rgba(0, 165, 234, 0.14),
            0 4px 12px rgba(0, 165, 234, 0.08);
```

Swap the rgb for the card's coded color: rosa `251,60,99`, lilás `143,100,200`, verde `168,196,32`, amarelo `255,199,0`.

### Hover (lifted)

```css
transform: translateY(-6px);
box-shadow: 0 24px 50px rgba(0, 165, 234, 0.20),
            0 6px 16px rgba(0, 165, 234, 0.10);
```

### Primary CTA glow (amarelo→rosa)

```css
box-shadow: 0 10px 26px rgba(251, 60, 99, 0.28);
/* hover */
box-shadow: 0 14px 34px rgba(251, 60, 99, 0.38);
```

Never use `box-shadow` with `rgba(0,0,0, >0.18)` — hard black shadows read as harsh and clinical, off-brand.

---

## 6. Motion tokens

```css
:root {
  --ease-gentle: cubic-bezier(0.22, 1, 0.36, 1);   /* default reveal / settle */
  --ease-soft:   cubic-bezier(0.4, 0, 0.2, 1);     /* hover color/border */
  --ease-bounce: cubic-bezier(0.34, 1.4, 0.5, 1);  /* friendly pop — buttons, chips, accordion (mild!) */
  --float: 6s;                                      /* base float duration */
}
```

### Duration ladder

| Range | Use |
|---|---|
| 150–220ms | Hover color/border |
| 250–350ms | Hover transform/lift, button press |
| 400–550ms | Accordion open, panel swap, modal |
| 600–800ms | Section reveal ("settles in") |
| 4–20s | Ambient float / blob morph (infinite, very slow) |

Never exceed 800ms for a *state change*. Ambient loops are the only long animations, and they must be slow and subtle. **All motion respects `prefers-reduced-motion` (see § 10 and ANIMATIONS.md).**

---

## 7. Voice & copy conventions

Speak to a **tired, hopeful parent** searching for help for their child — and, in the right moments, to the child too.

| Property | Rule |
|---|---|
| Language | Portuguese (pt-BR), warm and plain |
| Tone | Acolhedor, claro, esperançoso, específico. Confiante sem ser frio. Carinhoso sem ser infantilizado. |
| Pronoun | "Nós / nossa casa / nossa equipe" — inclusive and human. Address the parent as "você". |
| Real taglines | "Especialista em autismo, atendimento humanizado." · "Desenvolvimento Humano, Terapia ABA e Diagnóstico para Autismo." · "Atendimento com amor e dedicação, em um ambiente acolhedor e seguro." |
| Specialty names | Use the real names: Fonoaudiologia, Musicoterapia, Psicologia, Psicopedagogia, Terapia Ocupacional, Psicomotricidade, Fisioterapia, Acompanhante Terapêutico, Terapia ABA, Avaliação Neuropsicológica. |
| Numbers | Friendly: "+11 especialidades", "2 unidades", "atendimento de 0 a … anos". |
| Travessões (— em dash) | **NÃO usar travessões em textos.** O cliente os considera um "tell" de conteúdo gerado por IA. Para pausas, use **vírgulas** (ou dois-pontos quando fizer sentido). Em `<title>`/separadores, use `·` (middle dot). Isto vale para toda copy do site. |
| Ellipsis | Real `…` (U+2026) |
| CTA verbs | "Agende uma visita", "Conheça a equipe", "Fale no WhatsApp", "Marque uma avaliação" — action + warmth |
| Emojis | Not in nav, buttons, or headings. Allowed only inside playful editorial/blog content if the user asks. |
| Forbidden | Cold clinical-marketing speak: "solução", "unidade de negócio", "excelência premium", "líder de mercado". Also avoid medicalizing the child — say "crianças", "famílias", not "pacientes" in marketing copy (reserve "paciente" for clinical/portal contexts). |
| Inclusive language | Person-first and respectful of neurodiversity. "Crianças autistas / no espectro", "neurodivergente". Never "sofre de autismo", never "portador". |

### Title formula

`<eyebrow pill (coded color)> · <display title with one colored word> · <lede in Montserrat 500>`

Example:
> 🟣 EQUIPE MULTIDISCIPLINAR
> Cuidado que enxerga a criança **inteira**
> *Reunimos fono, terapia ocupacional, psicologia e mais de onze especialidades sob o mesmo teto — para um plano de desenvolvimento feito sob medida.*

---

## 8. Content building blocks

Reusable atoms that recur across the site.

### Real clinic facts (use these — verified)

```
Nome:        HD360 Moinhos
Foco:        Clínica de autismo (TEA) infantil — Terapia ABA e diagnóstico
Unidades:    Quintino Bocaiúva — Rua Quintino Bocaiúva, 451 · Moinhos de Vento
             Casa ABA — Rua Dr. Freire Alemão, 366 · Mont'Serrat
Telefone:    (51) 2112-8884
E-mail:      contato@hd360.com.br
Horário:     Seg–Sex 08:00–19:00 · Sáb/Dom fechado
Instagram:   @hd360moinhos
Facebook:    /hd360moinhos
Responsável: Dr. Guilherme B. Sander — CRM 23.587 · RQE 16104
CNPJ:        36.152.938/0001-74
Cidade:      Porto Alegre · RS
```

### Specialty chip

```html
<a class="spec-chip spec-chip--azul" href="#fono">
  <span class="spec-chip__icon" aria-hidden="true"><!-- inline svg --></span>
  Fonoaudiologia
</a>
```

A pill with the specialty's coded soft-tint background and a small icon. Used in the specialties grid and footer.

### Stat cell

```html
<div class="stat">
  <span class="stat__num" data-count="11">+11</span>
  <span class="stat__key">especialidades</span>
</div>
```

Display-type number (Barnacle Boy, in a coded color) + Montserrat uppercase key. Use for: especialidades, unidades, anos, profissionais.

### Character mascot slot

```html
<figure class="mascot mascot--li" aria-hidden="true">
  <img src="images/Li/li-acena.png" alt="" loading="lazy" />
</figure>
```

A floating character anchored to a section corner. Always `aria-hidden` + empty `alt` when purely decorative; give a real `alt` only when the character conveys meaning. (See COMPONENTS.md § Character block.)

### Contact row

```html
<a class="contact-row" href="https://wa.me/555121128884">
  <span class="contact-row__icon contact-row--verde" aria-hidden="true"><!-- whatsapp svg --></span>
  <span>(51) 2112-8884</span>
</a>
```

---

## 9. Iconography

Use **rounded outline SVGs at 2px stroke**, `stroke-linecap: round; stroke-linejoin: round`. The round caps match the brand's softness. Lucide and Phosphor (regular) are good libraries — pick the rounder option.

- Inline SVG only, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"` so icons inherit text/coded color.
- Specialty icons sit inside a **rounded soft-tint square** (`--r-md`) colored to the specialty.
- The puzzle piece and the 360° ring are brand motifs — use them as decorative SVG accents and section markers, not as functional UI icons.
- Exception: brand logos (WhatsApp, Instagram) are filled (`fill="currentColor"`).

---

## 10. Accessibility (TEA-aware) — not optional

This audience makes accessibility a **brand-defining feature**, not a checkbox. Autistic children and their families benefit specifically from calm, predictable, legible interfaces.

| Rule | Why |
|---|---|
| Honor `prefers-reduced-motion: reduce` everywhere — collapse to opacity-only or instant. | Motion sensitivity is common in autism; this is care, not compliance. |
| No flashing/strobing; nothing faster than gentle. Never animate more than 3 large things at once. | Sensory overload prevention. |
| Body text ≥ 16px, line-height ≥ 1.6, generous spacing. | Readability for tired parents and diverse readers. |
| Color contrast: all text ≥ 4.5:1 against its background (3:1 for large display). Test every coded color on its tint and on white. | The saturated palette can fail contrast on light tints — always verify. Eyebrow text uses the *darkened* color shade for this reason. |
| Never rely on color alone to convey meaning — pair coded color with an icon or label. | Color-blind and cognitive accessibility. |
| Visible, generous focus rings (`outline: 3px solid var(--azul); outline-offset: 3px`). | Keyboard & switch-device users. |
| Touch targets ≥ 44×44px; comfortable spacing between tappable items. | Motor accessibility, child users. |
| Predictable layout: consistent nav, no surprise pop-ups, clear labels, plain language. | Cognitive load reduction. |
| Provide real `alt` text for meaningful images; `aria-hidden` + empty alt for decorative characters. | Screen readers. |
| Optional: a "reduzir animações" toggle in the footer that sets a `.calm` class. | Goes beyond the OS setting; a genuine brand gesture. |

---

## 11. Anti-patterns to avoid

These come up constantly in generic AI-generated clinic/kids sites — flag and avoid each.

| Anti-pattern | Why it breaks brand | Do instead |
|---|---|---|
| Dark sections / near-black backgrounds | This brand is light; dark reads as the wrong project entirely | White / cream canvas, color in cards |
| Pure black `#000` text | Harsh, clinical | `--tinta: #2e2a39` warm slate |
| Sharp 0px corners | Brand has no sharp corners | `--r-md`/`--r-lg`, pills, blobs |
| Hard black drop-shadows | Cold, cut-out look | Soft, low, color-tinted shadows |
| All five colors fighting in one section | Visual chaos, overstimulating | One coded color per section |
| Thin grey 1px section dividers | Corporate-cold, dark-brand vocabulary | Wave dividers, blob backdrops, whitespace |
| Stocky "doctor with clipboard / hands holding puzzle" photos | Generic autism-clinic cliché | The bespoke character cast (Li, Lo, Turminha, pets) |
| Heavy parallax, autoplay carousels, bouncy spring everything | Overstimulating for the audience | Calm reveals, slow floats, reduced-motion respected |
| Heading set in Montserrat Black | Skips the brand's display voice | Barnacle Boy for display |
| Barnacle Boy in body / tiny sizes | Font muddies below ~22px | Montserrat for all small text |
| "Pacientes" everywhere in marketing | Medicalizes children | "Crianças", "famílias" (reserve "paciente" for clinical/portal) |
| Cold CTA "Saiba mais" | Flat | Warm action: "Agende uma visita", "Fale no WhatsApp" |
| Emoji in nav/buttons | Cheapens the trust | Reserve emoji for editorial content only |

When you catch yourself reaching for one of these, stop and pick the closest warm, rounded, coded alternative from `references/COMPONENTS.md`.
