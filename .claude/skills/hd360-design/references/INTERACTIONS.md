# INTERACTIONS.md — Behavior & wiring

Read this before wiring any behavior. HD360 interactions are **predictable, forgiving, keyboard-friendly, and calm**. Predictability is care for this audience — no surprise pop-ups, no disappearing controls, clear focus, plain feedback. Every pattern here respects the reduced-motion / `.calm` flag from ANIMATIONS.md § 0.

## Index
1. Shared helpers (calm flag, focus trap)
2. Mobile drawer (nav)
3. FAQ accordion
4. Specialty filter / tabs
5. Character carousel ("A Turma")
6. Unit switcher (Unidades)
7. Appointment form
8. Smooth-scroll + active nav

---

## 1. Shared helpers

```js
const calm = () =>
  document.documentElement.classList.contains('calm') ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Minimal focus trap for the mobile drawer / any modal
function trapFocus(container) {
  const f = container.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if (!f.length) return () => {};
  const first = f[0], last = f[f.length - 1];
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}
```

Every interactive control: real `<button>`/`<a>` (not a `div` with a click), visible focus ring, `aria-*` state, and an Escape path where a layer opens.

---

## 2. Mobile drawer (nav)

The burger opens a full-height rounded panel sliding from the right (or top-sheet). Locks body scroll, traps focus, closes on Escape / backdrop / link click. Slide is replaced by instant show under calm.

```js
const burger = document.querySelector('[data-burger]');
const drawer = document.querySelector('[data-drawer]');
const backdrop = document.querySelector('[data-drawer-backdrop]');
let releaseTrap = () => {};

function openDrawer() {
  drawer.classList.add('is-open'); backdrop.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  releaseTrap = trapFocus(drawer);
  drawer.querySelector('a,button')?.focus();
}
function closeDrawer() {
  drawer.classList.remove('is-open'); backdrop.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  releaseTrap(); burger.focus();
}
burger.addEventListener('click', () => burger.getAttribute('aria-expanded') === 'true' ? closeDrawer() : openDrawer());
backdrop.addEventListener('click', closeDrawer);
drawer.addEventListener('click', (e) => { if (e.target.closest('a')) closeDrawer(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });
```

Drawer panel: white, `border-radius: var(--r-xl)` on the inner edge, big tappable links (≥48px), the WhatsApp CTA pinned at the bottom. A waving character at the top is a nice touch.

---

## 3. FAQ accordion

Prefer native `<details>`/`<summary>` for built-in accessibility, enhanced with JS for smooth height and optional single-open. The smooth-height enhancement is skipped under calm (native instant toggle remains).

```js
const acc = document.querySelector('[data-accordion]');
acc?.querySelectorAll('details').forEach((d) => {
  const summary = d.querySelector('summary');
  const panel = d.querySelector('.faq__a');
  summary.addEventListener('click', (e) => {
    // single-open: close siblings
    if (!d.open) acc.querySelectorAll('details[open]').forEach(o => { if (o !== d) o.open = false; });
    if (calm()) return;                          // let native toggle handle it instantly
    // smooth height
    e.preventDefault();
    if (d.open) { collapse(d, panel); }
    else { d.open = true; expand(panel); }
  });
});
function expand(panel) {
  panel.style.height = '0px'; panel.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    panel.style.transition = 'height .4s var(--ease-gentle)';
    panel.style.height = panel.scrollHeight + 'px';
    panel.addEventListener('transitionend', function te() { panel.style.height = 'auto'; panel.style.transition = ''; panel.removeEventListener('transitionend', te); });
  });
}
function collapse(d, panel) {
  panel.style.height = panel.scrollHeight + 'px'; panel.style.overflow = 'hidden';
  requestAnimationFrame(() => { panel.style.transition = 'height .35s var(--ease-gentle)'; panel.style.height = '0px'; });
  panel.addEventListener('transitionend', function te() { d.open = false; panel.style.height = ''; panel.style.transition = ''; panel.removeEventListener('transitionend', te); });
}
```

Single-open is optional — for a long FAQ, letting multiple stay open is also fine. Chevron rotation handled in CSS (COMPONENTS § FAQ).

---

## 4. Specialty filter / tabs

Filter the specialties grid by area: **Todas · Comunicação · Comportamento · Corpo & Sentidos · Diagnóstico**. Tab pills (coded), `role="tablist"`. Cards fade/scale out and the matching set staggers back in (instant under calm). Always keep "Todas" as the default and never leave the grid empty.

```html
<div class="filter" role="tablist" aria-label="Filtrar especialidades">
  <button role="tab" aria-selected="true"  data-filter="all" class="chip chip--active">Todas</button>
  <button role="tab" aria-selected="false" data-filter="comunicacao" class="chip">Comunicação</button>
  <button role="tab" aria-selected="false" data-filter="comportamento" class="chip">Comportamento</button>
  <button role="tab" aria-selected="false" data-filter="corpo" class="chip">Corpo & Sentidos</button>
  <button role="tab" aria-selected="false" data-filter="diagnostico" class="chip">Diagnóstico</button>
</div>
```

