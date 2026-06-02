// Toast acessível (verde=ok, rosa=erro, azul=info). Some sozinho.
export function toast(message, kind = 'ok') {
  const host = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `<span class="toast__dot"></span>${escapeHtml(message)}`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// Escapa texto para inserção segura em HTML (títulos de posts vêm do usuário).
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
