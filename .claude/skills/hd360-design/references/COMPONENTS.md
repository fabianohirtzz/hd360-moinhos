# COMPONENTS.md — Component anatomy

Read this before adding or modifying any component. HD360 already has a defined language — **extend the closest analog before inventing.** Every component obeys the prime directive: light canvas, rounded corners, soft color-tinted shadows, calm motion, accessible. All class names are BEM (`block__element--modifier`).

## Component index
1. Soft floating nav
2. Welcoming hero
3. Button system
4. Specialty card + specialty grid
5. World card (Unidades page)
6. Character block & mascot slot
7. Stat band
8. Step / "como funciona" timeline
9. Testimonial card
10. FAQ accordion
11. Appointment CTA band
12. Footer
13. WhatsApp float + contact

---

## 1. Soft floating nav

A pill-shaped, white, softly-shadowed bar floating a little below the top edge. Not glass-on-dark (that's the other projects) — **solid white with a soft shadow.**

```html
<header class="nav" data-nav>
  <a class="nav__brand" href="/" aria-label="HD360 Moinhos — início">
    <img src="images/logo-hd360.svg" alt="HD360 Moinhos" class="nav__logo" />
  </a>
  <nav class="nav__links" aria-label="Principal">
    <a href="/sobre" class="nav__link">Sobre</a>
    <a href="/especialidades" class="nav__link">Especialidades</a>
    <a href="/unidades" class="nav__link">Unidades</a>
    <a href="/a-turma" class="nav__link">A Turma</a>
    <a href="/contato" class="nav__link">Contato</a>
  </nav>
  <a href="https://wa.me/555121128884" class="btn btn--primary nav__cta">Agende uma visita</a>
  <button class="nav__burger" aria-label="Abrir menu" aria-expanded="false" data-burger>
    <span></span><span></span><span></span>
  </button>
</header>
```

```css
.nav {
  position: fixed; inset: 16px 16px auto 16px;
  z-index: 100;
  max-width: 1180px; margin-inline: auto;
  display: flex; align-items: center; gap: 24px;
  padding: 10px 12px 10px 22px;
  background: var(--branco);
  border-radius: var(--r-pill);
  box-shadow: 0 10px 30px rgba(46,42,57,0.08), 0 2px 6px rgba(46,42,57,0.04);
}
.nav__links { display: flex; gap: 4px; margin-inline: auto; }
.nav__link {
  padding: 9px 16px; border-radius: var(--r-pill);
  font: 600 15px/1 var(--font-body); color: var(--tinta);
  text-decoration: none; transition: background .2s var(--ease-soft), color .2s var(--ease-soft);
}
.nav__link:hover, .nav__link[aria-current="page"] { background: var(--azul-soft); color: #0481b6; }
.nav__burger { display: none; }
@media (max-width: 880px) {
  .nav__links, .nav__cta { display: none; }
  .nav__burger { display: inline-flex; }   /* opens the mobile drawer — see INTERACTIONS.md */
}
```

On scroll, you may shrink the vertical padding slightly (`data-nav` + a `.is-scrolled` class) — keep it subtle. Never make it darken.

---

## 2. Welcoming hero

A bright, airy hero: a soft sky/cream wash, a friendly Barnacle Boy headline with one colored word, a warm lede, two CTAs, and a **character (Li or Turminha)** floating on the right with gentle blob backdrops behind. Optional small trust row (CRM / "+11 especialidades / 2 unidades").

```html
<section class="hero">
  <div class="hero__bg" aria-hidden="true">
    <span class="blob blob--azul"></span>
    <span class="blob blob--amarelo"></span>
    <span class="dots" data-dots></span>
  </div>
  <div class="hero__inner">
    <div class="hero__copy">
      <p class="eyebrow eyebrow--rosa"><span class="eyebrow__dot"></span> Clínica de autismo · Porto Alegre</p>
      <h1 class="hero__title">Um lugar onde cada criança é <span class="hl hl--azul">vista por inteiro</span></h1>
      <p class="hero__lede">Terapia ABA, diagnóstico e mais de onze especialidades, num ambiente acolhedor e seguro. Atendimento humanizado, feito sob medida para o desenvolvimento do seu filho.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="https://wa.me/555121128884">Agende uma visita</a>
        <a class="btn btn--ghost" href="/especialidades">Conheça as especialidades</a>
      </div>
      <ul class="hero__trust">
        <li><b>+11</b> especialidades</li>
        <li><b>2</b> unidades</li>
        <li>Terapia <b>ABA</b></li>
      </ul>
    </div>
    <figure class="hero__art">
      <img src="images/Turminha/turminha-acena.png" alt="A turminha HD360 acenando" />
    </figure>
  </div>
  <div class="wave wave--bottom" aria-hidden="true"><!-- svg wave to next section --></div>
</section>
```

Key rules: background is `var(--grad-ceu)` or `--creme`; blobs are big, blurred, low-opacity coded colors that **float** (ANIMATIONS.md § Blob); the character has a real `alt` (it's meaningful here); the section ends in a **wave divider**, never a straight edge. Title uses Barnacle Boy with exactly one colored word.

---

## 3. Button system

Two primary shapes, all pills, all with soft motion.

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  padding: 15px 28px; border-radius: var(--r-pill);
  font: 600 15px/1 var(--font-body); letter-spacing: .01em;
  cursor: pointer; border: 0; text-decoration: none;
  transition: transform .25s var(--ease-bounce), box-shadow .25s var(--ease-soft), background .2s;
}
.btn:active { transform: scale(.97); }

/* Primary — warm sunny gradient, the "agende" action */
.btn--primary {
  background: var(--grad-sol); color: #fff;
  box-shadow: 0 10px 26px rgba(251,60,99,.28);
}
.btn--primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 34px rgba(251,60,99,.38); }

