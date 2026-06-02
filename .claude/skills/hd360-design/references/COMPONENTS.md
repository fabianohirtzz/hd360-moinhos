# COMPONENTS.md — Component anatomy

Read this before adding or modifying any component. HD360 already has a defined language — **extend the closest analog before inventing.** Every component obeys the prime directive: light canvas, rounded corners, soft color-tinted shadows, calm motion, accessible. All class names are BEM (`block__element--modifier`).

> **Ground truth:** the components below are BUILT in `index.html` + `assets/css/main.css`. Where a snippet here differs from the live CSS, the live CSS wins — these snippets are now documented *from* the implementation. Class names are BEM (`block__element--modifier`).

## Component index
1. Soft floating nav (logo + puzzle-piece menu)
2. Welcoming hero (institutional video)
3. Button system
4. Specialty preview chips (Home) + specialty card (Atendimento)
5. Feature / diferenciais card
6. World card (Unidades page)
7. Character block & mascot slot
8. Stat band
9. Step / "por onde começar" timeline
10. Instagram Reels carousel
11. Testimonial card
12. FAQ accordion
13. Appointment CTA band (the abraço)
14. Footer
15. WhatsApp float (gradient) + contact
16. Cookie banner

---

## 1. Soft floating nav (logo + puzzle-piece menu)

