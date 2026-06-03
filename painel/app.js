import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { renderLogin } from './screens/login.js';
import { renderList } from './screens/list.js';
import { renderEditor } from './screens/editor.js';
import { publishUiState, fetchSiteMeta, requestPublish } from './lib/publish.js';
import { toast } from './lib/ui.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginRoot = document.getElementById('login-root');
const appRoot = document.getElementById('app-root');

function shell(innerTitle) {
  appRoot.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <a class="sidebar__brand" href="#/posts">
          <img class="sidebar__mark" src="../images/logo-3.png" alt="HD360" />
          <span class="sidebar__word">Painel</span>
        </a>
        <nav class="sidebar__nav">
          <a class="navitem navitem--active" href="#/posts">Posts</a>
        </nav>
        <button class="navitem navitem--foot" type="button" id="logout">Sair</button>
      </aside>
      <div class="main">
        <header class="topbar">
          <h1 class="topbar__title" id="page-title">${innerTitle}</h1>
          <div class="topbar__actions">
            <span class="publish__flag" id="publish-flag" hidden><span class="publish__dot"></span>Alterações não publicadas</span>
            <button class="btn btn--primary" id="publish-btn">Atualizar site</button>
          </div>
        </header>
        <main class="work" id="work"></main>
      </div>
    </div>`;
  appRoot.querySelector('#logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
  initPublishControl();
  return appRoot.querySelector('#work');
}

let publishTimer = null;

async function refreshPublishControl() {
  const flag = appRoot.querySelector('#publish-flag');
  const btn = appRoot.querySelector('#publish-btn');
  if (!flag || !btn) return null;
  const meta = await fetchSiteMeta(supabase);
  const ui = publishUiState(meta);
  flag.hidden = !ui.flagVisible;
  btn.textContent = ui.btnLabel;
  btn.disabled = ui.btnDisabled;
  return meta;
}

function initPublishControl() {
  const btn = appRoot.querySelector('#publish-btn');
  btn.addEventListener('click', onPublishClick);
  refreshPublishControl();
}

async function onPublishClick() {
  try {
    await requestPublish(supabase);          // marca publishing=true e dispara
    await refreshPublishControl();           // botão vira "Publicando…"
    toast('Publicando o site…', 'info');
    pollPublish(Date.now());
  } catch {
    toast('Não deu para iniciar a publicação.', 'err');
  }
}

function pollPublish(startedAt) {
  clearTimeout(publishTimer);
  publishTimer = setTimeout(async () => {
    const meta = await refreshPublishControl();
    if (meta && !meta.publishing) {
      toast('Site atualizado.', 'ok');
      return;
    }
    if (Date.now() - startedAt > 180000) {   // 3 min de teto
      toast('A publicação está demorando. Confira o GitHub Actions.', 'err');
      return;
    }
    pollPublish(startedAt);
  }, 4000);
}

async function route() {
  const hash = location.hash || '#/posts';
  const work = shell('Posts');
  const titleEl = appRoot.querySelector('#page-title');
  if (hash.startsWith('#/editor')) {
    const id = new URLSearchParams(hash.split('?')[1] || '').get('id');
    titleEl.textContent = id ? 'Editar post' : 'Novo post';
    await renderEditor(work, { supabase, id });
  } else {
    titleEl.textContent = 'Posts';
    await renderList(work, { supabase });
  }
}

function showLogin() {
  appRoot.hidden = true;
  loginRoot.hidden = false;
  renderLogin(loginRoot, {
    onLogin: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
  });
}

function showApp() {
  loginRoot.hidden = true;
  appRoot.hidden = false;
  route();
}

window.addEventListener('hashchange', () => { if (!appRoot.hidden) route(); });

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) showApp(); else showLogin();
});

// Estado inicial
const { data } = await supabase.auth.getSession();
if (data.session) showApp(); else showLogin();