/* Ghost — outlined, for secondary actions */
.btn--ghost {
  background: var(--branco); color: var(--tinta);
  box-shadow: inset 0 0 0 2px var(--azul-soft);
}
.btn--ghost:hover { box-shadow: inset 0 0 0 2px var(--azul); color: #0481b6; }

/* Solid color — coded to a section */
.btn--azul { background: var(--azul); color: #fff; box-shadow: 0 10px 24px rgba(0,165,234,.26); }
```

Buttons may carry a leading icon (rounded SVG) but never an emoji. Minimum height 48px (touch target).

---

## 4. Specialty card + specialty grid

The core content unit. A rounded white card with a **coded soft-tint icon tile**, title (Montserrat 700), short description, and a quiet "Saiba mais →". The whole card is the link. On hover it lifts with its coded colored shadow.

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
.spec__icon--azul { background: var(--azul-soft); color: #0481b6; }
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

## 5. World card (Unidades page)

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

## 6. Character block & mascot slot

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

## 7. Stat band

A soft cream band with 3–4 stats, Barnacle Boy numbers in rotating coded colors, count-up on reveal.

```html
<section class="stats">
  <div class="stat"><span class="stat__num hl--azul" data-count="11">+11</span><span class="stat__key">especialidades</span></div>
  <div class="stat"><span class="stat__num hl--rosa" data-count="2">2</span><span class="stat__key">unidades</span></div>
  <div class="stat"><span class="stat__num hl--verde" data-count="100">+100</span><span class="stat__key">famílias atendidas</span></div>
</section>
```

```css
.stats { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 24px; background: var(--creme); border-radius: var(--r-xl); padding: 48px; text-align: center; }
.stat__num { font: 400 clamp(40px,6vw,72px)/1 var(--font-display); }
.stat__key { font: 600 14px/1.3 var(--font-body); text-transform: uppercase; letter-spacing: .08em; color: var(--tinta-muted); }
```

Confirm real numbers with the client before publishing; "+100 famílias" is a placeholder.

---

## 8. Step / "como funciona" timeline

How a family starts (Contato → Avaliação → Plano → Acompanhamento). Rounded numbered nodes in rotating coded colors connected by a soft dashed/wavy line. Horizontal on desktop, vertical on mobile.

```html
<ol class="steps">
  <li class="step"><span class="step__num step__num--azul">1</span><h3>Primeiro contato</h3><p>Fale com a gente no WhatsApp e conte um pouco da sua história.</p></li>
  <li class="step"><span class="step__num step__num--lilas">2</span><h3>Avaliação</h3><p>Uma escuta cuidadosa para entender as necessidades da criança.</p></li>
  <li class="step"><span class="step__num step__num--verde">3</span><h3>Plano sob medida</h3><p>Montamos o plano terapêutico com a equipe multidisciplinar.</p></li>
  <li class="step"><span class="step__num step__num--rosa">4</span><h3>Acompanhamento</h3><p>Evolução contínua, sempre com a família por perto.</p></li>
</ol>
```

The connecting line is an SVG dashed path or a `::before` with a repeating gradient — soft, never a hard rule.

---

## 9. Testimonial card

Parents' words. A warm card with a soft quote mark (in a coded color), the quote in a comfortable reading size, and a simple attribution (first name + relationship: "Mãe do Theo, 5 anos"). Optional small avatar (initial in a coded circle — avoid stock faces for privacy).

```css
.quote { background: var(--branco); border-radius: var(--r-lg); padding: 32px; box-shadow: 0 12px 30px rgba(46,42,57,.06); }
.quote__mark { font: 400 56px/0.6 var(--font-display); color: var(--rosa); }
.quote__text { font: 500 18px/1.6 var(--font-body); color: var(--tinta); }
.quote__by { font: 600 14px/1 var(--font-body); color: var(--tinta-muted); }
```

Carousel behavior (if more than 3) in INTERACTIONS.md. Keep it calm — manual controls, no autoplay, or very slow autoplay that pauses on hover/focus and respects reduced-motion.

---

## 10. FAQ accordion

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

## 11. Appointment CTA band

The **one full-color band** the page is allowed. The brand gradient, white Barnacle Boy headline, a character peeking in, and the two CTAs (Agende / WhatsApp). Rounded as a giant card, not full-bleed-sharp.

```html
<section class="cta">
  <div class="cta__inner">
    <h2 class="cta__title">Vamos cuidar juntos do desenvolvimento do seu filho</h2>
    <p class="cta__text">Agende uma visita e conheça nossa casa, nossa equipe e nosso jeito de cuidar.</p>
    <div class="cta__actions">
      <a class="btn btn--white" href="https://wa.me/555121128884">Falar no WhatsApp</a>
      <a class="btn btn--ghost-on-color" href="/contato">Agende uma avaliação</a>
    </div>
  </div>
  <figure class="cta__art" aria-hidden="true"><img src="images/Pets/zig-feliz.png" alt="" /></figure>
</section>
```

```css
.cta { position: relative; overflow: hidden; border-radius: var(--r-xl); background: var(--grad-marca); color: #fff; padding: clamp(48px,7vw,88px); margin: 0 auto; max-width: 1180px; }
.cta__title { font: 400 clamp(30px,4.4vw,56px)/1.05 var(--font-display); color: #fff; }
.btn--white { background: #fff; color: var(--rosa); }
.btn--ghost-on-color { background: rgba(255,255,255,.14); color: #fff; box-shadow: inset 0 0 0 2px rgba(255,255,255,.5); }
```

Ensure white text on the gradient passes contrast at every stop (the amarelo stop is the risk — add a subtle dark overlay or position text over the azul/lilás side).

---

## 12. Footer

Light cream footer, rounded top corners, organized in friendly columns: brand + tagline + social, both units (address + map link), specialties list, quick links, hours. A small character waves goodbye. Real data from DESIGN.md § Content blocks.

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

## 13. WhatsApp float + contact

A persistent rounded WhatsApp button bottom-right (the clinic's primary contact channel). Verde, soft glow, gentle one-time bob on load (then still). Respects reduced-motion (no bob).

```css
.wpp { position: fixed; right: 18px; bottom: 18px; z-index: 90; width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; background: #25D366; color: #fff; box-shadow: 0 10px 26px rgba(37,211,102,.4); }
.wpp:hover { transform: scale(1.06); }
```

Always reachable; never covers footer links on mobile (lift it above the footer when it's in view, or shrink it).
