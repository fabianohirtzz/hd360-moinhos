import { escapeHtml, toast } from '../lib/ui.js';
import { CATEGORIES } from '../config.js';
import { slugify } from '../lib/slug.js';
import { metaState, serp } from '../lib/seo.js';
import { buildPayload } from '../lib/post-payload.js';
import { uploadImage } from '../lib/upload.js';

export async function renderEditor(work, { supabase, id }) {
  // Estado de edição: carrega o post se houver id.
  let existing = null;
  if (id) {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error || !data) { toast('Post não encontrado.', 'err'); location.hash = '#/posts'; return; }
    existing = data;
  }

  const tags = new Set(existing?.tags || []);
  let slugTouched = !!existing; // em edição não regerar slug automaticamente
  let coverImage = existing?.cover_image || '';

  work.innerHTML = `
    <form id="editor" class="editor-grid">
      <section class="panel panel--pad">
        <p class="eyebrow">Conteúdo</p>
        <div class="field">
          <label class="field__label" for="f-title">Título</label>
          <input class="input" id="f-title" type="text" value="${escapeHtml(existing?.title || '')}" />
        </div>
        <div class="field">
          <span class="field__label">Texto</span>
          <div class="editor"><div id="quill"></div></div>
        </div>
        <div class="field">
          <span class="field__label">Imagem de capa</span>
          <div id="cover-slot"></div>
        </div>
      </section>

      <section class="panel panel--pad">
        <p class="eyebrow">Organização</p>
        <div class="field">
          <label class="field__label" for="f-cat">Categoria</label>
          <select class="input" id="f-cat">
            ${CATEGORIES.map(c => `<option value="${c.name}" data-color="${c.color}" ${existing?.category_name===c.name?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <span class="field__label">Tags</span>
          <div class="chips" id="chips">
            <input class="chips__input" id="chip-input" placeholder="Adicionar tag…" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="f-slug">Slug (URL)</label>
          <input class="input" id="f-slug" type="text" value="${escapeHtml(existing?.slug || '')}" />
          <p class="field__help">Mudar o endereço muda a URL e pode afetar o SEO.</p>
        </div>
      </section>

      <section class="panel panel--pad">
        <p class="eyebrow">SEO</p>
        <div class="field">
          <label class="field__label" for="f-seotitle">Título de SEO</label>
          <input class="input" id="f-seotitle" type="text" value="${escapeHtml(existing?.seo_title || '')}" />
        </div>
        <div class="field">
          <label class="field__label" for="f-meta">Meta description</label>
          <textarea class="input" id="f-meta" rows="3">${escapeHtml(existing?.meta_description || '')}</textarea>
          <p class="field__help"><span class="counter" id="meta-count">0</span>/160 caracteres</p>
        </div>
        <div class="field">
          <label class="field__label" for="f-kw">Palavra-chave foco</label>
          <input class="input" id="f-kw" type="text" value="${escapeHtml(existing?.focus_keyword || '')}" />
        </div>
        <div class="field">
          <label class="field__label" for="f-excerpt">Resumo (excerpt)</label>
          <textarea class="input" id="f-excerpt" rows="2">${escapeHtml(existing?.excerpt || '')}</textarea>
        </div>
        <div class="serp" id="serp"></div>
      </section>

      <div class="editor-actions">
        <button class="btn btn--quiet" type="button" id="btn-preview">Ver prévia</button>
        <button class="btn btn--ghost" type="button" id="btn-draft">Salvar rascunho</button>
        <button class="btn btn--primary" type="button" id="btn-publish">Publicar</button>
      </div>
    </form>`;

  // --- Quill ---
  const quill = new window.Quill('#quill', {
    theme: 'snow',
    modules: { toolbar: [
      ['bold', 'italic'], [{ header: 2 }, { header: 3 }],
      [{ list: 'bullet' }], ['blockquote', 'link', 'image'],
    ] },
  });
  if (existing?.content) quill.clipboard.dangerouslyPasteHTML(existing.content);

  // Handler de imagem inline (Task 9 implementa uploadImage).
  quill.getModule('toolbar').addHandler('image', () => pickImage(async (file) => {
    try {
      const url = await uploadImage(supabase, file);
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', url, 'user');
    } catch {
      toast('Falha no upload da imagem.', 'err');
    }
  }));

  // --- Campos ---
  const $ = sel => work.querySelector(sel);
  const titleEl = $('#f-title'), slugEl = $('#f-slug'), catEl = $('#f-cat');
  const seoTitleEl = $('#f-seotitle'), metaEl = $('#f-meta'), excerptEl = $('#f-excerpt');

  titleEl.addEventListener('input', () => {
    if (!slugTouched) slugEl.value = slugify(titleEl.value);
    refreshSerp();
  });
  slugEl.addEventListener('input', () => { slugTouched = true; refreshSerp(); });
  seoTitleEl.addEventListener('input', refreshSerp);
  excerptEl.addEventListener('input', refreshSerp);
  metaEl.addEventListener('input', () => { refreshMeta(); refreshSerp(); });

  function refreshMeta() {
    const { count, level } = metaState(metaEl.value);
    const c = $('#meta-count'); c.textContent = count;
    c.style.color = level === 'over' ? 'var(--rosa-ink)' : level === 'ok' ? 'var(--verde-ink)' : 'var(--tinta-muted)';
  }
  function refreshSerp() {
    const s = serp({ title: titleEl.value, slug: slugEl.value, seoTitle: seoTitleEl.value, metaDescription: metaEl.value, excerpt: excerptEl.value });
    $('#serp').innerHTML = `<span class="serp__url">${escapeHtml(s.url)}</span>
      <span class="serp__title">${escapeHtml(s.title)}</span>
      <span class="serp__desc">${escapeHtml(s.desc)}</span>`;
  }

  // --- Tags (chips) ---
  const chips = $('#chips'), chipInput = $('#chip-input');
  function drawChips() {
    chips.querySelectorAll('.chip').forEach(c => c.remove());
    [...tags].forEach(t => {
      const el = document.createElement('span');
      el.className = 'chip';
      el.innerHTML = `${escapeHtml(t)}<button type="button" class="chip__x" aria-label="Remover ${escapeHtml(t)}">×</button>`;
      el.querySelector('.chip__x').addEventListener('click', () => { tags.delete(t); drawChips(); });
      chips.insertBefore(el, chipInput);
    });
  }
  chipInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const v = chipInput.value.trim().replace(/,$/, '');
      if (v) { tags.add(v); chipInput.value = ''; drawChips(); }
    } else if (e.key === 'Backspace' && !chipInput.value && tags.size) {
      const last = [...tags].pop(); tags.delete(last); drawChips();
    }
  });
  drawChips();

  // --- Capa (dropzone; upload real na Task 9) ---
  renderCover();
  function renderCover() {
    const slot = $('#cover-slot');
    if (coverImage) {
      slot.innerHTML = `<figure class="cover"><img class="cover__img" src="${escapeHtml(coverImage)}" alt="Prévia da capa" />
        <div class="cover__bar"><button class="btn btn--quiet" type="button" id="cover-change">Trocar</button>
        <button class="btn btn--danger" type="button" id="cover-remove">Remover</button></div></figure>`;
      slot.querySelector('#cover-remove').addEventListener('click', () => { coverImage = ''; renderCover(); });
      slot.querySelector('#cover-change').addEventListener('click', chooseCover);
    } else {
      slot.innerHTML = `<button type="button" class="dropzone" id="cover-pick">
        <span class="dropzone__t">Clique para enviar a capa</span>
        <span class="dropzone__hint">JPG ou PNG, 16:9 recomendado</span></button>`;
      slot.querySelector('#cover-pick').addEventListener('click', chooseCover);
    }
  }
  function chooseCover() {
    pickImage(async (file) => {
      try { coverImage = await uploadImage(supabase, file); renderCover(); }
      catch { toast('Falha no upload da capa.', 'err'); }
    });
  }

  // --- Salvar ---
  async function save(status) {
    const selected = catEl.options[catEl.selectedIndex];
    const form = {
      title: titleEl.value.trim(),
      slug: (slugEl.value.trim() || slugify(titleEl.value)),
      categoryName: catEl.value,
      categoryColor: selected.dataset.color,
      content: quill.root.innerHTML,
      excerpt: excerptEl.value.trim(),
      coverImage,
      metaDescription: metaEl.value.trim(),
      seoTitle: seoTitleEl.value.trim(),
      ogImage: existing?.og_image || coverImage,
      focusKeyword: $('#f-kw').value.trim(),
      tags: [...tags],
      status,
    };
    if (!form.title) { toast('Dê um título ao post.', 'err'); return; }
    if (!form.slug) { toast('O slug ficou vazio.', 'err'); return; }
    const payload = buildPayload(form);

    let res;
    if (existing) res = await supabase.from('posts').update(payload).eq('id', existing.id);
    else res = await supabase.from('posts').insert(payload);

    if (res.error) {
      toast(res.error.code === '23505' ? 'Já existe um post com esse slug.' : 'Não deu para salvar.', 'err');
      return;
    }
    toast(status === 'published' ? 'Post publicado.' : 'Rascunho salvo.', 'ok');
    location.hash = '#/posts';
  }

  $('#btn-draft').addEventListener('click', () => save('draft'));
  $('#btn-publish').addEventListener('click', () => save('published'));
  $('#btn-preview').addEventListener('click', () => openPreview(titleEl.value, quill.root.innerHTML, coverImage));

  refreshMeta(); refreshSerp();
}

// Abre um seletor de arquivo de imagem e chama back(file).
function pickImage(back) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.addEventListener('change', () => { if (input.files[0]) back(input.files[0]); });
  input.click();
}

// Prévia simples num overlay, com a tipografia do post.
function openPreview(title, html, cover) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal" style="width:min(760px,100%);max-height:86vh;overflow:auto;text-align:left">
    ${cover ? `<img src="${escapeHtml(cover)}" alt="" style="width:100%;border-radius:var(--r-md);margin-bottom:16px" />` : ''}
    <h1 style="font-family:var(--font-display);font-weight:400;font-size:30px;margin:0 0 16px">${escapeHtml(title || 'Sem título')}</h1>
    <div class="editor__body" style="padding:0">${html}</div>
    <div class="modal__actions" style="margin-top:20px"><button class="btn btn--quiet" data-close>Fechar</button></div>
  </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('[data-close]').addEventListener('click', close);
}
