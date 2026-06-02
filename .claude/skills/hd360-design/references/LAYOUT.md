# LAYOUT.md — Page structure, grid, sitemap

Read this before laying out a page or section. HD360 pages are **airy, vertically rhythmic, and soft-edged** — generous whitespace, alternating white/cream bands separated by wave dividers, one coded color per section, characters anchoring key moments.

## Index
1. Page shell
2. Container scale
3. Section anatomy
4. Alternation & color rhythm
5. Grid templates
6. The sitemap (pages & what each holds)
7. Responsive playbook

---

## 1. Page shell

```html
<body>
  <svg width="0" height="0" aria-hidden="true"><symbol id="ic-puzzle">…</symbol></svg>  <!-- icon sprite, once -->

  <header class="nav" data-nav>…</header>          <!-- fixed floating pill, logo + puzzle menu -->
  <div class="drawer-backdrop" data-drawer-backdrop></div>
  <aside id="drawer" class="drawer" data-drawer>…</aside>   <!-- mobile only -->

  <main>
    <section class="hero">…</section>              <!-- institutional video -->
    <section class="section section--white">…</section>
    <section class="section section--cream">…</section>
    <section class="cta">…</section>               <!-- the one full-color band -->
  </main>

  <footer class="footer">…</footer>
  <a class="wpp" href="https://wa.me/555121128884" aria-label="Falar no WhatsApp">…</a>  <!-- gradient float -->
  <aside class="cookies" data-cookies>…</aside>
</body>
```

