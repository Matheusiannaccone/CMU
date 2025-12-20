import { auth, db } from "../firebase/config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elementos
const usuarioNomeSpan = document.getElementById("usuarioNome");
const usuarioNomeInfo = document.getElementById("usuarioNomeInfo");
const nomeUsuario = document.getElementById("nomeUsuario");
const sobrenomeUsuario = document.getElementById("sobrenomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const cursoUsuario = document.getElementById("cursoUsuario");
const tipoUsuario = document.getElementById("tipoUsuario");
const logoutBtn = document.getElementById("logoutBtn");
const userForm = document.getElementById("userForm");

// Função para carregar dados
async function carregarDadosUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    usuarioNomeSpan.textContent = data.nome;
    usuarioNomeInfo.textContent = data.nome;
    nomeUsuario.value = data.nome ?? "";
    sobrenomeUsuario.value = data.sobrenome ?? "";
    emailUsuario.value = data.email ?? "";
    cursoUsuario.value = data.curso ?? "";
    tipoUsuario.value = data.tipo ?? "padrao";
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

  try {
    const userRef = doc(db, "usuarios", user.uid);

    await setDoc(userRef, {
      nome: nomeUsuario.value,
      sobrenome: sobrenomeUsuario.value,
      email: emailUsuario.value,
      curso: cursoUsuario.value,
      tipo: tipoUsuario.value, // Mantém o tipo atual
    }, { merge: true });

    usuarioNomeSpan.textContent = nomeUsuario.value;
    usuarioNomeInfo.textContent = nomeUsuario.value;

    alert("Informações atualizadas com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar dados:", err);
    alert("Não foi possível atualizar os dados.");
  }
});
