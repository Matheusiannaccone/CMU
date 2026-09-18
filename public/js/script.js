// Comportamentos compartilhados pelos cabeçalhos do site.
async function initializeGlobalUI() {
  const header = document.querySelector(".barra-superior");
  const loginLink = header?.querySelector("#loginBtn");
  const signupLink = header?.querySelector("#signupBtn");
  const logoutBtn = header?.querySelector("#logoutBtn");

  // Formulários e página 404 não possuem controles de autenticação no cabeçalho.
  if (!loginLink && !signupLink && !logoutBtn) return;

  const [{ auth }, { onAuthStateChanged, signOut }] = await Promise.all([
    import("../firebase/config.js"),
    import("https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js")
  ]);

  if (loginLink || signupLink) {
    onAuthStateChanged(auth, user => {
      if (loginLink) loginLink.hidden = Boolean(user);
      if (logoutBtn) logoutBtn.hidden = !user;

      if (signupLink) {
        signupLink.textContent = user ? "Usuário" : "Cadastrar";
        signupLink.href = user ? "usuario.html" : "cadastro.html";
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
