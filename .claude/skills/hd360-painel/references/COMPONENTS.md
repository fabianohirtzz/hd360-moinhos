# COMPONENTS.md — HD360 Painel component anatomy

Ready-to-extend HTML/CSS for every panel surface. All BEM-style, vanilla, using the `:root` tokens from SKILL.md. **Read SKILL.md first** for the tokens and the keep-vs-scale-down rules. Everything here assumes those tokens exist.

Register reminder: this is a **tool**. Calm, dense, legible. Color enters only for status / primary / destructive / active / focus. Everything else is `--surface` white on `--app-bg` cream, slate ink, `--linha` hairlines.

## Table of contents
1. App shell (sidebar + topbar)
2. Buttons
3. Status badge
4. Data table (posts list)
5. Form fields (input, textarea, select, helper, error)
6. Tag chips
7. WYSIWYG editor chrome
8. Cover / image upload
9. SEO panel + Google preview
10. Modal (confirm / destructive)
11. Toast (save / publish feedback)
12. Empty, loading, error states
13. Login screen
14. The "Atualizar site" publish control

---

## 1. App shell

A constant frame: fixed left sidebar, slim topbar, scrolling work area. Never moves between screens — predictability is a brand value.

```html
<div class="app">
  <aside class="sidebar">
    <a class="sidebar__brand" href="/painel/">
      <img class="sidebar__mark" src="../images/logo-3.png" alt="HD360" />
      <span class="sidebar__word">Painel</span>
    </a>
    <nav class="sidebar__nav">
      <a class="navitem navitem--active" href="/painel/"><span class="navitem__ico" aria-hidden="true"><!--svg--></span>Posts</a>
    </nav>
    <button class="navitem navitem--foot" type="button" data-logout><span class="navitem__ico" aria-hidden="true"><!--svg--></span>Sair</button>
  </aside>

  <div class="main">
    <header class="topbar">
      <h1 class="topbar__title">Posts</h1>
      <div class="topbar__actions"><!-- publish control (§14) --></div>
    </header>
    <main class="work"><!-- screen content --></main>
  </div>
</div>
```

```css
.app{ display:grid; grid-template-columns:248px 1fr; min-height:100vh; background:var(--app-bg); color:var(--tinta); font-family:var(--font-body); }
.sidebar{ position:sticky; top:0; align-self:start; height:100vh; display:flex; flex-direction:column; gap:6px; padding:20px 14px; background:var(--sidebar); border-right:1px solid var(--linha); }
.sidebar__brand{ display:flex; align-items:center; gap:10px; padding:6px 8px 16px; text-decoration:none; color:var(--tinta); }
.sidebar__mark{ width:34px; height:34px; object-fit:contain; }
.sidebar__word{ font-family:var(--font-display); font-size:24px; line-height:1; color:var(--lilas-ink); } /* Barnacle Boy allowed here */
.sidebar__nav{ display:flex; flex-direction:column; gap:4px; }
.navitem{ display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:var(--r-sm); font-size:14px; font-weight:600; color:var(--tinta-muted); text-decoration:none; background:none; border:0; cursor:pointer; text-align:left; transition:background .15s var(--ease-soft), color .15s var(--ease-soft); }
.navitem:hover{ background:var(--creme); color:var(--tinta); }
.navitem--active{ background:var(--lilas-soft); color:var(--lilas-ink); }
.navitem--foot{ margin-top:auto; }
.navitem__ico{ width:18px; height:18px; display:inline-grid; place-items:center; }
.navitem__ico svg{ width:18px; height:18px; stroke:currentColor; stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }

.main{ display:flex; flex-direction:column; min-width:0; }
.topbar{ position:sticky; top:0; z-index:5; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 28px; background:rgba(251,248,243,.85); backdrop-filter:blur(8px); border-bottom:1px solid var(--linha); }
.topbar__title{ margin:0; font-size:22px; font-weight:700; letter-spacing:-.01em; } /* Montserrat, NOT Barnacle Boy */
.topbar__actions{ display:flex; align-items:center; gap:12px; }
.work{ padding:28px; max-width:1120px; width:100%; }

/* Tablet: collapse sidebar to icon rail */
@media (max-width:880px){
  .app{ grid-template-columns:64px 1fr; }
  .sidebar__word, .navitem span:not(.navitem__ico){ display:none; }
  .navitem{ justify-content:center; }
  .work{ padding:20px; }
}
@media (prefers-reduced-motion:reduce){ *{ transition:none !important; } }
```

