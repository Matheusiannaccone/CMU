// js/index.js
// ---------------- FIREBASE (CDN) ----------------
import { verificaPremium } from "./verificaPremium.js";
import { auth } from "../firebase/config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getSemesters, addSemester } from "../firestore/carregarSemestres.js";

let currentUser = null;
let msgTimeout = null;

// ---------------- ELEMENTOS ----------------
const virarPremiumBtn = document.getElementById("virarPremiumBtn");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn")
const mediaGeralEl = document.getElementById("mediaGeral");
const materiasContainer = document.getElementById("materiasContainer");
const adicionarMateriaBtn = document.getElementById("adicionarMateriaBtn");
const removerMateriaBtn = document.getElementById("removerMateriaBtn");
const msgEl = document.getElementById("msg");
const semestreSelect = document.getElementById("semestreSelect");


if (adicionarMateriaBtn) {
  adicionarMateriaBtn.addEventListener("click", adicionarMateria);
}
if (removerMateriaBtn) {
  removerMateriaBtn.addEventListener("click", removerMateria);
}


// ---------------- AUTH STATE ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // 🔴 NÃO LOGADO
    currentUser = null;
    setupGuestUI();
    atualizarUIPremium("padrao");
    virarPremiumBtn.style.display = "block";
    return;
  }

  // 🟢 LOGADO
  currentUser = user;
  setupLoggedUI(user);

  const plano = await verificaPremium(); 
  // "padrao" | "genius" | "genius_plus"

  atualizarUIPremium(plano);

  if (plano === "padrao") {
    virarPremiumBtn.style.display = "block";
  } else {
    virarPremiumBtn.style.display = "none";
    carregarSemestres(); // ✅ só premium carrega
  }

  if (plano === "genius_plus") {
    // acesso antecipado
  }
});

if (virarPremiumBtn) {
  virarPremiumBtn.addEventListener("click", () => {
    window.location.href = "premium.html";
  });
}


// ---------------- UI STATES ----------------
function setupLoggedUI(user) {
  // 🔄 LOGIN -> LOGOUT
  loginBtn.textContent = "Logout";
  loginBtn.parentElement.removeAttribute("href");
  loginBtn.onclick = async () => {
    await signOut(auth);
  };

  // 🔄 CADASTRO -> USUARIO
  signupBtn.textContent = "Usuario";
  signupBtn.parentElement.removeAttribute("href");
  signupBtn.onclick = () => {
    window.location.href = "usuario.html";
  };
}

function setupGuestUI() {
  loginBtn.textContent = "Fazer login";
  loginBtn.onclick = null;
  loginBtn.parentElement.setAttribute("href", "login.html");

  signupBtn.textContent = "Cadastrar";
  signupBtn.onclick = null;
  signupBtn.parentElement.setAttribute("href", "cadastro.html");
}

function atualizarUIPremium(plano) {
  if (!semestreSelect) return;

  semestreSelect.innerHTML = "";

  if (plano === "genius" || plano === "genius_plus") {
    semestreSelect.disabled = false;

    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Selecione o semestre";
    semestreSelect.appendChild(opt);

    const add = document.createElement("option");
    add.value = "add";
    add.textContent = "➕ Adicionar semestre";
    semestreSelect.appendChild(add);

  } else {
    semestreSelect.disabled = true;

    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent =
      "🔒 Apenas usuários Premium podem criar e acessar semestres";
    semestreSelect.appendChild(opt);
  }
}


// ================= CÁLCULO COM PESOS + AS =================

if (materiasContainer) {
  materiasContainer.addEventListener("input", calcularTudo);
}

function calcularTudo() {
  const materias = document.querySelectorAll(".materia");
  let somaMedias = 0;
  let qtdMedias = 0;

  materias.forEach((materia, index) => {
    const i = index + 1;

    const ac1 = getNota(materia, `materia${i}_nota1`);
    const ac2 = getNota(materia, `materia${i}_nota2`);
    const af  = getNota(materia, `materia${i}_nota3`);
    const ag  = getNota(materia, `materia${i}_nota4`);
    const as  = getNota(materia, `materia${i}_nota5`);

    // pesos fixos
    const pesos = {
      ac1: 0.15,
      ac2: 0.30,
      af:  0.45,
      ag:  0.10
    };

    // valores atuais
    const notas = {
      ac1,
      ac2,
      af,
      ag
    };

    // --- média base ---
    let mediaBase = 0;
    let existeNota = false;

    for (const k in notas) {
      if (notas[k] !== null) {
        mediaBase += notas[k] * pesos[k];
        existeNota = true;
      }
    }

    let melhorMedia = existeNota ? mediaBase : NaN;

    // --- aplica AS ---
    if (as !== null && existeNota) {
      for (const k in notas) {
        const notaAtual = notas[k];
        if (notaAtual === null) continue;

        const mediaComAS =
          mediaBase -
          notaAtual * pesos[k] +
          as * pesos[k];

        if (mediaComAS > melhorMedia) {
          melhorMedia = mediaComAS;
        }
      }
    }

    const mediaInput = materia.querySelector(
      `input[name="materia${i}_media"]`
    );

    if (mediaInput) {
      mediaInput.value = Number.isFinite(melhorMedia)
        ? melhorMedia.toFixed(2)
        : "";
    }

    if (Number.isFinite(melhorMedia)) {
      somaMedias += melhorMedia;
      qtdMedias++;
    }
  });

  mediaGeralEl.textContent =
    qtdMedias > 0 ? (somaMedias / qtdMedias).toFixed(2) : "-";
}
window.calcularTudo = calcularTudo;


