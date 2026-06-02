import { escapeHtml, toast } from '../lib/ui.js';
import { COLOR_HEX } from '../config.js';

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const ICON_EDIT = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DEL = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';

export async function renderList(work, { supabase }) {
  work.innerHTML = `
    <div class="panel">
      <div class="panel__head">
        <div class="seg" role="tablist" aria-label="Filtrar por status">
          <button class="seg__btn seg__btn--on" data-filter="all" role="tab">Todos</button>
          <button class="seg__btn" data-filter="published" role="tab">Publicados</button>
          <button class="seg__btn" data-filter="draft" role="tab">Rascunhos</button>
        </div>
        <a class="btn btn--primary" href="#/editor">Novo post</a>
      </div>
      <div id="list-body"><div class="skel" aria-hidden="true">
        <span class="skel__row"></span><span class="skel__row"></span><span class="skel__row"></span>
      </div></div>
    </div>`;

  const body = work.querySelector('#list-body');
  let filter = 'all';

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id,slug,title,category_name,category_color,status,date,likes')
    .order('date', { ascending: false });

  if (error) {
    body.innerHTML = `<div class="state"><h2 class="state__title">Não deu para carregar</h2>
      <p class="state__sub">Tente recarregar a página.</p></div>`;
    toast('Erro ao carregar posts.', 'err');
    return;
  }

  function rowsHtml(list) {
    if (!list.length) {
      return `<div class="state">
        <img class="state__art" src="../assets/img/turma-trio.png" alt="" aria-hidden="true" />
        <h2 class="state__title">Nenhum post aqui</h2>
        <p class="state__sub">Quando você criar um post, ele aparece nesta lista.</p>
        <a class="btn btn--primary" href="#/editor">Escrever um post</a>
      </div>`;
    }
    const tr = list.map(p => `
      <tr>
        <td class="table__title">${escapeHtml(p.title)}</td>
        <td><span class="cat"><span class="cat__dot" style="background:${COLOR_HEX[p.category_color] || '#ccc'}"></span>${escapeHtml(p.category_name)}</span></td>
        <td>${badge(p.status)}</td>
        <td class="table__meta">${p.date ? DATE_FMT.format(new Date(p.date)) : ''}</td>
        <td class="table__num">${p.likes ?? 0}</td>
        <td class="table__actions">
          <a class="iconbtn" href="#/editor?id=${p.id}" aria-label="Editar">${ICON_EDIT}</a>
          <button class="iconbtn iconbtn--danger" data-del="${p.id}" data-title="${escapeHtml(p.title)}" aria-label="Excluir">${ICON_DEL}</button>
        </td>
      </tr>`).join('');
    return `<table class="table">
      <thead><tr><th>Título</th><th>Categoria</th><th>Status</th><th>Data</th><th class="table__num">Curtidas</th><th></th></tr></thead>
      <tbody>${tr}</tbody></table>`;
  }

  function draw() {
    const list = filter === 'all' ? posts : posts.filter(p => p.status === filter);
    body.innerHTML = rowsHtml(list);
    body.querySelectorAll('[data-del]').forEach(btn =>
      btn.addEventListener('click', () => confirmDelete(btn.dataset.del, btn.dataset.title)));
  }

  work.querySelectorAll('.seg__btn').forEach(b => b.addEventListener('click', () => {
    work.querySelectorAll('.seg__btn').forEach(x => x.classList.remove('seg__btn--on'));
    b.classList.add('seg__btn--on');
    filter = b.dataset.filter;
    draw();
  }));

  async function confirmDelete(id, title) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-t">
        <h2 class="modal__title" id="m-t">Excluir post?</h2>
        <p class="modal__body">Excluir “${escapeHtml(title)}”? Essa ação não pode ser desfeita.</p>
        <div class="modal__actions">
          <button class="btn btn--quiet" data-close>Cancelar</button>
          <button class="btn btn--danger" data-confirm>Excluir post</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-close]').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);} });
    overlay.querySelector('[data-confirm]').addEventListener('click', async () => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      close();
      if (error) { toast('Não deu para excluir.', 'err'); return; }
      const i = posts.findIndex(p => String(p.id) === String(id));
      if (i >= 0) posts.splice(i, 1);
      draw();
      toast('Post excluído.', 'ok');
    });
  }

  draw();
}

function badge(status) {
  return status === 'published'
    ? '<span class="badge badge--pub"><span class="badge__dot"></span>Publicado</span>'
    : '<span class="badge badge--draft"><span class="badge__dot"></span>Rascunho</span>';
}