---

## 2. Buttons

Three weights. Pill-rounded, Montserrat 600, comfortable hit area. Primary = lilás, destructive = rosa, the rest are quiet.

```html
<button class="btn btn--primary">Publicar</button>
<button class="btn btn--ghost">Salvar rascunho</button>
<button class="btn btn--quiet">Ver prévia</button>
<button class="btn btn--danger">Excluir</button>
```

```css
.btn{ --c-bg:var(--surface); --c-fg:var(--tinta); --c-bd:var(--linha-forte);
  display:inline-flex; align-items:center; gap:8px; min-height:40px; padding:0 18px;
  border-radius:var(--r-pill); border:1px solid var(--c-bd); background:var(--c-bg); color:var(--c-fg);
  font-family:var(--font-body); font-size:14px; font-weight:600; letter-spacing:.005em; cursor:pointer;
  transition:transform .12s var(--ease-soft), box-shadow .18s var(--ease-soft), background .15s var(--ease-soft); }
.btn:hover{ transform:translateY(-1px); }
.btn:active{ transform:translateY(0); }
.btn:focus-visible{ outline:3px solid var(--lilas); outline-offset:2px; }
.btn--primary{ --c-bg:var(--lilas); --c-fg:#fff; --c-bd:transparent; box-shadow:0 8px 20px rgba(143,100,200,.28); }
.btn--primary:hover{ box-shadow:0 12px 26px rgba(143,100,200,.36); }
.btn--ghost{ --c-bg:var(--lilas-soft); --c-fg:var(--lilas-ink); --c-bd:transparent; }
.btn--quiet{ --c-bg:transparent; --c-fg:var(--tinta-muted); --c-bd:var(--linha-forte); }
.btn--danger{ --c-bg:var(--surface); --c-fg:var(--rosa-ink); --c-bd:rgba(251,60,99,.35); }
.btn--danger:hover{ --c-bg:var(--rosa-soft); }
.btn[disabled]{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
```

---

## 3. Status badge

Color + label + dot, so it reads without color vision. Follows the eyebrow pattern: soft tint bg, `-ink` text, full-strength dot. **Respects the amarelo rule** (rascunho uses `--tinta` text, not amarelo text).

```html
<span class="badge badge--pub"><span class="badge__dot"></span>Publicado</span>
<span class="badge badge--draft"><span class="badge__dot"></span>Rascunho</span>
```

```css
.badge{ display:inline-flex; align-items:center; gap:7px; padding:4px 11px 4px 9px; border-radius:var(--r-pill); font-size:12px; font-weight:600; letter-spacing:.01em; }
.badge__dot{ width:8px; height:8px; border-radius:50%; }
.badge--pub{ background:var(--verde-soft); color:var(--verde-ink); }
.badge--pub .badge__dot{ background:var(--verde); }
.badge--draft{ background:var(--amarelo-soft); color:var(--tinta); } /* amarelo never as text */
.badge--draft .badge__dot{ background:var(--amarelo); }
```

---

## 4. Data table (posts list)

This is where hairlines (`--linha`) are correct — the marketing "no grey lines" rule is reversed for dense tables. Warm, scannable, generous row height, hover tint.

