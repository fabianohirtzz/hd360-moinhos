export function renderLogin(root, { onLogin }) {
  root.innerHTML = `
    <main class="login">
      <div class="login__blob" aria-hidden="true"></div>
      <form class="login__card" id="login-form">
        <img class="login__mark" src="../images/logo-3.png" alt="HD360" />
        <h1 class="login__title">Painel HD360</h1>
        <p class="login__sub">Entre para gerenciar o blog.</p>
        <div class="field">
          <label class="field__label" for="email">E-mail</label>
          <input class="input" id="email" type="email" autocomplete="username" required />
        </div>
        <div class="field">
          <label class="field__label" for="pw">Senha</label>
          <input class="input" id="pw" type="password" autocomplete="current-password" required />
        </div>
        <button class="btn btn--primary login__submit" type="submit">Entrar</button>
        <p class="login__err" id="login-err" role="alert" hidden>E-mail ou senha incorretos.</p>
      </form>
    </main>`;

  const form = root.querySelector('#login-form');
  const err = root.querySelector('#login-err');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#pw').value;
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      await onLogin(email, password);
    } catch (e2) {
      err.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
}
