import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { renderLogin } from './screens/login.js';
import { renderList } from './screens/list.js';
import { renderEditor } from './screens/editor.js';

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
            <!-- "Atualizar site" entra no Plano 3; placeholder desabilitado por ora -->
            <button class="btn btn--primary" disabled title="Disponível na próxima etapa">Atualizar site</button>
          </div>
        </header>
        <main class="work" id="work"></main>
      </div>
    </div>`;
  appRoot.querySelector('#logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
  return appRoot.querySelector('#work');
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