```html
<div class="panel">
  <div class="panel__head">
    <div class="seg" role="tablist" aria-label="Filtrar por status">
      <button class="seg__btn seg__btn--on" role="tab">Todos</button>
      <button class="seg__btn" role="tab">Publicados</button>
      <button class="seg__btn" role="tab">Rascunhos</button>
    </div>
    <a class="btn btn--primary" href="/painel/editor/">Novo post</a>
  </div>
  <table class="table">
    <thead><tr>
      <th>Título</th><th>Categoria</th><th>Status</th><th>Data</th><th class="table__num">Curtidas</th><th></th>
    </tr></thead>
    <tbody>
      <tr>
        <td class="table__title">Como a Terapia ABA apoia o desenvolvimento</td>
        <td><span class="cat"><span class="cat__dot" style="background:var(--amarelo)"></span>Terapia ABA</span></td>
        <td><span class="badge badge--pub"><span class="badge__dot"></span>Publicado</span></td>
        <td class="table__meta">02 jun 2026</td>
        <td class="table__num">128</td>
        <td class="table__actions">
          <button class="iconbtn" aria-label="Editar"><!--svg--></button>
          <button class="iconbtn iconbtn--danger" aria-label="Excluir"><!--svg--></button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.panel{ background:var(--surface); border:1px solid var(--linha); border-radius:var(--r-lg); box-shadow:0 6px 18px rgba(46,42,57,.04); overflow:hidden; }
.panel__head{ display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 18px; border-bottom:1px solid var(--linha); }
.seg{ display:inline-flex; gap:4px; padding:4px; background:var(--creme); border-radius:var(--r-pill); }
.seg__btn{ border:0; background:none; padding:6px 14px; border-radius:var(--r-pill); font:600 13px var(--font-body); color:var(--tinta-muted); cursor:pointer; }
.seg__btn--on{ background:var(--surface); color:var(--lilas-ink); box-shadow:0 2px 6px rgba(46,42,57,.06); }

.table{ width:100%; border-collapse:collapse; font-size:14px; }
.table th{ text-align:left; padding:12px 16px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; color:var(--tinta-muted); border-bottom:1px solid var(--linha); }
.table td{ padding:14px 16px; border-bottom:1px solid var(--linha); vertical-align:middle; }
.table tbody tr:last-child td{ border-bottom:0; }
.table tbody tr{ transition:background .12s var(--ease-soft); }
.table tbody tr:hover{ background:var(--creme); }
.table__title{ font-weight:600; color:var(--tinta); }
.table__meta{ color:var(--tinta-muted); }
.table__num{ text-align:right; font-variant-numeric:tabular-nums; color:var(--tinta-muted); }
.table__actions{ display:flex; gap:6px; justify-content:flex-end; }
.cat{ display:inline-flex; align-items:center; gap:7px; color:var(--tinta-muted); }
.cat__dot{ width:9px; height:9px; border-radius:50%; }
.iconbtn{ display:grid; place-items:center; width:34px; height:34px; border-radius:var(--r-sm); border:1px solid var(--linha); background:var(--surface); color:var(--tinta-muted); cursor:pointer; transition:background .15s, color .15s; }
.iconbtn svg{ width:17px; height:17px; stroke:currentColor; stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.iconbtn:hover{ background:var(--creme); color:var(--tinta); }
.iconbtn--danger:hover{ background:var(--rosa-soft); color:var(--rosa-ink); }
```

---

## 5. Form fields

The editor is mostly forms, so this has to be excellent: clear labels, calm focus, helpful microcopy, gentle errors.

```html
<div class="field">
  <label class="field__label" for="title">Título</label>
  <input class="input" id="title" type="text" placeholder="Título do post" />
  <p class="field__help">Aparece como H1 e no topo da página do post.</p>
</div>

<div class="field field--err">
  <label class="field__label" for="meta">Meta description</label>
  <textarea class="input" id="meta" rows="3" aria-describedby="meta-h"></textarea>
  <p class="field__help" id="meta-h"><span class="counter">142</span>/160 caracteres</p>
  <p class="field__err">Passou do limite recomendado para o Google.</p>
</div>
```

```css
.field{ display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
.field__label{ font-size:13px; font-weight:600; color:var(--tinta); }
.input{ width:100%; padding:11px 14px; font:500 15px var(--font-body); color:var(--tinta); background:var(--surface); border:1px solid var(--linha-forte); border-radius:var(--r-sm); transition:border-color .15s var(--ease-soft), box-shadow .15s var(--ease-soft); }
.input::placeholder{ color:var(--tinta-soft); }
.input:hover{ border-color:rgba(46,42,57,.22); }
.input:focus{ outline:none; border-color:var(--lilas); box-shadow:0 0 0 3px var(--lilas-soft); }
.field__help{ margin:0; font-size:13px; font-weight:500; color:var(--tinta-muted); }
.counter{ font-variant-numeric:tabular-nums; }
.field__err{ display:none; margin:0; font-size:13px; font-weight:600; color:var(--rosa-ink); }
.field--err .input{ border-color:var(--rosa); box-shadow:0 0 0 3px var(--rosa-soft); }
.field--err .field__err{ display:block; }

/* Select with a coded color dot (categoria) */
.select-cat{ position:relative; }
.select-cat select{ appearance:none; padding-left:34px; } /* dot rendered via ::before on wrapper */
```

