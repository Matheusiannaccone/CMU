try {
  const temaSalvo = localStorage.getItem("temaBase");
  const modoSalvo = localStorage.getItem("modoTema");

  if (temaSalvo && temaSalvo !== "default") {
    document.body.setAttribute("data-theme", temaSalvo);
  }

  if (modoSalvo === "dark") {
    document.body.classList.add("dark-mode");
  }
} catch {}