A pill-shaped, white, softly-shadowed bar floating a little below the top edge (`background: rgba(255,255,255,.92)` + `backdrop-filter: blur(10px)`). Not glass-on-dark (that's the other projects) — **bright white with a soft shadow.** The brand is the **PNG logo** (`images/logo-3.png`), not a wordmark. Each menu link carries a **puzzle-piece icon** (the `#ic-puzzle` sprite) and a `data-color` so its hover/active state lights up in a different brand color, item by item — a small, ownable touch that ties the nav back to the logo.

```html
<header class="nav" data-nav>
  <a class="nav__brand" href="index.html" aria-label="HD360 Moinhos, início">
    <img class="nav__logo" src="images/logo-3.png" alt="HD360 Moinhos" width="170" height="48" />
  </a>
  <nav class="nav__links" aria-label="Navegação principal">
    <a class="nav__link" href="index.html" data-color="azul" aria-current="page"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Início</a>
    <a class="nav__link" href="atendimento.html" data-color="rosa"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Atendimento</a>
    <a class="nav__link" href="equipe.html" data-color="amarelo"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Equipe</a>
    <a class="nav__link" href="unidades.html" data-color="verde"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Unidades</a>
    <a class="nav__link" href="ouvidoria.html" data-color="lilas"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Ouvidoria</a>
    <a class="nav__link" href="blog.html" data-color="azul"><span class="nav__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Blog</a>
  </nav>
  <a class="btn btn--solid btn--lilas nav__cta" href="https://wa.me/555121128884?text=..." target="_blank" rel="noopener">Agende uma visita</a>
  <button class="nav__burger" data-burger aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer">
    <span></span><span></span><span></span>
  </button>
</header>
```

The real sitemap is **Início · Atendimento · Equipe · Unidades · Ouvidoria · Blog** (matching `docs/COPY.md`), not the earlier draft labels. The puzzle icon comes from an inline SVG sprite (`<symbol id="ic-puzzle">`) declared once at the top of `<body>`.

```css
.nav {
  position: fixed; inset: 14px 14px auto 14px; z-index: 100;
  max-width: var(--container); margin-inline: auto;
  display: flex; align-items: center; gap: 20px;
  padding: 9px 12px 9px 20px;
  background: rgba(255,255,255,.92); backdrop-filter: blur(10px);
  border-radius: var(--r-pill);
  box-shadow: 0 10px 30px rgba(46,42,57,.08), 0 2px 6px rgba(46,42,57,.04);
  transition: padding .3s var(--ease-soft), box-shadow .3s var(--ease-soft);
}
.nav.is-scrolled { padding-block: 6px; box-shadow: 0 8px 24px rgba(46,42,57,.12); }
.nav__logo { height: 40px; width: auto; transition: height .3s var(--ease-soft); }
.nav.is-scrolled .nav__logo { height: 34px; }
.nav__links { display: flex; gap: 2px; margin-inline: auto; }
.nav__link { display: inline-flex; align-items: center; gap: 8px; padding: 9px 15px; border-radius: var(--r-pill); font: 600 15px/1 var(--font-body); color: var(--tinta); transition: background .2s var(--ease-soft), color .2s var(--ease-soft); }
.nav__puzzle { display: inline-grid; place-items: center; width: 18px; height: 18px; }
.nav__puzzle svg { width: 18px; height: 18px; fill: var(--c, var(--azul)); transition: fill .2s var(--ease-soft); }

/* per-item coded color via data-color: sets --c / --c-soft / --c-ink */
.nav__link[data-color="azul"]    { --c: var(--azul);    --c-soft: var(--azul-soft);    --c-ink: var(--azul-ink); }
.nav__link[data-color="rosa"]    { --c: var(--rosa);    --c-soft: var(--rosa-soft);    --c-ink: var(--rosa-ink); }
.nav__link[data-color="amarelo"] { --c: var(--amarelo); --c-soft: var(--amarelo-soft); --c-ink: var(--amarelo-ink); }
.nav__link[data-color="verde"]   { --c: var(--verde);   --c-soft: var(--verde-soft);   --c-ink: var(--verde-ink); }
.nav__link[data-color="lilas"]   { --c: var(--lilas);   --c-soft: var(--lilas-soft);   --c-ink: var(--lilas-ink); }

/* hover / focus / current page: soft tint background, ink text, the puzzle piece pops + colors in */
.nav__link:hover, .nav__link:focus-visible, .nav__link[aria-current="page"] { background: var(--c-soft); color: var(--c-ink); }
.nav__link:hover .nav__puzzle svg, .nav__link[aria-current="page"] .nav__puzzle svg { fill: var(--c); }
.nav__link:hover .nav__puzzle, .nav__link:focus-visible .nav__puzzle { animation: puzzle-pop .55s var(--ease-bounce); }
```

The `puzzle-pop` keyframe (a small wobble + scale) lives in `main.css` and ANIMATIONS.md § Puzzle-pop. On scroll, `data-nav` + JS adds `.is-scrolled` to shrink padding and logo subtly — never darken. The **mobile drawer** mirrors this exactly: `.drawer__link[data-color=...]` with `.drawer__puzzle`, the `logo-3.png` at the top, and the lilás `Agende uma visita` CTA pinned at the bottom (INTERACTIONS § Drawer).

```css
.nav__burger { display: none; }   /* a round azul-soft burger with 3 bars */
@media (max-width: 880px) { .nav__links, .nav__cta { display: none; } .nav__burger { display: flex; } }
```

---

## 2. Welcoming hero (institutional video)

A full-height (`min-height: 100svh`), bright, airy hero on a `--grad-ceu` sky wash. **Two columns:** copy on the left (eyebrow → Barnacle Boy headline with one colored word → warm lede → two CTAs → a small trust row), and the **institutional video** on the right in a gradient-bordered frame, garnished with floating puzzle pieces and a character peeking from the corner. Three soft blobs float in the background. The grid is `1fr 1.06fr` (video slightly favored). On Home, this is the brand's first impression — warm, calm, and clearly a real clinic.

```html
<section class="hero">
  <div class="hero__bg" aria-hidden="true">
    <span class="blob blob--azul"></span><span class="blob blob--amarelo"></span><span class="blob blob--lilas"></span>
  </div>
  <div class="container hero__inner">
    <div class="hero__copy">
      <p class="eyebrow eyebrow--rosa reveal"><span class="eyebrow__dot" aria-hidden="true"></span> Clínica de autismo · Porto Alegre</p>
      <h1 class="hero__title reveal" style="--i:1">Um lugar onde cada pessoa é <span class="hl hl--azul">vista por inteiro</span></h1>
      <p class="hero__lede reveal" style="--i:2">Diagnóstico, terapia ABA e uma equipe de mais de 55 especialistas trabalhando juntos, num ambiente pensado para acolher, com segurança e afeto, o desenvolvimento de quem você ama.</p>
      <div class="hero__actions reveal" style="--i:3">
        <a class="btn btn--solid btn--lilas" href="https://wa.me/555121128884" target="_blank" rel="noopener">Agende uma visita</a>
        <a class="btn btn--ghost btn--lilas" href="atendimento.html">Conheça as especialidades</a>
      </div>
      <ul class="hero__trust reveal" style="--i:4">
        <li><b>+55</b> especialistas</li><li><b>+11</b> especialidades</li><li><b>2</b> unidades</li><li>Terapia <b>ABA</b></li>
      </ul>
    </div>
    <figure class="hero__media reveal" style="--i:2">
      <div class="hero__video-frame">
        <span class="hero__video-tag" aria-hidden="true">Conheça a HD360</span>
        <video class="hero__video" data-hero-video poster="assets/img/hero-poster.jpg" muted loop playsinline preload="metadata" aria-label="Vídeo institucional da HD360 Moinhos">
          <source src="assets/video/institucional.mp4" type="video/mp4" />
        </video>
        <div class="hero__video-controls">
          <button class="vctrl is-playing" data-video-play aria-label="Pausar vídeo">…play/pause svgs…</button>
          <button class="vctrl is-muted" data-video-mute aria-label="Ativar som">…mute/unmute svgs…</button>
        </div>
      </div>
      <span class="hero__puzzle hero__puzzle--1" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>
      <span class="hero__puzzle hero__puzzle--2" aria-hidden="true">…</span>
      <span class="hero__puzzle hero__puzzle--3" aria-hidden="true">…</span>
      <span class="hero__peek" aria-hidden="true"><img src="assets/img/hero-turma.png" alt="" class="float float--lag" /></span>
    </figure>
  </div>
  <div class="wave wave--bottom" aria-hidden="true"><svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0,40 C360,100 1080,0 1440,55 L1440,90 L0,90 Z" fill="#fbf8f3"/></svg></div>
</section>
```

```css
.hero { position: relative; min-height: 100svh; display: grid; align-items: center; padding-top: calc(var(--nav-h) + 12px); background: var(--grad-ceu); overflow: clip; }
.hero__inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1.06fr; gap: clamp(28px,3.5vw,50px); align-items: center; }
.hero__title { font-size: clamp(34px,4.7vw,56px); line-height: 1.04; }   /* restrained — shares the row with the video */
.hero__video-frame { position: relative; padding: 7px; border-radius: var(--r-xl); background: var(--grad-marca); box-shadow: 0 26px 54px rgba(46,42,57,.18); }
.hero__video { display: block; width: 100%; aspect-ratio: 16/10; object-fit: cover; border-radius: calc(var(--r-xl) - 7px); }
.hero__puzzle { position: absolute; z-index: 3; pointer-events: none; }   /* --1 amarelo, --2 verde, --3 rosa; each bobs */
.hero__peek { position: absolute; bottom: -26px; left: -34px; width: 150px; z-index: 4; pointer-events: none; }   /* character peeking past the frame */
```

Key rules: the **video autoplays muted, loops, and respects calm** (it only autoplays when reduced-motion / `.calm` is off — see INTERACTIONS § Hero video). The gradient `--grad-marca` border is the brand's signature frame. Floating puzzle pieces and the peek character are decorative (`aria-hidden`). The section ends in a **wave divider** whose fill is the *next* section's color, never a straight edge. Title is Barnacle Boy with exactly one colored word. On mobile (`≤980px`) the columns stack with the video on top, capped at `540px`.

---

## 3. Button system

**No gradients on buttons** (client preference). Buttons use **solid brand colors**, and the color **varies per section** (hero/CTA global = lilás/roxo, quem somos = rosa, especialidades = azul, abordagem = verde, etc). All pills, all with the same hover (lift + colored shadow + a diagonal shine sweep; outline buttons fill with the color on hover).

The system is **variable-driven**: a color class (`--azul/--rosa/--lilas/--verde/--amarelo`) sets the palette vars, and a shape class (`--solid` or `--ghost`) consumes them. Compose two classes: `class="btn btn--solid btn--lilas"` or `class="btn btn--ghost btn--verde"`.

```css
.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  min-height: 48px; padding: 14px 28px; border-radius: var(--r-pill);
  font: 600 15px/1 var(--font-body); letter-spacing: .01em; cursor: pointer; border: 0;
  transition: transform .28s var(--ease-bounce), box-shadow .28s var(--ease-soft), background .25s, color .25s;
  --c: var(--azul); --c-on: #fff; --c-ink: var(--azul-ink); --c-rgb: 0,165,234; /* fallback */
}
/* shine sweep */
.btn::before { content:""; position:absolute; top:0; left:-120%; width:55%; height:100%;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.4) 50%, transparent 80%);
  transform: skewX(-18deg); transition: left .6s var(--ease-soft); pointer-events:none; }
.btn:hover::before { left: 135%; }
.btn:hover { transform: translateY(-3px) scale(1.02); }
.btn:active { transform: translateY(-1px) scale(.97); }

/* palettes — text is white, EXCEPT verde/amarelo (light colors) which use dark ink */
.btn--azul    { --c: var(--azul);    --c-on:#fff;         --c-ink: var(--azul-ink);    --c-rgb: 0,165,234; }
.btn--rosa    { --c: var(--rosa);    --c-on:#fff;         --c-ink: var(--rosa-ink);    --c-rgb: 251,60,99; }
.btn--lilas   { --c: var(--lilas);   --c-on:#fff;         --c-ink: var(--lilas-ink);   --c-rgb: 143,100,200; }
.btn--verde   { --c: var(--verde);   --c-on: var(--tinta);--c-ink: var(--verde-ink);   --c-rgb: 168,196,32; }
.btn--amarelo { --c: var(--amarelo); --c-on: var(--tinta);--c-ink: var(--amarelo-ink); --c-rgb: 255,199,0; }

.btn--solid { background: var(--c); color: var(--c-on); box-shadow: 0 10px 24px rgba(var(--c-rgb),.30); }
.btn--solid:hover { box-shadow: 0 16px 34px rgba(var(--c-rgb),.44); }
.btn--ghost { background: var(--branco); color: var(--c-ink); box-shadow: inset 0 0 0 2px var(--c); }
.btn--ghost:hover { background: var(--c); color: var(--c-on); box-shadow: inset 0 0 0 2px var(--c), 0 14px 30px rgba(var(--c-rgb),.34); }

/* on a colored CTA band, use white / outline-white instead of brand colors */
.btn--white { background:#fff; color: var(--rosa); }
.btn--ghost-on-color { background: rgba(255,255,255,.16); color:#fff; box-shadow: inset 0 0 0 2px rgba(255,255,255,.6); }
```

Per-section color rotation (extend as new sections appear): **lilás → rosa → azul → verde → amarelo**, never two adjacent sections sharing the primary-button color. Buttons may carry a leading icon (rounded SVG) but never an emoji. Min height 48px (touch target). The shine + transforms collapse to instant under `prefers-reduced-motion`.

---

## 4. Specialty preview chips (Home) + specialty card (Atendimento)

Two presentations of the 11+ specialties:

### 4a. Preview chips — the Home `#especialidades` section (BUILT)

On Home, the specialties appear as a wrapping cloud of small white pills, each with a **puzzle-piece icon** that cycles through the five brand colors (`:nth-child(5n+…)`). Centered, two lines, a single "Ver todas as especialidades" CTA below. Light and scannable — the full coded cards live on the Atendimento page.

```html
<div class="chips">
  <span class="chip"><span class="chip__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Fonoaudiologia</span>
  <span class="chip"><span class="chip__puzzle" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>Terapia Ocupacional</span>
  <!-- … Psicologia · Musicoterapia · Psicopedagogia · Fisioterapia · Psicomotricidade · Nutrição · Arteterapia · Acompanhante Terapêutico · Avaliação Neuropsicológica -->
</div>
<div class="especialidades__cta"><a class="btn btn--solid btn--azul" href="atendimento.html">Ver todas as especialidades</a></div>
```

```css
.chips { display: flex; flex-wrap: wrap; gap: 9px; justify-content: center; max-width: 1120px; margin-inline: auto; }
.chip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: var(--r-pill); background: var(--branco); color: var(--tinta); font: 600 14px/1 var(--font-body); white-space: nowrap; box-shadow: 0 6px 16px rgba(46,42,57,.06); transition: transform .2s var(--ease-gentle); }
.chip:hover { transform: translateY(-3px); }
.chip__puzzle svg { width: 16px; height: 16px; }
/* the puzzle piece rotates through the 5 colors so the cloud reads as a coded spectrum */
.chip:nth-child(5n+1) .chip__puzzle svg { fill: var(--azul); }
.chip:nth-child(5n+2) .chip__puzzle svg { fill: var(--rosa); }
.chip:nth-child(5n+3) .chip__puzzle svg { fill: var(--lilas); }
.chip:nth-child(5n+4) .chip__puzzle svg { fill: var(--verde); }
.chip:nth-child(5n+5) .chip__puzzle svg { fill: var(--amarelo); }
```

### 4b. Specialty card — the Atendimento page grid

The richer content unit. A rounded white card with a **coded soft-tint icon tile**, title (Montserrat 700), short description, and a quiet "Saiba mais →". The whole card is the link. On hover it lifts with its coded colored shadow.

```html
<article class="spec">
  <span class="spec__icon spec__icon--azul" aria-hidden="true"><!-- rounded svg --></span>
  <h3 class="spec__title">Fonoaudiologia</h3>
  <p class="spec__text">Comunicação, linguagem e alimentação — desenvolvendo a fala e a interação no ritmo de cada criança.</p>
  <a class="spec__link" href="/especialidades/fonoaudiologia">Saiba mais<span aria-hidden="true">→</span></a>
</article>
```

```css
.spec {
  display: flex; flex-direction: column; gap: 14px;
  padding: 32px 28px; background: var(--branco);
  border-radius: var(--r-lg);
  box-shadow: 0 12px 30px rgba(46,42,57,.06), 0 4px 10px rgba(46,42,57,.04);
  transition: transform .25s var(--ease-gentle), box-shadow .25s var(--ease-soft);
}
.spec:hover { transform: translateY(-6px); box-shadow: 0 24px 50px rgba(0,165,234,.18); }
.spec__icon {
  width: 60px; height: 60px; border-radius: var(--r-md);
  display: grid; place-items: center;
}
.spec__icon--azul { background: var(--azul-soft); color: var(--azul-ink); }
/* one modifier per coded color; hover shadow rgb should match the card's color */
.spec__title { font: 700 21px/1.2 var(--font-body); color: var(--tinta); margin: 0; }
.spec__text  { font: 400 15.5px/1.6 var(--font-body); color: var(--tinta-muted); margin: 0; }
.spec__link  { margin-top: auto; font: 600 15px/1 var(--font-body); color: var(--azul); text-decoration: none; display: inline-flex; gap: 6px; }
.spec__link span { transition: transform .2s var(--ease-soft); }
.spec:hover .spec__link span { transform: translateX(4px); }
```

Grid: `repeat(auto-fit, minmax(260px, 1fr))`, gap `24px`. **Rotate the coded colors across the grid** (azul, verde, lilás, rosa, amarelo, repeat) so no two neighbors share a hue — this is what makes the grid sing without chaos. Cards reveal with a stagger (ANIMATIONS.md § Stagger).

A filterable version (by area: Comunicação / Comportamento / Corpo / Diagnóstico) is in INTERACTIONS.md § Specialty filter.

---

## 5. Feature / diferenciais card (BUILT)

The Home "Por que famílias confiam na HD360" grid uses a close cousin of the spec card: the `.feature` block. White rounded card, a coded soft-tint icon tile, a Montserrat-700 title, and a muted description. The coded color comes from an `is-{cor}` modifier on the card (which tints both the icon tile and the hover shadow). Auto-fit grid, rotate the colors so neighbors differ.

```html
<article class="feature is-verde reveal" style="--i:0">
  <span class="feature__icon" aria-hidden="true"><!-- rounded svg --></span>
  <h3 class="feature__title">Equipe multidisciplinar de verdade</h3>
  <p class="feature__text">Mais de 55 especialistas de diversas áreas que conversam entre si para construir um plano único para cada paciente.</p>
</article>
```

```css
.features { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.feature { background: var(--branco); border-radius: var(--r-lg); padding: 30px 28px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 30px rgba(46,42,57,.06), 0 4px 10px rgba(46,42,57,.04); transition: transform .25s var(--ease-gentle), box-shadow .25s var(--ease-soft); }
.feature:hover { transform: translateY(-6px); }
.feature__icon { width: 58px; height: 58px; border-radius: var(--r-md); display: grid; place-items: center; }
/* coded color: the is-{cor} class drives the icon tint AND the colored hover shadow */
.is-verde .feature__icon { background: var(--verde-soft); color: var(--verde-ink); }
.is-verde:hover { box-shadow: 0 24px 50px rgba(168,196,32,.2); }
```

The same `is-{cor}` / `icon--{cor}` helper drives any coded soft-tint icon tile across the site. The lilás-tinted **"Nossa abordagem"** band (`.approach__card`, `background: var(--lilas-soft)`) is a sibling pattern: a soft full-tint card (not full-color) holding copy + a character, used once mid-page.

---

## 6. World card (Unidades page)

**Only on the Unidades page.** Each therapy environment is a themed world — Espaço, Floresta, Fundo do Mar — using the dedicated art in `images/Espaço/`, `images/Floresta/`, `images/Fundo do Mar/`. A large rounded card with a themed gradient backdrop, the world's characters floating, and the room name.

```html
<article class="world world--mar">
  <div class="world__scene" aria-hidden="true">
    <img class="world__char world__char--1" src="images/Fundo do Mar/peixe.png" alt="" />
    <img class="world__char world__char--2" src="images/Fundo do Mar/polvo.png" alt="" />
  </div>
  <div class="world__label">
    <span class="eyebrow eyebrow--azul"><span class="eyebrow__dot"></span> Sala temática</span>
    <h3 class="world__title">Fundo do Mar</h3>
    <p class="world__text">Um mergulho calmo para a integração sensorial e o relaxamento.</p>
  </div>
</article>
```

```css
.world { position: relative; overflow: hidden; border-radius: var(--r-xl); min-height: 360px; padding: 32px; display: flex; align-items: flex-end; }
.world--mar    { background: linear-gradient(160deg, #E4F6FD, #bdeafc); }
.world--floresta { background: linear-gradient(160deg, #F1F6D9, #d7e9a6); }
.world--espaco { background: linear-gradient(160deg, #EFE7F8, #cdb6ec); }
.world__char { position: absolute; will-change: transform; }   /* floated via ANIMATIONS.md */
.world__title { font: 400 clamp(26px,3vw,38px)/1 var(--font-display); color: var(--tinta); }
.world__label { background: rgba(255,255,255,.7); backdrop-filter: blur(6px); border-radius: var(--r-lg); padding: 20px 24px; max-width: 360px; }
```

The backdrop tints are the *light* world washes (so foreground characters and the white label pop). Characters float gently. This is the one place themed-world art appears — keep it here.

---

## 7. Character block & mascot slot

Two uses: a **mascot slot** (small decorative character anchored to a section corner, `aria-hidden`) and a **character block** (a meaningful full character moment, e.g. on the "A Turma" page introducing Li, Lo, Zig, Dom).

```html
<!-- Mascot slot: decorative, floats in a corner -->
<figure class="mascot mascot--corner-br" aria-hidden="true">
  <img src="images/Lo/lo-pula.png" alt="" loading="lazy" />
</figure>

<!-- Character block: meaningful intro -->
<article class="character character--verde">
  <figure class="character__art"><img src="images/Lo/lo-acena.png" alt="Lo, personagem da HD360" /></figure>
  <div class="character__copy">
    <h3 class="character__name">Lo</h3>
    <p class="character__role">Curioso e cheio de energia — adora explorar a Floresta.</p>
  </div>
</article>
```

Rules: decorative mascots always `aria-hidden=""` + empty `alt`; meaningful characters get a real `alt`. Frame meaningful characters in a **blob-rounded** coded backdrop. Map characters to their coded colors (Li→rosa, Lo→verde, Turminha→amarelo group, pets→neutral/warm). Many character arts wear headphones — lean into that on sensory/calm sections.

---

## 8. Stat band (BUILT — real numbers)

A white rounded card sitting on a cream band, 4 stats, Barnacle Boy numbers in rotating coded colors, count-up on reveal. The band carries a **bottom wave** into the next section. The live numbers (client-confirmed) are below — note `hl--azul` etc. tint each number, and "**pacientes**" is the client's wording.

```html
<div class="stats reveal">
  <div class="stat"><span class="stat__num hl--rosa" data-count="11">+11</span><span class="stat__key">especialidades</span></div>
  <div class="stat"><span class="stat__num hl--verde" data-count="2">2</span><span class="stat__key">unidades</span></div>
  <div class="stat"><span class="stat__num hl--lilas" data-count="700">700</span><span class="stat__key">m² de estrutura</span></div>
  <div class="stat"><span class="stat__num hl--azul" data-count="3000">+3000</span><span class="stat__key">pacientes atendidos</span></div>
</div>
```

```css
.stats { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 24px; background: var(--branco); border-radius: var(--r-xl); padding: clamp(32px,5vw,52px); text-align: center; box-shadow: 0 16px 40px rgba(46,42,57,.06); }
.stat__num { display: block; font: 400 clamp(40px,6vw,68px)/1 var(--font-display); }
.stat__key { font: 600 13.5px/1.3 var(--font-body); text-transform: uppercase; letter-spacing: .08em; color: var(--tinta-muted); }
```

The count-up reads the `data-count` and prefixes any leading `+`/`~`. `hl--azul` etc. resolve to the `*-ink`-safe coded color (the `.hl` highlight uses full-strength color, which is fine on the big display numeral). Confirm any new number with the client before publishing.

---

## 9. Step / "por onde começar" timeline (BUILT)

How a family starts (Contato → Avaliação → Plano → Acompanhamento). Rounded numbered nodes (Barnacle Boy numerals) connected by a soft dashed line. On Home this lives in a **full-height section** (`#como-comecar { min-height: 100svh; display: grid; align-items: center; }`) so the four steps get room to breathe. The color is assigned by `:nth-child` (azul → lilás → verde → rosa) rather than a modifier class, and there are **no `<ol>` markers** (`list-style: none`). Each node has a playful hover: it lifts, scales, tilts, a colored halo ring pulses out, and a coded shadow blooms.

```html
<ol class="steps">
  <li class="step reveal" style="--i:0"><span class="step__num">1</span><h3 class="step__title">Primeiro contato</h3><p class="step__text">Fale com a gente no WhatsApp e conte um pouco da sua história.</p></li>
  <li class="step reveal" style="--i:1"><span class="step__num">2</span><h3 class="step__title">Avaliação</h3><p class="step__text">Nossa equipe conhece o paciente e entende, com cuidado, suas necessidades e potências.</p></li>
  <!-- 3 Plano sob medida · 4 Acompanhamento -->
</ol>
```

```css
.steps { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.step__num { position: relative; width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; display: grid; place-items: center; font: 400 30px/1 var(--font-display); color: #fff; transition: transform .35s var(--ease-bounce), box-shadow .35s var(--ease-soft); }
.step:nth-child(1) .step__num { background: var(--azul); }   /* 2 lilás · 3 verde · 4 rosa */
.step__num::after { content: ""; position: absolute; inset: -7px; border-radius: 50%; border: 2.5px solid currentColor; opacity: 0; transform: scale(.7); transition: opacity .35s, transform .35s var(--ease-bounce); }
.step:hover .step__num { transform: translateY(-5px) scale(1.12) rotate(-6deg); }
.step:hover .step__num::after { opacity: .55; transform: scale(1); }
.step:not(:last-child)::after { content: ""; position: absolute; top: 32px; left: calc(50% + 42px); right: calc(-50% + 42px); height: 3px; background: repeating-linear-gradient(90deg, var(--linha) 0 8px, transparent 8px 16px); }
```

The connecting dashed line is the `.step::after` repeating-gradient — soft, never a hard rule. It hides below 760px where the steps stack.

---

## 10. Instagram Reels carousel (BUILT)

A horizontal, snap-scrolling carousel of the clinic's **own** vertical videos (9:16), each a click-to-play card. This is the brand's real social proof — it replaces stock photos. Eyebrow "No nosso Instagram", title "Acompanhe o nosso dia a dia". One video plays at a time; **sound turns on when the user presses play** (a deliberate client choice, and acceptable because playback is user-initiated, not autoplay). Prev/next arrows disable at the ends.

```html
<div class="reels__viewport reveal">
  <div class="reels__track" data-reels-track>
    <article class="reel">
      <div class="reel__media">
        <video class="reel__video" data-reel poster="assets/img/reels/casa-aba.jpg" loop playsinline preload="none" muted>
          <source src="assets/video/reels/casa-aba.mp4" type="video/mp4" />
        </video>
        <span class="reel__badge" aria-hidden="true"><!-- play glyph --> Reel</span>
        <button class="reel__play" data-reel-play aria-label="Reproduzir o reel Casa ABA"><!-- big play --></button>
        <div class="reel__controls">
          <button class="reel__ctrl reel__toggle" data-reel-toggle aria-label="Pausar ou reproduzir"><!-- play/pause svgs --></button>
          <button class="reel__ctrl reel__mute is-muted" data-reel-mute aria-label="Ativar som"><!-- mute/unmute svgs --></button>
        </div>
      </div>
      <p class="reel__cap">Casa ABA</p>
    </article>
    <!-- … more .reel articles … -->
  </div>
</div>
<div class="reels__nav">
  <button class="reels__arrow" data-reels-prev aria-label="Anterior"><!-- chevron --></button>
  <button class="reels__arrow" data-reels-next aria-label="Próximo"><!-- chevron --></button>
  <a class="btn btn--solid btn--rosa reels__cta" href="https://instagram.com/hd360moinhos" target="_blank" rel="noopener">Seguir no Instagram</a>
</div>
```

```css
.reels__track { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; padding: 10px 4px 18px; scrollbar-width: none; }
.reels__track::-webkit-scrollbar { display: none; }
.reel { flex: 0 0 clamp(220px, 66vw, 268px); scroll-snap-align: center; }
.reel__media { position: relative; aspect-ratio: 9/16; border-radius: var(--r-lg); overflow: hidden; background: #0b0b0f; box-shadow: 0 14px 34px rgba(46,42,57,.14); }
.reel__video { width: 100%; height: 100%; object-fit: cover; }
.reel__play { position: absolute; inset: 0; margin: auto; width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.94); display: grid; place-items: center; transition: transform .25s var(--ease-bounce), opacity .25s; }
.reel__media.is-playing .reel__play { opacity: 0; pointer-events: none; transform: scale(.5); }   /* big play hides while playing */
.reel__controls { position: absolute; right: 10px; bottom: 10px; display: flex; gap: 8px; opacity: 0; transition: opacity .25s; }
.reel__media:hover .reel__controls, .reel__media.is-playing .reel__controls, .reel__media:focus-within .reel__controls { opacity: 1; }
.reels__arrow:hover:not(:disabled) { transform: scale(1.1); background: var(--rosa); color: #fff; }
.reels__arrow:disabled { opacity: .35; cursor: default; }
```

The card's **dark media well** (`#0b0b0f`) is the one place a dark surface is allowed — it's a video frame, like a phone screen, not a section background. The play/pause/mute icons swap via `is-playing` / `is-muted` classes (see § Hero video for the same icon-swap pattern). Wiring is in INTERACTIONS § Reels carousel.

---

## 11. Testimonial card

Parents' words. A warm card with a soft quote mark (in a coded color), the quote in a comfortable reading size, and a simple attribution (first name + relationship: "Mãe do Theo, 5 anos"). Optional small avatar (initial in a coded circle — avoid stock faces for privacy).

```css
.quote { background: var(--branco); border-radius: var(--r-lg); padding: 32px; box-shadow: 0 12px 30px rgba(46,42,57,.06); }
.quote__mark { font: 400 56px/0.6 var(--font-display); color: var(--rosa); }
.quote__text { font: 500 18px/1.6 var(--font-body); color: var(--tinta); }
.quote__by { font: 600 14px/1 var(--font-body); color: var(--tinta-muted); }
```

Carousel behavior (if more than 3) in INTERACTIONS.md. Keep it calm — manual controls, no autoplay, or very slow autoplay that pauses on hover/focus and respects reduced-motion.

---

## 12. FAQ accordion

Common parent questions (Como funciona a terapia ABA? Vocês atendem convênio? A partir de que idade? Preciso de diagnóstico para começar?). Rounded items, soft tint on the open item, smooth height animation, full keyboard support.

```html
<div class="faq" data-accordion>
  <details class="faq__item">
    <summary class="faq__q">A partir de que idade vocês atendem?<span class="faq__chevron" aria-hidden="true"></span></summary>
    <div class="faq__a"><p>Atendemos desde a primeira infância. Quanto antes a estimulação começa, melhores os resultados — fale com a gente para avaliar o melhor caminho.</p></div>
  </details>
</div>
```

You can use native `<details>` (best for accessibility) enhanced with JS for smooth height + single-open behavior (INTERACTIONS.md § Accordion). Open item gets an `--azul-soft` background and an azul left feel via the chevron rotating.

```css
.faq__item { border-radius: var(--r-md); background: var(--branco); box-shadow: 0 6px 18px rgba(46,42,57,.05); margin-bottom: 12px; overflow: hidden; }
.faq__item[open] { background: var(--azul-soft); }
.faq__q { cursor: pointer; list-style: none; padding: 20px 24px; font: 700 17px/1.4 var(--font-body); color: var(--tinta); display: flex; justify-content: space-between; gap: 16px; }
.faq__chevron { width: 12px; height: 12px; border-right: 2.5px solid var(--azul); border-bottom: 2.5px solid var(--azul); transform: rotate(45deg); transition: transform .35s var(--ease-gentle); }
.faq__item[open] .faq__chevron { transform: rotate(-135deg); }
.faq__a { padding: 0 24px 22px; font: 400 16px/1.65 var(--font-body); color: var(--tinta-muted); }
```

---

## 13. Appointment CTA band (the abraço) (BUILT)

The **one full-color band** the page is allowed. Brand gradient, white Barnacle Boy headline, the **Li & Lo hugging** image (`assets/img/cta-abraco.png`) as the emotional anchor, and two CTAs. A two-column card (`0.82fr 1.18fr`), rounded as a giant card, not full-bleed-sharp. A subtle dark overlay keeps the white text legible over the bright amarelo stop of the gradient. Live headline: **"Vamos cuidar juntos do desenvolvimento de quem você ama"** (all-ages, not "do seu filho").

```html
<section class="cta"><div class="container">
  <div class="cta__card">
    <div class="cta__overlay" aria-hidden="true"></div>
    <figure class="cta__art" aria-hidden="true"><img src="assets/img/cta-abraco.png" alt="" /></figure>
    <div class="cta__copy">
      <h2 class="cta__title">Vamos cuidar juntos do desenvolvimento de quem você ama</h2>
      <p class="cta__text">Agende uma visita e conheça nossa casa, nossa equipe e nosso jeito de cuidar. Será um prazer receber vocês.</p>
      <div class="cta__actions">
        <a class="btn btn--white" href="https://wa.me/555121128884" target="_blank" rel="noopener">Falar no WhatsApp</a>
        <a class="btn btn--ghost-on-color" href="atendimento.html">Agende uma avaliação</a>
      </div>
    </div>
  </div>
</div></section>
```

```css
.cta__card { position: relative; overflow: hidden; border-radius: var(--r-xl); background: var(--grad-marca); color: #fff; padding: clamp(36px,5.5vw,68px); display: grid; grid-template-columns: 0.82fr 1.18fr; gap: clamp(24px,4vw,56px); align-items: center; }
.cta__overlay { position: absolute; inset: 0; z-index: 0; background: linear-gradient(120deg, rgba(0,70,130,.26), transparent 55%); pointer-events: none; }
.cta__art img { position: relative; width: 100%; max-width: 330px; filter: drop-shadow(0 22px 34px rgba(0,0,0,.28)); }
.cta__title { color: #fff; font-size: clamp(30px,4.2vw,52px); line-height: 1.05; text-wrap: balance; }
.btn--white { background: #fff; color: var(--rosa); }
.btn--ghost-on-color { background: rgba(255,255,255,.16); color: #fff; box-shadow: inset 0 0 0 2px rgba(255,255,255,.6); }
```

The `.cta__overlay` is the documented fix for the amarelo-stop contrast risk: a soft dark wash on the side the copy sits over. On mobile the card stacks with the art on top.

---

## 14. Footer

Light cream footer, rounded top corners, organized in friendly columns: brand + tagline + social, both units (address + map link), specialties list, quick links, hours. A small character waves goodbye. The brand uses the **`logo-3.png`** (or `footer__logo`). Real data from DESIGN.md § Content blocks. The footer also holds the **"Reduzir animações"** calm toggle (`.footer__calm[aria-pressed]`).

```html
<footer class="footer">
  <div class="footer__top">
    <div class="footer__brand">
      <img src="images/logo-hd360.svg" alt="HD360 Moinhos" />
      <p>Especialista em autismo, atendimento humanizado.</p>
      <div class="footer__social"><!-- instagram, facebook, whatsapp, linkedin --></div>
    </div>
    <div class="footer__col"><h4>Unidades</h4>
      <p>Quintino Bocaiúva, 451 · Moinhos de Vento</p>
      <p>Casa ABA — Dr. Freire Alemão, 366 · Mont'Serrat</p>
    </div>
    <div class="footer__col"><h4>Atendimento</h4>
      <p>(51) 2112-8884</p><p>contato@hd360.com.br</p><p>Seg–Sex · 08h–19h</p>
    </div>
    <nav class="footer__col"><h4>Navegue</h4><!-- links --></nav>
  </div>
  <div class="footer__bottom">
    <small>© HD360 Moinhos · CNPJ 36.152.938/0001-74 · Resp. Téc. Dr. Guilherme B. Sander (CRM 23.587 · RQE 16104)</small>
    <button class="footer__calm" data-calm-toggle>Reduzir animações</button>
  </div>
</footer>
```

`h4` headings are Montserrat 700 uppercase with a tiny coded dot. Include the optional **"Reduzir animações"** toggle (a real brand gesture — see ANIMATIONS.md § Calm toggle).

---

## 15. WhatsApp float (gradient) + contact (BUILT)

A persistent rounded WhatsApp button bottom-right (the clinic's primary contact channel). **It uses the brand gradient `--grad-marca`, not WhatsApp green** — a deliberate client choice so the float reads as *HD360*, not as a generic WhatsApp badge. Rosa-tinted soft glow, a gentle scale on hover. Respects reduced-motion.

```css
.wpp { position: fixed; right: 18px; bottom: 18px; z-index: 90; width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; background: var(--grad-marca); color: #fff; box-shadow: 0 10px 26px rgba(251,60,99,.32); transition: transform .25s var(--ease-bounce); }
.wpp:hover { transform: scale(1.08); }
.wpp svg { width: 32px; height: 32px; }
```

Always reachable; on mobile it shrinks to `54px` so it never covers footer links.

---

## 16. Cookie banner (BUILT)

A small white rounded card bottom-left that slides up shortly after load (only if no choice is stored), with three actions. Calm and unobtrusive — it animates `transform`, honors `.calm`, and persists the choice in `localStorage` (`hd360-cookies`).

```html
<aside class="cookies" data-cookies>
  <p class="cookies__title">Usamos cookies para cuidar bem da sua visita.</p>
  <p class="cookies__text">Eles nos ajudam a entender como o site é usado. <a href="politica-de-cookies.html">Saiba mais</a>.</p>
  <div class="cookies__actions">
    <button class="btn btn--solid btn--azul" data-cookie-accept="all">Aceitar</button>
    <button class="btn cookies__mini" data-cookie-accept="essential">Só os essenciais</button>
  </div>
</aside>
```

```css
.cookies { position: fixed; left: 16px; bottom: 16px; z-index: 95; max-width: 380px; background: var(--branco); border-radius: var(--r-md); padding: 22px; box-shadow: 0 18px 44px rgba(46,42,57,.18); transform: translateY(140%); transition: transform .5s var(--ease-gentle); }
.cookies.is-in { transform: none; }
```

The button JS sets the stored value and hides the banner; see `assets/js/main.js`.