---

## 6. Tag chips

Curated tags: existing chips are removable, an input adds new ones. Neutral by default (tags aren't a coded color), lilás on focus.

```html
<div class="chips">
  <span class="chip">autismo<button class="chip__x" aria-label="Remover autismo">×</button></span>
  <span class="chip">terapia<button class="chip__x" aria-label="Remover terapia">×</button></span>
  <input class="chips__input" placeholder="Adicionar tag…" />
</div>
```

```css
.chips{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:8px; border:1px solid var(--linha-forte); border-radius:var(--r-sm); background:var(--surface); }
.chips:focus-within{ border-color:var(--lilas); box-shadow:0 0 0 3px var(--lilas-soft); }
.chip{ display:inline-flex; align-items:center; gap:6px; padding:5px 6px 5px 12px; background:var(--creme); border-radius:var(--r-pill); font-size:13px; font-weight:600; color:var(--tinta); }
.chip__x{ display:grid; place-items:center; width:18px; height:18px; border:0; border-radius:50%; background:rgba(46,42,57,.08); color:var(--tinta-muted); font-size:14px; line-height:1; cursor:pointer; }
.chip__x:hover{ background:var(--rosa-soft); color:var(--rosa-ink); }
.chips__input{ flex:1; min-width:120px; border:0; outline:none; background:none; font:500 14px var(--font-body); color:var(--tinta); }
```

---

## 7. WYSIWYG editor chrome

The editor lib (e.g. a lightweight CDN editor) provides the contenteditable; you style the **toolbar** and the **content area** to match the public post typography so what they write looks like what ships. Toolbar buttons are quiet icon toggles; active state is lilás-soft.

```html
<div class="editor">
  <div class="editor__toolbar" role="toolbar" aria-label="Formatação">
    <button class="tbtn" data-cmd="bold" aria-label="Negrito"><!--svg--></button>
    <button class="tbtn" data-cmd="italic" aria-label="Itálico"><!--svg--></button>
    <span class="tbar-sep"></span>
    <button class="tbtn" data-cmd="h2" aria-label="Título">H2</button>
    <button class="tbtn" data-cmd="h3" aria-label="Subtítulo">H3</button>
    <span class="tbar-sep"></span>
    <button class="tbtn" data-cmd="ul" aria-label="Lista"><!--svg--></button>
    <button class="tbtn" data-cmd="quote" aria-label="Citação"><!--svg--></button>
    <button class="tbtn" data-cmd="link" aria-label="Link"><!--svg--></button>
    <button class="tbtn" data-cmd="image" aria-label="Inserir imagem"><!--svg--></button>
  </div>
  <div class="editor__body" contenteditable="true"><!-- post HTML --></div>
</div>
```

```css
.editor{ border:1px solid var(--linha-forte); border-radius:var(--r-md); overflow:hidden; background:var(--surface); }
.editor__toolbar{ display:flex; align-items:center; gap:2px; flex-wrap:wrap; padding:8px 10px; background:var(--creme); border-bottom:1px solid var(--linha); position:sticky; top:0; z-index:2; }
.tbtn{ display:grid; place-items:center; min-width:32px; height:32px; padding:0 8px; border:0; border-radius:var(--r-sm); background:none; color:var(--tinta-muted); font:600 13px var(--font-body); cursor:pointer; transition:background .12s, color .12s; }
.tbtn svg{ width:17px; height:17px; stroke:currentColor; stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.tbtn:hover{ background:var(--surface); color:var(--tinta); }
.tbtn[aria-pressed="true"], .tbtn--on{ background:var(--lilas-soft); color:var(--lilas-ink); }
.tbar-sep{ width:1px; height:20px; background:var(--linha-forte); margin:0 6px; }
.editor__body{ min-height:360px; padding:22px 26px; font:400 16px/1.7 var(--font-body); color:var(--tinta); }
.editor__body:focus{ outline:none; }
/* Mirror public post typography so drafts preview true */
.editor__body h2{ font-family:var(--font-display); font-weight:400; font-size:28px; line-height:1.1; margin:1.4em 0 .5em; }
.editor__body h3{ font-weight:700; font-size:20px; margin:1.2em 0 .4em; }
.editor__body a{ color:var(--azul-ink); text-decoration:underline; text-underline-offset:2px; }
.editor__body blockquote{ margin:1.2em 0; padding:8px 18px; border-left:3px solid var(--lilas); background:var(--lilas-soft); border-radius:0 var(--r-sm) var(--r-sm) 0; color:var(--tinta); }
.editor__body img{ max-width:100%; border-radius:var(--r-md); }
```

---

## 8. Cover / image upload

Drag-or-click dropzone; once uploaded, show the image with a replace/remove control. Uploads go to the Supabase `blog-images` bucket (absolute URLs).

```html
<div class="field">
  <span class="field__label">Imagem de capa</span>
  <label class="dropzone" data-empty>
    <input type="file" accept="image/*" hidden />
    <span class="dropzone__ico" aria-hidden="true"><!--svg--></span>
    <span class="dropzone__t">Arraste uma imagem ou clique para enviar</span>
    <span class="dropzone__hint">JPG ou PNG, proporção 16:9 recomendada</span>
  </label>
  <!-- filled state -->
  <figure class="cover" hidden>
    <img class="cover__img" alt="Pré-visualização da capa" />
    <div class="cover__bar"><button class="btn btn--quiet">Trocar</button><button class="btn btn--danger">Remover</button></div>
  </figure>
</div>
```

```css
.dropzone{ display:flex; flex-direction:column; align-items:center; gap:6px; padding:32px 20px; text-align:center; border:1.5px dashed var(--linha-forte); border-radius:var(--r-md); background:var(--creme); color:var(--tinta-muted); cursor:pointer; transition:border-color .15s, background .15s; }
.dropzone:hover, .dropzone--drag{ border-color:var(--lilas); background:var(--lilas-soft); color:var(--lilas-ink); }
.dropzone__ico svg{ width:28px; height:28px; stroke:currentColor; stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.dropzone__t{ font-weight:600; font-size:14px; }
.dropzone__hint{ font-size:12px; }
.cover{ margin:0; border-radius:var(--r-md); overflow:hidden; border:1px solid var(--linha); }
.cover__img{ display:block; width:100%; aspect-ratio:16/9; object-fit:cover; }
.cover__bar{ display:flex; gap:8px; padding:10px; background:var(--surface); }
```

---

## 9. SEO panel + Google preview

A grouped panel; the live Google preview makes SEO tangible for a non-technical admin. Use real `--azul-ink` for the title line, slate for URL, muted for description (mimicking Google).

```html
<section class="panel panel--pad">
  <p class="eyebrow">SEO</p>
  <!-- seo_title, meta_description (with counter), focus_keyword, og_image fields … -->
  <div class="serp">
    <span class="serp__url">hd360.com.br › blog › terapia-aba</span>
    <span class="serp__title">Como a Terapia ABA apoia o desenvolvimento | HD360</span>
    <span class="serp__desc">A Terapia ABA é uma das abordagens mais estudadas para o autismo. Veja como funciona…</span>
  </div>
</section>
```

```css
.panel--pad{ padding:22px; }
.eyebrow{ display:inline-block; margin:0 0 14px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--tinta-muted); }
.serp{ display:flex; flex-direction:column; gap:3px; padding:14px 16px; background:var(--creme); border:1px solid var(--linha); border-radius:var(--r-md); max-width:600px; }
.serp__url{ font-size:13px; color:var(--tinta-muted); }
.serp__title{ font-size:18px; color:var(--azul-ink); font-weight:500; }
.serp__desc{ font-size:13px; line-height:1.5; color:var(--tinta-muted); }
```

---

## 10. Modal (confirm / destructive)

Centered, focus-trapped, Esc closes, scale-in. Destructive variant leads with rosa but stays calm (no all-red wall).

```html
<div class="overlay" data-modal>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-t">
    <h2 class="modal__title" id="m-t">Excluir post?</h2>
    <p class="modal__body">Excluir “Como a Terapia ABA apoia o desenvolvimento”? Essa ação não pode ser desfeita.</p>
    <div class="modal__actions">
      <button class="btn btn--quiet" data-close>Cancelar</button>
      <button class="btn btn--danger">Excluir post</button>
    </div>
  </div>
</div>
```

```css
.overlay{ position:fixed; inset:0; display:grid; place-items:center; padding:20px; background:rgba(46,42,57,.32); backdrop-filter:blur(2px); z-index:50; }
.modal{ width:min(440px,100%); background:var(--surface); border-radius:var(--r-lg); padding:26px; box-shadow:0 24px 60px rgba(46,42,57,.22); animation:modal-in .2s var(--ease-gentle); }
.modal__title{ margin:0 0 8px; font-size:19px; font-weight:700; color:var(--tinta); } /* Montserrat */
.modal__body{ margin:0 0 22px; font-size:14px; line-height:1.6; color:var(--tinta-muted); }
.modal__actions{ display:flex; justify-content:flex-end; gap:10px; }
@keyframes modal-in{ from{ opacity:0; transform:translateY(8px) scale(.98); } to{ opacity:1; transform:none; } }
@media (prefers-reduced-motion:reduce){ .modal{ animation:none; } }
```

---

## 11. Toast (save / publish feedback)

Bottom-right, `aria-live="polite"`, auto-dismiss. Verde = success, rosa = error, azul = info. Slides up; reduced-motion fades.

```html
<div class="toasts" aria-live="polite" aria-atomic="false">
  <div class="toast toast--ok"><span class="toast__dot"></span>Post salvo.</div>
</div>
```

```css
.toasts{ position:fixed; right:24px; bottom:24px; display:flex; flex-direction:column; gap:10px; z-index:60; }
.toast{ display:flex; align-items:center; gap:10px; padding:12px 16px; background:var(--surface); border:1px solid var(--linha); border-radius:var(--r-md); box-shadow:0 12px 30px rgba(46,42,57,.14); font-size:14px; font-weight:600; color:var(--tinta); animation:toast-in .24s var(--ease-gentle); }
.toast__dot{ width:9px; height:9px; border-radius:50%; }
.toast--ok .toast__dot{ background:var(--verde); }
.toast--err .toast__dot{ background:var(--rosa); }
.toast--info .toast__dot{ background:var(--azul); }
@keyframes toast-in{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:none; } }
@media (prefers-reduced-motion:reduce){ .toast{ animation-name:toast-fade; } @keyframes toast-fade{ from{opacity:0} to{opacity:1} } }
```

---

## 12. Empty, loading, error states

Predictable, kind, never a dead end. The empty state is the one work-screen place a small character touch is welcome.

```html
<!-- Empty -->
<div class="state">
  <img class="state__art" src="../images/Turminha/turma-acena.png" alt="" aria-hidden="true" />
  <h2 class="state__title">Nenhum post ainda</h2>
  <p class="state__sub">Quando você publicar seu primeiro post, ele aparece aqui.</p>
  <a class="btn btn--primary" href="/painel/editor/">Escrever o primeiro post</a>
</div>

<!-- Loading: skeleton rows -->
<div class="skel" aria-hidden="true"><span class="skel__row"></span><span class="skel__row"></span><span class="skel__row"></span></div>
```

```css
.state{ display:flex; flex-direction:column; align-items:center; gap:12px; padding:64px 24px; text-align:center; }
.state__art{ width:120px; height:auto; opacity:.95; }
.state__title{ margin:0; font-family:var(--font-display); font-weight:400; font-size:30px; color:var(--tinta); } /* Barnacle Boy OK in empty-state */
.state__sub{ margin:0; max-width:380px; font-size:14px; line-height:1.6; color:var(--tinta-muted); }
.skel__row{ display:block; height:52px; margin-bottom:8px; border-radius:var(--r-sm); background:linear-gradient(90deg,var(--creme) 0%,var(--creme-deep) 50%,var(--creme) 100%); background-size:200% 100%; animation:skel 1.2s ease-in-out infinite; }
@keyframes skel{ from{background-position:200% 0} to{background-position:-200% 0} }
@media (prefers-reduced-motion:reduce){ .skel__row{ animation:none; } }
```

---

## 13. Login screen

The one screen allowed real brand warmth: centered card on cream, wordmark in Barnacle Boy, one soft blob behind it, reassuring copy. Still calm, no confetti.

```html
<main class="login">
  <div class="login__blob" aria-hidden="true"></div>
  <form class="login__card">
    <img class="login__mark" src="../images/logo-3.png" alt="HD360" />
    <h1 class="login__title">Painel HD360</h1>
    <p class="login__sub">Entre para gerenciar o blog.</p>
    <div class="field"><label class="field__label" for="email">E-mail</label><input class="input" id="email" type="email" autocomplete="username" /></div>
    <div class="field"><label class="field__label" for="pw">Senha</label><input class="input" id="pw" type="password" autocomplete="current-password" /></div>
    <button class="btn btn--primary login__submit" type="submit">Entrar</button>
    <p class="login__err" role="alert" hidden>E-mail ou senha incorretos.</p>
  </form>
</main>
```

```css
.login{ position:relative; min-height:100vh; display:grid; place-items:center; padding:24px; background:var(--app-bg); overflow:hidden; }
.login__blob{ position:absolute; width:520px; height:520px; border-radius:46% 54% 60% 40%/52% 44% 56% 48%; background:radial-gradient(circle at 30% 30%, var(--lilas-soft), var(--azul-soft)); filter:blur(8px); opacity:.7; z-index:0; }
.login__card{ position:relative; z-index:1; width:min(380px,100%); display:flex; flex-direction:column; gap:4px; padding:34px 30px; background:var(--surface); border-radius:var(--r-lg); box-shadow:0 24px 60px rgba(46,42,57,.12); }
.login__mark{ width:48px; height:48px; object-fit:contain; margin-bottom:6px; }
.login__title{ margin:0; font-family:var(--font-display); font-weight:400; font-size:32px; line-height:1; color:var(--lilas-ink); }
.login__sub{ margin:0 0 18px; font-size:14px; color:var(--tinta-muted); }
.login__submit{ width:100%; justify-content:center; margin-top:6px; }
.login__err{ margin:12px 0 0; font-size:13px; font-weight:600; color:var(--rosa-ink); text-align:center; }
@media (prefers-reduced-motion:reduce){ .login__blob{ filter:none; } }
```

---

## 14. The "Atualizar site" publish control

Lives in the topbar. Two parts: a quiet **"alterações não publicadas"** indicator (amarelo dot) that appears when drafts differ from the live site, and the **"Atualizar site"** button that triggers the rebuild (Edge Function → GitHub Action). Cycles through states: idle → "publicando…" → "site atualizado".

```html
<div class="publish">
  <span class="publish__flag" hidden><span class="publish__dot"></span>Alterações não publicadas</span>
  <button class="btn btn--primary publish__btn">Atualizar site</button>
</div>
```

```css
.publish{ display:flex; align-items:center; gap:12px; }
.publish__flag{ display:inline-flex; align-items:center; gap:7px; padding:5px 12px; background:var(--amarelo-soft); border-radius:var(--r-pill); font-size:12px; font-weight:600; color:var(--tinta); }
.publish__dot{ width:8px; height:8px; border-radius:50%; background:var(--amarelo); }
.publish__btn[data-state="busy"]{ opacity:.7; pointer-events:none; }   /* label → "Publicando…" */
.publish__btn[data-state="done"]{ --c-bg:var(--verde); box-shadow:0 8px 20px rgba(168,196,32,.3); } /* label → "Site atualizado" */
```

JS sets `data-state` and swaps the label; after "done", revert to idle and hide the flag. Announce each transition in an `aria-live` region so the change isn't color-only.

---

When a component you need isn't here, build it in the same spirit: neutral surface, slate ink, `--linha` hairlines, one coded color only if it carries a status/action meaning, pill or `--r-sm`/`--r-md` corners, one functional motion, reduced-motion wired, real labels and focus rings. Calm, warm, legible.