```js
const chips = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('.spec[data-area]');
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => { c.classList.remove('chip--active'); c.setAttribute('aria-selected', 'false'); });
  chip.classList.add('chip--active'); chip.setAttribute('aria-selected', 'true');
  const f = chip.dataset.filter;
  let i = 0;
  cards.forEach(card => {
    const show = f === 'all' || card.dataset.area.split(' ').includes(f);
    card.hidden = !show;
    if (show && !calm()) { card.style.setProperty('--i', i++); card.classList.remove('is-in'); requestAnimationFrame(() => card.classList.add('is-in')); }
  });
}));
```

Map each specialty to one or more areas via `data-area` (e.g. Fonoaudiologia → `comunicacao`, Terapia ABA → `comportamento`, Terapia Ocupacional → `corpo`, Avaliação Neuro → `diagnostico`). Support arrow-key navigation between tabs.

---

## 5. Character carousel ("A Turma")

Introduce Li, Lo, Turminha, Zig & Dom. A gentle, **manually-controlled** carousel — prev/next buttons + dots, swipe on touch, NO autoplay (or very slow + pausable). Each slide is a character block (COMPONENTS § 6). Snap-scroll is the simplest accessible base.

```css
.turma__track { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; padding-bottom: 8px; }
.turma__slide { flex: 0 0 clamp(240px, 70vw, 320px); scroll-snap-align: center; }
@media (prefers-reduced-motion: reduce) { .turma__track { scroll-behavior: auto; } }
```

```js
const track = document.querySelector('.turma__track');
document.querySelector('[data-turma-next]')?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: calm() ? 'auto' : 'smooth' }));
document.querySelector('[data-turma-prev]')?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: calm() ? 'auto' : 'smooth' }));
```

Buttons are real `<button>`s with `aria-label`. Keep characters large and friendly; let them float (ANIMATIONS § 4) while resting.

---

## 6. Unit switcher (Unidades)

Toggle between the two real units (Quintino Bocaiúva / Casa ABA) to show address, map, hours, photos. Tab pills swapping panels — same `role="tab"` pattern as §4, one panel visible at a time, crossfade (instant under calm).

```html
<div class="units" data-units>
  <div class="filter" role="tablist" aria-label="Escolher unidade">
    <button role="tab" aria-selected="true"  data-unit="quintino" class="chip chip--active">Quintino Bocaiúva</button>
    <button role="tab" aria-selected="false" data-unit="aba" class="chip">Casa ABA</button>
  </div>
  <div class="units__panel" data-unit-panel="quintino">…endereço, mapa, horário…</div>
  <div class="units__panel" data-unit-panel="aba" hidden>…endereço, mapa, horário…</div>
</div>
```

Each unit panel pairs the real address (DESIGN § Content blocks) with an embedded map link and the relevant themed-world art for that space. Never both panels visible at once; `hidden` toggles + `aria-selected` track state.

---

## 7. Appointment form

The "Agende uma avaliação" form. Warm, short, forgiving. Fields: nome do responsável, telefone/WhatsApp, nome e idade da criança, unidade de preferência, e uma mensagem opcional. Inline validation that's kind, not punishing.

Principles:
- Labels always visible (never placeholder-only). Large rounded inputs (`--r-sm`), ≥48px tall.
- Validate on blur and on submit, not on every keystroke. Error messages are plain and reassuring: "Pode conferir o telefone? Parece faltar um número." not "Invalid input".
- Required fields marked with a clear "*" + `aria-required`. Errors use `aria-describedby` + `aria-invalid`, and a coded **rosa** (not alarming red-on-black) outline.
- Success state: a warm confirmation with a waving character — "Recebemos! Em breve a gente te chama no WhatsApp." Offer the direct WhatsApp link as a fast alternative.
- WhatsApp is the primary path — show the "Falar agora no WhatsApp" button above or beside the form for parents who prefer it.

```js
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const errors = validate(form);          // returns [{field, msg}]
  clearErrors(form);
  if (errors.length) { showErrors(errors); errors[0].field.focus(); return; }
  // POST to endpoint OR build a prefilled WhatsApp message and redirect
  // window.location = `https://wa.me/555121128884?text=${encodeURIComponent(buildMsg(form))}`;
  showSuccess(form);
});
```

A pragmatic option (no backend): submit composes a prefilled WhatsApp message via `wa.me` deep link. Confirm the preferred submission channel with the client.

---

## 8. Smooth-scroll + active nav

Anchor links scroll smoothly (instant under calm); the nav highlights the section in view.

```js
// Smooth in-page scroll
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
  const t = document.querySelector(a.getAttribute('href')); if (!t) return;
  e.preventDefault();
  t.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
  history.pushState(null, '', a.getAttribute('href'));
}));

// Active link via IntersectionObserver on sections
const navIO = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      document.querySelectorAll('.nav__link').forEach(l => l.removeAttribute('aria-current'));
      document.querySelector(`.nav__link[href="#${en.target.id}"]`)?.setAttribute('aria-current', 'page');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => navIO.observe(s));
```

Keep the offset aware of the fixed floating nav so anchored sections aren't hidden beneath it (`scroll-margin-top` on targets).
