// Curtidas anônimas do blog HD360. Módulo ES: as funções puras são testadas no Node;
// o runtime só roda no navegador (guardado por `typeof document`).
// A anon key é pública por design (RLS + increment_likes SECURITY DEFINER no banco).
const SUPABASE_URL = 'https://euzmbswywwhmicjlszqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1em1ic3d5d3dobWljamxzenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDEyODYsImV4cCI6MjA5NjAxNzI4Nn0.oSIv6fSKVxO9Umuii6xt98cT0yoSqepTIzVCdcocfuU';
const STORAGE_KEY = 'hd360_liked';

// ---- Funções puras (testáveis) ----
export function readLiked(raw) {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
export function hasLiked(slug, list) {
  return (list || []).includes(slug);
}
export function addLiked(slug, list) {
  return [...new Set([...(list || []), slug])];
}

// ---- Acesso ao Supabase (REST/RPC, zero dependência) ----
async function fetchLikes(slug) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=likes`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ? rows[0].likes : null;
  } catch { return null; }
}

async function sendLike(slug) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_likes`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
    });
    if (!res.ok) return null;
    return await res.json(); // o RPC devolve o novo total (inteiro)
  } catch { return null; }
}

// ---- Runtime (só no navegador) ----
function initLikes() {
  const root = document.querySelector('[data-like]');
  if (!root) return;
  const slug = root.dataset.like;
  const btn = root.querySelector('.like__btn');
  const countEl = root.querySelector('.like__count');

  const markLiked = () => { btn.classList.add('is-liked'); btn.setAttribute('aria-pressed', 'true'); };
  const alreadyLiked = () => hasLiked(slug, readLiked(localStorage.getItem(STORAGE_KEY)));

  if (alreadyLiked()) markLiked();

  // Atualiza o total ao vivo (o número do build pode estar defasado).
  fetchLikes(slug).then(n => { if (n != null) countEl.textContent = n; });

  btn.addEventListener('click', async () => {
    if (alreadyLiked()) return;          // de-dup: uma curtida por pessoa/navegador
    btn.disabled = true;
    const n = await sendLike(slug);
    btn.disabled = false;
    if (n == null) return;               // falhou: não marca como curtido
    countEl.textContent = n;
    markLiked();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addLiked(slug, readLiked(localStorage.getItem(STORAGE_KEY)))));
  });
}

if (typeof document !== 'undefined') initLikes();