The nav floats over content (it's `position: fixed`), so the hero needs top breathing room (`padding-top` clearing the nav). Body background is `--branco`; sections opt into `--cream` for alternation. The `#ic-puzzle` sprite is declared once at the top and reused via `<use href="#ic-puzzle"/>` everywhere a puzzle accent appears (nav, chips, hero).

---

## 2. Container scale

```css
:root { --container: 1180px; --container-narrow: 760px; }
.container { width: 100%; max-width: var(--container); margin-inline: auto; padding-inline: clamp(20px, 5vw, 80px); }
.container--narrow { max-width: var(--container-narrow); }   /* article/text pages: blog post, política */
```

`1180px` is the main content width. Text-heavy pages (blog post, policies, a single specialty detail) use `--container-narrow` for comfortable measure (~70 characters/line).

---

## 3. Section anatomy

Every standard section follows the same warm rhythm:

```
[ optional wave divider rising from previous section ]
[ blob backdrop (aria-hidden) — 1–2 soft coded blobs ]
   eyebrow pill (coded color)
   display title (Barnacle Boy, one colored word)
   optional lede (Montserrat 500, max ~640px)
   content (grid / cards / character / form)
   optional section CTA
[ wave divider into next section ]
```

```html
<section class="section section--cream" id="especialidades">
  <span class="blob blob--lilas" aria-hidden="true"></span>
  <div class="container">
    <header class="section__head">
      <p class="eyebrow eyebrow--lilas"><span class="eyebrow__dot"></span> Equipe multidisciplinar</p>
      <h2 class="section__title">Nossas <span class="hl hl--lilas">especialidades</span></h2>
      <p class="section__lede">Mais de onze áreas trabalhando juntas, no ritmo de cada pessoa.</p>
    </header>
    <div class="grid grid--specs"><!-- spec cards --></div>
  </div>
  <div class="wave wave--bottom" aria-hidden="true"><svg>…</svg></div>
</section>
```

```css
.section { position: relative; overflow: clip; padding-block: clamp(64px, 9vw, 120px); }
.section--white { background: var(--branco); }
.section--cream { background: var(--creme); }
.section__head { max-width: 720px; margin: 0 auto clamp(36px, 5vw, 56px); text-align: center; }
.section__head--left { margin-inline: 0; text-align: left; }
.section__head--wide { max-width: 940px; }                              /* for 2-line titles */
.section__title { font: 400 clamp(34px,5.2vw,64px)/1.04 var(--font-display); color: var(--tinta); margin-top: 12px; text-wrap: balance; }
.section__head--wide .section__title { font-size: clamp(30px,4.3vw,48px); }
.section__lede { font: 500 clamp(17px,1.6vw,20px)/1.6 var(--font-body); color: var(--tinta-muted); margin-top: 14px; }
```

The head is **centered by default** (marketing sections); add `--head--left` for content/article sections. Use `--head--wide` (+`text-wrap: balance`) when a title is meant to wrap to two lines, which keeps the line breaks tidy — this is how the "diferenciais" and "como cuidamos" heads are built.

---

## 4. Alternation & color rhythm

- **Background:** alternate `white → cream → white → cream`. Never two cream sections adjacent; never a dark section.
- **Coded color:** each section is assigned ONE brand color (its eyebrow, title highlight, blob, and primary accents all match). Rotate so adjacent sections differ — the live Home runs: Hero(rosa eyebrow/azul highlight) → Boas-vindas(azul/rosa) → Diferenciais(verde) → Especialidades(lilás) → Abordagem(lilás band) → Como começar(amarelo) → Blog(verde) → Reels(rosa) → CTA(brand gradient).
- **One full-color band per page:** only the appointment CTA (or a single featured world) floods color. Everything else keeps color in cards on a light ground.
- **Waves** carry the eye between bands; the wave fill = the next section's background color.

---

## 5. Grid templates

```css
/* Specialty / feature cards — fluid, auto-fitting */
.grid--specs { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

/* Worlds (Unidades) — 3 up, big */
.grid--worlds { display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }

/* Split: copy + character (hero, sobre) */
.split { display: grid; gap: clamp(32px, 5vw, 72px); grid-template-columns: 1.1fr 0.9fr; align-items: center; }
@media (max-width: 880px) { .split { grid-template-columns: 1fr; } .split__art { order: -1; } }

/* Stats — even auto-fit */
.stats { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }

/* Steps — horizontal desktop, vertical mobile */
.steps { display: grid; gap: 28px; grid-template-columns: repeat(4, 1fr); }
@media (max-width: 760px) { .steps { grid-template-columns: 1fr; } }
```

On the split layout, the character art goes **above** the copy on mobile (`order: -1`) so the friendly face greets first.

---

## 6. The sitemap (pages & what each holds)

| Page | Coded lead | Key sections | Characters / worlds |
|---|---|---|---|
| **Início** (home, BUILT) | rosa→multi | Hero (vídeo institucional) · stats (+11/2/700m²/+3000) · Boas-vindas (split) · Diferenciais (feature cards) · Especialidades (chips) · Abordagem (banda lilás-soft) · Por onde começar (steps, 100vh) · Blog (prévia) · **Reels do Instagram** · CTA (abraço Li & Lo) · Footer | Hero: peek `hero-turma.png` + puzzle bits; CTA: `cta-abraco.png` |
| **Sobre / Equipe** | azul | Quem somos · missão (acolhimento/segurança) · abordagem ABA · equipe (+55 especialistas) / responsável técnico · valores | Li & Lo in the split; Dr. Guilherme Sander & Carla Lima credited |
| **Especialidades** | lilás | Intro · filtro por área · grid completo (11+) · cada uma com cor+ícone · CTA | icon tiles; optional character per area |
| **Especialidade (detalhe)** | per-spec | O que é · para quem · como ajuda · FAQ curto · CTA | narrow container |
| **Unidades** | per-world | Switcher Quintino/Casa ABA · endereço+mapa+horário · **salas temáticas** (Espaço/Floresta/Fundo do Mar) | **Themed-world art lives ONLY here** |
| **A Turma** | amarelo | Apresentação do elenco · carrossel Li, Lo, Turminha, Zig & Dom · história de cada um | Full cast; the playful page |
| **Conteúdo / Blog** | verde | Lista de artigos para famílias (orientação parental, sinais, ABA explicada) | narrow; gentle editorial |
| **Contato / Agende** | azul | Form de agendamento · WhatsApp em destaque · dois endereços · mapa · horários | success-state character |
| **FAQ** | azul | Accordion de dúvidas comuns | — |
| **Trabalhe conosco** (opt) | verde | Cultura · vagas · form | — |

Always-present: floating nav, WhatsApp float, footer with both units + the "Reduzir animações" toggle.

The **Unidades** page is the home of the themed worlds — Espaço, Floresta, Fundo do Mar represent the real therapy rooms. Everywhere else, use the everyday cast (Li, Lo, Turminha, pets Zig & Dom).

---

## 7. Responsive playbook

Design mobile-first. The live `main.css` breaks at **980 · 880 · 760 · 560** (test at 390/768/1024 too). What each does: `980` stacks the hero/split/approach/CTA two-columns (art on top); `880` swaps nav links for the burger drawer and collapses the footer to 2 columns; `760` drops the steps to a single column and hides the dashed connector; `560` is the small-phone pass (tighter nav, single-column footer/steps, full-width cookie banner, smaller WhatsApp float).

| Knob | Desktop | Tablet (≤880) | Mobile (≤560) |
|---|---|---|---|
| Section padding-block | 96–120px | 80px | 64px |
| Container side padding | up to 80px | 32px | 20px |
| Nav | full pill + links | links → burger drawer | burger drawer |
| Hero | split (copy + video) | stacked, video on top (≤980px) | stacked, video & peek smaller |
| Title clamp | hero up to 56px · H2 up to 64px | mid clamp | floor (34px) |
| Spec grid | 3–4 up | 2 up | 1 up |
| Worlds grid | 3 up | 2 up | 1 up |
| Steps | horizontal (4 cols) | 2×2 | vertical |
| Stats | 3–4 inline | 2×2 | 2×2 or stacked |
| Floating blobs | full size | scale 0.7, fewer | 1 small or hide |
| WhatsApp float | 60px | 60px | 54px, lifted above footer |

Mobile must-checks: tap targets ≥44px; body text ≥16px (never shrink below for "fit"); Barnacle Boy headings stay ≥34px or fall back to a comfortable floor; characters never overlap text or get clipped awkwardly; the nav drawer's WhatsApp CTA is reachable with the thumb. Test the appointment form on a real phone — it's the conversion path.

Keep vertical rhythm generous even on mobile; cramped is off-brand. When space is tight, drop a decorative blob or mascot before you tighten the whitespace.
