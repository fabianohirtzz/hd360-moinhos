# ANIMATIONS.md — Motion vocabulary

Read this before adding any motion. HD360's motion is **calm, soft, and accessible** — that is the brand, and for an audience of autistic children and their families it is also *care*. Joy comes from warmth and character, never from speed or saturation.

**The golden rule:** every animation in this file must degrade gracefully under `prefers-reduced-motion: reduce`. The reduced-motion contract (§ 0) is not optional — wire it in the same pass you write the animation.

## Index
0. The reduced-motion contract (read first)
1. Easing & duration tokens
2. Gentle reveal (the default)
3. Stagger-in
4. Floaty bob (characters & blobs)
5. Blob morph (backdrops)
6. Soft hover lift & button press
7. Count-up
8. Confetti / dot drift
9. Wave dividers
10. Calm toggle (brand gesture)
11. What NOT to do

---

## 0. The reduced-motion contract — read first

Put this near the top of your CSS. It collapses all transform-based motion to opacity-only or instant, and stops every loop. Then every animation you write only needs to be *additive* on top of a safe default.

```css
/* Default: elements that will reveal start hidden but ALWAYS end visible */
.reveal { opacity: 0; transform: translateY(14px); transition: opacity .7s var(--ease-gentle), transform .7s var(--ease-gentle); }
.reveal.is-in { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1; transform: none; }          /* show instantly, no slide */
  .blob, .float, .wpp, .dots span { animation: none !important; transform: none !important; }
}
```

Also support a **JS-level** flag so the optional "Reduzir animações" toggle (§10) and your scroll/JS animations can check it:

```js
const calm = () =>
  document.documentElement.classList.contains('calm') ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// In any JS animation: if (calm()) { applyEndStateInstantly(); return; }
```

**Never** autoplay anything that moves continuously and can't be stopped. **Never** flash, strobe, or animate more than ~3 large elements at once. When in doubt, slower and subtler.

---

## 1. Easing & duration tokens

(Defined in DESIGN.md § 6 — repeated here for convenience.)

```css
:root {
  --ease-gentle: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-soft:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.4, 0.5, 1);  /* mild friendly pop — keep the overshoot small */
}
```

Duration ladder: hover 150–350ms · panels/accordion 400–550ms · reveals 600–800ms · ambient loops 4–20s (slow). Never exceed 800ms for a state change.

---

## 2. Gentle reveal (the default)

Almost everything enters this way: a small rise + fade as it scrolls into view. IntersectionObserver, one-shot.

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.intersectionRatio > 0.15) {
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }
}, { threshold: [0, 0.15] });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

CSS is in §0. For grouped children, add `.reveal` to each and combine with stagger (§3). Under reduced-motion they simply appear — handled by §0.

---

## 3. Stagger-in

A grid of specialty cards or characters assembles warmly, one after another. Drive the delay with a CSS variable set per index.

```css
.reveal[style*="--i"] { transition-delay: calc(var(--i) * 70ms); }
```

```html
<article class="spec reveal" style="--i:0">…</article>
<article class="spec reveal" style="--i:1">…</article>
<article class="spec reveal" style="--i:2">…</article>
```

