const temas = [
  "default",
  "gold",
  "blue-tech",
  "green",
  "rose",
  "crimson",
  "midnight",
  "cyber"
];

// aplica tema base
window.setTheme = function (tema) {
  if (tema === "default") {
    document.body.removeAttribute("data-theme");
    localStorage.setItem("temaBase", "default");
    return;
  }

  document.body.setAttribute("data-theme", tema);
  localStorage.setItem("temaBase", tema);
};

// alterna claro/escuro
window.toggleTheme = function () {
  document.body.classList.toggle("dark-mode");

  localStorage.setItem(
    "modoTema",
    document.body.classList.contains("dark-mode")
      ? "dark"
      : "light"
  );
};

// carrega ao abrir
document.addEventListener("DOMContentLoaded", () => {
  const temaSalvo =
    localStorage.getItem("temaBase") || "default";

  const modoSalvo =
    localStorage.getItem("modoTema") || "light";

  if (temaSalvo !== "default") {
    document.body.setAttribute("data-theme", temaSalvo);
  }

  if (modoSalvo === "dark") {
    document.body.classList.add("dark-mode");
  }
});