// ---------------- UTIL ----------------
function getNota(container, name) {
  const v = container.querySelector(`input[name="${name}"]`)?.value;
  if (v === "" || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function adicionarMateria() {
  const materias = materiasContainer.querySelectorAll(".materia");
  
    if (materias.length >= 8) {
    mostrarMensagem("Limite máximo de 8 matérias atingido.", true);
    return;
    }

  const index = materias.length + 1;

  const div = document.createElement("div");
  div.className = "materia visible";
  div.id = `materia${index}`;

  div.innerHTML = `
    <h2>Matéria ${index}</h2>
    <div class="materia-nome-container">
      <input type="text" name="materia${index}_nome" placeholder="Nome da matéria">
    </div>
    <div class="notas">
      <input type="number" name="materia${index}_nota1" placeholder="AC1" min="0" step="0.01">
      <input type="number" name="materia${index}_nota2" placeholder="AC2" min="0" step="0.01">
      <input type="number" name="materia${index}_nota3" placeholder="AF" min="0" step="0.01">
      <input type="number" name="materia${index}_nota4" placeholder="AG" min="0" step="0.01">
      <input type="number" name="materia${index}_nota5" placeholder="AS" min="0" step="0.01">
      <input type="text" name="materia${index}_media" class="media" placeholder="Média" readonly>
    </div>
  `;

  materiasContainer.appendChild(div);
  mostrarMensagem(`Matéria ${index} adicionada.`);
}

function removerMateria() {
  const materias = materiasContainer.querySelectorAll(".materia");
  
  if (materias.length <= 1) {
   mostrarMensagem("É obrigatório ter pelo menos 1 matéria.", true);
   return;
  }

  materias[materias.length - 1].remove();
  mostrarMensagem("Matéria removida.");
  calcularTudo();
}

function mostrarMensagem(texto, erro = false) {
  if (!msgEl) return;

  // cancela timeout anterior
  if (msgTimeout) {
    clearTimeout(msgTimeout);
    msgTimeout = null;
  }

  msgEl.textContent = texto;
  msgEl.style.color = erro ? "crimson" : "var(--cor-primaria)";
  msgEl.classList.add("visible");

  msgTimeout = setTimeout(() => {
    msgEl.textContent = "";
    msgEl.classList.remove("visible");
    msgTimeout = null;
  }, 3000);
}

async function carregarSemestres(selectedId = null) {
  semestreSelect.innerHTML = `
    <option value="" disabled selected>Selecione o semestre</option>
    <option value="add">➕ Adicionar semestre</option>
  `;

  try {
    const semestres = await getSemesters();

    semestres.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.nome;
      semestreSelect.appendChild(opt);
    });

    if (selectedId) {
      semestreSelect.value = selectedId;
    }
  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao carregar semestres.", true);
  }
}

if(semestreSelect){
  semestreSelect.addEventListener("change", async () => {
    if (semestreSelect.value !== "add") return;

    // 🔁 reset imediato para permitir novo clique
    semestreSelect.value = "";

    if (!auth.currentUser) {
      mostrarMensagem("Você precisa estar logado.", true);
      return;
    }

    const entrada = prompt(
      'Digite o semestre no formato aaaa/s (ex: 2025/1):'
    );

    if (!entrada) return;

    const semestre = entrada.trim();
    const regex = /^\d{4}\/[12]$/;

    if (!regex.test(semestre)) {
      mostrarMensagem(
        'Formato inválido. Use "aaaa/1" ou "aaaa/2".',
        true
      );
      return;
    }

    try {
      const id = await addSemester(semestre);
      await carregarSemestres(id);
      mostrarMensagem("Semestre adicionado com sucesso.");
    } catch (err) {
      mostrarMensagem(err.message || "Erro ao adicionar semestre.", true);
    }
  });
}