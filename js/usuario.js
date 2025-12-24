// js/usuario.js
import { auth, db } from "../firebase/config.js";
import { updateEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elementos
const virarPremiumBtn = document.getElementById("virarPremiumBtn");
const vencimentoEl = document.getElementById("premiumVencimento");
const usuarioNomeSpan = document.getElementById("usuarioNome");
const usuarioNomeInfo = document.getElementById("usuarioNomeInfo");
const nomeUsuario = document.getElementById("nomeUsuario");
const sobrenomeUsuario = document.getElementById("sobrenomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const cursoUsuario = document.getElementById("cursoUsuario");
const tipoUsuario = document.getElementById("tipoUsuario");
const logoutBtn = document.getElementById("logoutBtn");
const userForm = document.getElementById("userForm");

// Função para formatar data
function formatarData(data) {
  if (!data) return "-";

  // string dd-mm-yyyy
  if (typeof data === "string") {
    const [d, m, y] = data.split("-");
    return `${d}/${m}/${y}`;
  }

  // Timestamp do Firestore
  if (data.toDate) {
    return data.toDate().toLocaleDateString("pt-BR");
  }

  return "-";
}

// Função para carregar dados
async function carregarDadosUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();

  usuarioNomeSpan.textContent = data.nome ?? "";
  usuarioNomeInfo.textContent = data.nome ?? "";
  nomeUsuario.value = data.nome ?? "";
  sobrenomeUsuario.value = data.sobrenome ?? "";
  emailUsuario.value = data.email ?? "";
  cursoUsuario.value = data.curso ?? "";

  // 🔹 PADRONIZADO
  const tipo =
  data.tipoUsuario ??
  data.tipo ??
  "padrao";

  tipoUsuario.value = tipo;
  if (!data.tipoUsuario && data.tipo) {
    await setDoc(
      doc(db, "usuarios", user.uid),
      { tipoUsuario: data.tipo },
      { merge: true }
    );
  }


  // 🔹 CONTROLE PREMIUM
  if (tipo === "genius" || tipo === "genius_plus") {
    virarPremiumBtn.style.display = "none";
    vencimentoEl.textContent = formatarData(data.premiumVencimento);
  } else {
    virarPremiumBtn.style.display = "inline-block";
    vencimentoEl.textContent = "Plano gratuito";
  }
}

// Checa usuário logado
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  await carregarDadosUsuario(user);
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});

// Salvar alterações
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  if (!nomeUsuario.value.trim() || !sobrenomeUsuario.value.trim() || !emailUsuario.value.trim() || !cursoUsuario.value.trim()) {
    alert("Nome, sobrenome, email e curso são obrigatórios!");
    return;
  }

  try {
    await updateEmail(user, emailUsuario.value);

    const userRef = doc(db, "usuarios", user.uid);

    await setDoc(userRef, {
      nome: nomeUsuario.value,
      sobrenome: sobrenomeUsuario.value,
      email: emailUsuario.value,
      curso: cursoUsuario.value,
    }, { merge: true });

    usuarioNomeSpan.textContent = nomeUsuario.value;
    usuarioNomeInfo.textContent = nomeUsuario.value;

    alert("Informações atualizadas com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar dados:", err);
    alert("Não foi possível atualizar os dados.");
  }
});

virarPremiumBtn.addEventListener("click", () => {
  window.location.href = "premium.html";
});