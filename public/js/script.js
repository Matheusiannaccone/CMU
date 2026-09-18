// Comportamentos compartilhados pelos cabeçalhos do site.
async function initializeGlobalUI() {
  const header = document.querySelector(".barra-superior");
  const loginBtn = header?.querySelector("#loginBtn");
  const signupBtn = header?.querySelector("#signupBtn");
  const logoutBtn = header?.querySelector("#logoutBtn");

  // Formulários e página 404 não possuem controles de autenticação no cabeçalho.
  if (!loginBtn && !signupBtn && !logoutBtn) return;

  const [{ auth }, { onAuthStateChanged, signOut }] = await Promise.all([
    import("../firebase/config.js"),
    import("https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js")
  ]);

  if (loginBtn || signupBtn) {
    onAuthStateChanged(auth, user => {
      if (loginBtn) {
        const loginLink = loginBtn.closest("a");
        loginBtn.textContent = user ? "Logout" : "Fazer login";
        if (user) {
          loginLink?.removeAttribute("href");
          loginBtn.onclick = event => {
            event.preventDefault();
            return signOut(auth);
          };
        } else {
          loginLink?.setAttribute("href", "login.html");
          loginBtn.onclick = null;
        }
      }

      if (signupBtn) {
        const signupLink = signupBtn.closest("a");
        signupBtn.textContent = user ? "Usuario" : "Cadastrar";
        if (user) {
          signupLink?.removeAttribute("href");
          signupBtn.onclick = () => {
            window.location.href = "usuario.html";
          };
        } else {
          signupLink?.setAttribute("href", "cadastro.html");
          signupBtn.onclick = null;
        }
      }
    });
  }

  logoutBtn?.addEventListener("click", () => signOut(auth));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGlobalUI, { once: true });
} else {
  initializeGlobalUI();
}
