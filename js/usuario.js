// js/usuario.js
import { auth, db, functions } from "../firebase/config.js";
import { updateEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

// Cloud Functions
const createPortal = httpsCallable(functions, "createStripeCustomerPortal");
const gerarCupom = httpsCallable(functions, "generateReferralCoupon");

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

// Cupom de indicação
const gerarCupomBtn = document.getElementById("gerarCupomBtn");
const cupomGeradoDiv = document.getElementById("cupomGerado");
const codigoCupomEl = document.getElementById("codigoCupom");
const copiarCupomBtn = document.getElementById("copiarCupomBtn");

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
}

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

  // Preenche os campos
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

  // 🔹 CONTROLE PREMIUM
  if (tipo === "genius" || tipo === "genius_plus") {
    virarPremiumBtn.style.display = "inline-block";
    virarPremiumBtn.textContent = "Gerenciar assinatura";
    virarPremiumBtn.dataset.action = "manage";

    vencimentoEl.textContent = 
      data.premiumVencimento
        ? formatarData(data.premiumVencimento)
        : "Ativo";
  } else {
    virarPremiumBtn.style.display = "inline-block";
    virarPremiumBtn.textContent = "Virar Premium";
    virarPremiumBtn.dataset.action = "premium";

    vencimentoEl.textContent = "Plano gratuito";
  }

  let referralCode = null;

  // 🔹 BUSCA CUPOM DE INDICAÇÃO
  const cupomQuery = query(
    collection(db, "cupons"),
    where("ownerUid", "==", user.uid),
  );

  const cupomSnap = await getDocs(cupomQuery);

  if (!cupomSnap.empty) {
    referralCode = cupomSnap.docs[0].data().code;
  }

  // 🔹 CUPOM DE INDICAÇÃO
  if (referralCode) {
    codigoCupomEl.textContent =  referralCode;
    cupomGeradoDiv.style.display = "block";
    gerarCupomBtn.style.display = "none";
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

// Botão virar premium / gerenciar assinatura
virarPremiumBtn.addEventListener("click", async () => {
  const action = virarPremiumBtn.dataset.action;

  if (action === "premium") {
    window.location.href = "premium.html";
  } else if (action === "manage") {
    try{
      virarPremiumBtn.disabled = true;
      virarPremiumBtn.textContent = "Abrindo gerenciador...";

      const result = await createPortal();
      window.location.href = result.data.url;
    } catch (err) {
      console.error("Erro ao abrir portal:", err);
      alert("Não foi possível abrir o gerenciador de assinatura.");
    } finally {
      virarPremiumBtn.disabled = false;
      virarPremiumBtn.textContent = "Gerenciar assinatura";
    }
  }
});

// Gerar cupom de indicação
if (gerarCupomBtn) {
  gerarCupomBtn.addEventListener("click", async () => {
    gerarCupomBtn.disabled = true;
    gerarCupomBtn.textContent = "Gerando...";

    try {
      const result = await gerarCupom();
      const { code } = result.data;

      codigoCupomEl.textContent = code;
      cupomGeradoDiv.style.display = "block";
      gerarCupomBtn.style.display = "none";
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar o cupom.");
    } finally {
      gerarCupomBtn.disabled = false;
      gerarCupomBtn.textContent = "Gerar cupom";
    }
  });
}
if (copiarCupomBtn) {
  copiarCupomBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(codigoCupomEl.textContent);
    copiarCupomBtn.textContent = "Copiado!";
    setTimeout(() => copiarCupomBtn.textContent = "Copiar", 1500);
  });
}