Keep the step at 60–90ms and cap total cascade under ~600ms (so a 10-card grid doesn't crawl). Under reduced-motion, delays are zeroed by §0.

---

## 4. Floaty bob (characters & blobs)

The signature ambient motion: characters and blobs drift up and down like calm breathing. Slow, small, infinite — but stoppable.

```css
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.float       { animation: bob var(--float, 6s) ease-in-out infinite; }
.float--slow { animation-duration: 8s; }
.float--lag  { animation-delay: -2s; }   /* desync multiple floats so they don't move in lockstep */
```

Amplitude max `±10px`, duration `4–8s`. Give each floating element a different `animation-delay` so a group feels organic, not synchronized. Pair with a tiny rotation only if very subtle (`rotate(-1.5deg)` ↔ `rotate(1.5deg)`). Disabled under reduced-motion (§0).

---

## 5. Blob morph (backdrops)

The big blurred color shapes behind heroes and sections slowly change their organic shape and drift. This is what makes backgrounds feel alive without any hard motion.

```css
.blob { position: absolute; filter: blur(40px); opacity: .5; border-radius: 42% 58% 63% 37% / 45% 38% 62% 55%; will-change: border-radius, transform; }
.blob--azul    { width: 360px; height: 360px; background: var(--azul);    animation: morph 16s ease-in-out infinite; }
.blob--amarelo { width: 300px; height: 300px; background: var(--amarelo); animation: morph 20s ease-in-out infinite reverse; }
@keyframes morph {
  0%,100% { border-radius: 42% 58% 63% 37% / 45% 38% 62% 55%; transform: translate(0,0) rotate(0); }
  50%     { border-radius: 58% 42% 38% 62% / 55% 62% 38% 45%; transform: translate(12px,-14px) rotate(6deg); }
}
```

Keep blobs **low opacity (0.35–0.55)** and **heavily blurred** so text on top stays legible. Two or three per hero is plenty. Disabled under reduced-motion.

---

## 6. Soft hover lift & button press

```css
/* Card lift (also in COMPONENTS) */
.spec { transition: transform .25s var(--ease-gentle), box-shadow .25s var(--ease-soft); }
.spec:hover { transform: translateY(-6px); }

/* Button: mild bounce in, scale down on press */
.btn { transition: transform .25s var(--ease-bounce), box-shadow .25s var(--ease-soft); }
.btn:hover { transform: translateY(-2px) scale(1.02); }
.btn:active { transform: scale(.97); }
```

The `--ease-bounce` overshoot must stay small (1.4, not 1.7) — playful, not cartoonish. Touch devices: ensure `:active` feedback since there's no hover.

---

## 7. Count-up

Stat numbers tick up once when the stat band reveals. One pass, no loop.

```js
function countUp(el) {
  if (calm()) { el.textContent = el.dataset.count; return; }   // respect calm
  const target = parseInt(el.dataset.count, 10);
  const dur = 1200; const t0 = performance.now();
  const prefix = el.textContent.trim().startsWith('+') ? '+' : '';
  const step = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

Trigger from the same IntersectionObserver. Never re-run on re-scroll.

---

## 8. Confetti / dot drift

Decorative colored dots and puzzle bits scattered as texture. Static is fine; if they move, it's an extremely slow, tiny drift. Always `aria-hidden`, never load-bearing.

```css
.dots span {
  position: absolute; width: 10px; height: 10px; border-radius: 50%; opacity: .7;
  animation: drift 9s ease-in-out infinite;
}
@keyframes drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
```

Generate 6–12 dots in rotating coded colors via JS or hand-place. Keep them sparse — they frame, they don't fill. A few **puzzle-piece** SVGs among them tie back to the logo. Disabled under reduced-motion.

---

## 9. Wave dividers

Sections transition through soft SVG waves instead of straight edges — the brand's "flowing" feel (echoing the room murals). Mostly static shapes; an optional *very* slow horizontal drift on a duplicated wave adds life.

```html
<div class="wave wave--bottom" aria-hidden="true">
  <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
    <path d="M0,40 C360,120 1080,-20 1440,60 L1440,120 L0,120 Z" fill="var(--creme)"/>
  </svg>
</div>
```

The wave's `fill` is the color of the *next* section, so it reads as that section rising up. For the optional drift, duplicate the path wider than the viewport and translate it `0 → -50%` over `~18s linear infinite` (disabled under reduced-motion). Keep amplitude gentle.

---

## 10. Calm toggle (brand gesture)

A footer button that lets families turn off ambient motion beyond the OS setting — a genuine act of care that fits this brand perfectly.

```js
const root = document.documentElement;
const KEY = 'hd360-calm';
if (localStorage.getItem(KEY) === '1') root.classList.add('calm');
document.querySelector('[data-calm-toggle]')?.addEventListener('click', () => {
  const on = root.classList.toggle('calm');
  localStorage.setItem(KEY, on ? '1' : '0');
});
```

Mirror the reduced-motion CSS for the `.calm` class:

```css
.calm .blob, .calm .float, .calm .dots span, .calm .wave svg { animation: none !important; transform: none !important; }
.calm .reveal { opacity: 1 !important; transform: none !important; }
```

Persist the choice (localStorage). Label it plainly: "Reduzir animações".

---

## 11. What NOT to do

| Don't | Why | Instead |
|---|---|---|
| Autoplay carousels / sliders that can't pause | Overstimulating; removes control | Manual controls, or pause-on-hover + reduced-motion aware |
| Parallax scrolling on big elements | Disorienting, motion-sickness risk | Gentle reveals + slow blob morph |
| Bounce/spring everything with big overshoot | Reads as a noisy kids' game, erodes trust | Small `--ease-bounce` on buttons only |
| Flashing, strobing, fast color cycling | Sensory harm, accessibility violation | Static color, slow morph |
| Animating 5+ large things at once | Visual overload | Max ~3; stagger the rest |
| Long (>800ms) state-change transitions | Feels broken / sluggish | Keep state changes ≤ 550ms |
| Hover effects with no touch equivalent | Mobile/child users get nothing | Provide `:active` and on-reveal states |
| Forgetting the reduced-motion fallback | Excludes & can harm the core audience | Wire §0 every time |

When unsure, choose the calmer option. A still, warm, legible page is *always* on-brand; a busy one never is.
