// js/usuario.js
import { auth, db, functions } from "../firebase/config.js";
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

const usuarioNomeInfo = document.getElementById("usuarioNomeInfo");
const nomeUsuario = document.getElementById("nomeUsuario");
const sobrenomeUsuario = document.getElementById("sobrenomeUsuario");
const cursoUsuario = document.getElementById("cursoUsuario");
const mediaMinima = document.getElementById("mediaMinima");
const logoutBtn = document.getElementById("logoutBtn");
const userForm = document.getElementById("userForm");

const alterarEmailBtn = document.getElementById("alterarEmailBtn");
const alterarSenhaBtn = document.getElementById("alterarSenhaBtn");
const reauthModal = document.getElementById("reauthModal");
const senhaAtualInput = document.getElementById("senhaAtual");
const confirmarReauthBtn = document.getElementById("confirmarReauthBtn");
const cancelarReauthBtn = document.getElementById("cancelarReauthBtn");

let acaoSeguranca = null;

const CURSOS = {
  eng_civil: "Engenharia Civil",
  eng_computacao: "Engenharia da Computação",
  eng_eletrica: "Engenharia Elétrica",
  eng_mecanica: "Engenharia Mecânica",
  eng_mecatronica: "Engenharia Mecatrônica",
  eng_producao: "Engenharia de Produção",
  eng_quimica: "Engenharia Química",
  eng_agronomica: "Engenharia Agronômica",
  arq_urbanismo: "Arquitetura e Urbanismo",
  tec_jogos: "Tecnologia em Jogos Digitais",
  tec_sistemas: "Análise e Desenvolvimento de Sistemas",
  tec_gestao: "Gestão da Tecnologia da Informação",
  medicina: "Medicina",
  odonto: "Odontologia",
  biomedicina: "Biomedicina",
  psicologia: "Psicologia",
  enfermagem: "Enfermagem",
  med_veterinaria: "Medicina Veterinária"
};

function abrirModalSeguranca(acao) {
  acaoSeguranca = acao;
  senhaAtualInput.value = "";
  reauthModal.style.display = "block";
}

function fecharModalSeguranca() {
  reauthModal.style.display = "none";
  acaoSeguranca = null;
}

async function reautenticarUsuario(senha) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const credential = EmailAuthProvider.credential(user.email, senha);
  await reauthenticateWithCredential(user, credential);
}

async function carregarDadosUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();

  usuarioNomeInfo.textContent = data.nome ?? "";
  nomeUsuario.value = data.nome ?? "";
  sobrenomeUsuario.value = data.sobrenome ?? "";
  cursoUsuario.value = data.curso
    ? CURSOS[data.curso] ?? "Curso não definido"
    : "Curso não definido";
  mediaMinima.value = data.mediaMinima ?? "5";
}

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await carregarDadosUsuario(user);
});

logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  if (!nomeUsuario.value.trim() || !sobrenomeUsuario.value.trim() || !cursoUsuario.value.trim()) {
    alert("Nome, sobrenome e curso são obrigatórios!");
    return;
  }

  if (!mediaMinima.value.trim()) {
    alert("Informe a média mínima");
    return;
  }

  const novaMediaMinima = parseFloat(mediaMinima.value);
  if (novaMediaMinima < 4.76 || novaMediaMinima > 10) {
    alert("A média mínima deve estar entre 4.76 e 10");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", user.uid);
    const payload = {
      nome: nomeUsuario.value.trim(),
      sobrenome: sobrenomeUsuario.value.trim(),
      mediaMinima: Number(novaMediaMinima.toFixed(2))
    };

    await setDoc(userRef, payload, { merge: true });
    usuarioNomeInfo.textContent = payload.nome;
    alert("Informações atualizadas com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar dados:", err);
    alert("Não foi possível atualizar os dados.");
  }
});

alterarEmailBtn?.addEventListener("click", () => {
  abrirModalSeguranca("email");
});

alterarSenhaBtn?.addEventListener("click", () => {
  abrirModalSeguranca("senha");
});

cancelarReauthBtn?.addEventListener("click", fecharModalSeguranca);

confirmarReauthBtn?.addEventListener("click", async () => {
  const senha = senhaAtualInput.value;

  if (!senha) {
    alert("Por favor, insira sua senha atual.");
    return;
  }

  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Usuário não autenticado");
      fecharModalSeguranca();
      return;
    }

    await reautenticarUsuario(senha);

    if (acaoSeguranca === "email") {
      const novoEmail = prompt("Digite seu novo email:");
      if (!novoEmail) {
        fecharModalSeguranca();
        return;
      }

      await updateEmail(user, novoEmail);

      const syncEmail = httpsCallable(functions, "syncEmail");
      await syncEmail({ email: novoEmail });

      alert("Email atualizado com sucesso!");
    }

    if (acaoSeguranca === "senha") {
      const novaSenha = prompt("Digite sua nova senha:");
      if (!novaSenha) {
        fecharModalSeguranca();
        return;
      }

      if (novaSenha.length < 6) {
        alert("Senha não pode ser vazia e deve ter pelo menos 6 caracteres.");
        return;
      }

      await updatePassword(user, novaSenha);
      alert("Senha atualizada com sucesso!");
    }

    fecharModalSeguranca();
  } catch (err) {
    console.error(err);

    if (err.code === "auth/wrong-password") {
      alert("Senha incorreta");
    } else if (err.code === "auth/requires-recent-login") {
      alert("Faça login novamente por segurança");
    } else if (err.code === "auth/invalid-email") {
      alert("Email inválido");
    } else if (err.code === "auth/email-already-in-use") {
      alert("Este email já está em uso");
    } else {
      alert(`${err.code || ""} ${err.message || err}`);
    }
  }
});
