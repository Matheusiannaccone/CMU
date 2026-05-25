// js/usuario.js
import { auth, db, functions } from "../firebase/config.js";
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

// Cloud Functions
const createPortal = httpsCallable(functions, "createStripeCustomerPortal");
const gerarCupom = httpsCallable(functions, "generateReferralCoupon");

// Elementos
const virarPremiumBtn = document.getElementById("virarPremiumBtn");
const vencimentoEl = document.getElementById("premiumVencimento");
const mediaMinimaContainer = document.getElementById("mediaMinimaContainer");

const usuarioNomeSpan = document.getElementById("usuarioNome");
const usuarioNomeInfo = document.getElementById("usuarioNomeInfo");
const nomeUsuario = document.getElementById("nomeUsuario");
const sobrenomeUsuario = document.getElementById("sobrenomeUsuario");

const cursoUsuario = document.getElementById("cursoUsuario");
const tipoUsuario = document.getElementById("tipoUsuario");
const mediaMinima = document.getElementById("mediaMinima");
const logoutBtn = document.getElementById("logoutBtn");
const userForm = document.getElementById("userForm");

// Beta Features Elements
const betaFeaturesSection = document.getElementById("betaFeaturesSection");

// CALCULAR AF
const betaCompactHeaderAF = document.getElementById("betaCompactHeaderAF");
const betaExpandedContentAF = document.getElementById("betaExpandedContentAF");
const expandBetaBtnAF = document.getElementById("expandBetaBtnAF");
const compactRatingAF = document.getElementById("compactRatingAF");
const infoBetaBtnAF = document.getElementById("infoBetaBtnAF");
const infoBetaContentAF = document.getElementById("infoBetaContentAF");
const afRatingStars = document.querySelectorAll("#afRatingStars .star");
const toggleFeedbackAF = document.getElementById("toggleFeedbackAF");
const betaFeedbackBoxAF = document.getElementById("betaFeedbackBoxAF");
const afFeedbackTextarea = document.getElementById("afFeedback");
const submitAfFeedbackBtn = document.getElementById("submitAfFeedback");

// TEMAS
const betaCompactHeaderTheme = document.getElementById("betaCompactHeaderTheme");
const betaExpandedContentTheme = document.getElementById("betaExpandedContentTheme");
const expandBetaBtnTheme = document.getElementById("expandBetaBtnTheme");
const compactRatingTheme = document.getElementById("compactRatingTheme");
const infoBetaBtnTheme = document.getElementById("infoBetaBtnTheme");
const infoBetaContentTheme = document.getElementById("infoBetaContentTheme");
const themeRatingStars = document.querySelectorAll("#themeRatingStars .star");
const toggleFeedbackTheme = document.getElementById("toggleFeedbackTheme");
const betaFeedbackBoxTheme = document.getElementById("betaFeedbackBoxTheme");
const themeFeedbackTextarea = document.getElementById("themeFeedback");
const submitThemeFeedbackBtn = document.getElementById("submitThemeFeedback");

// Tema
const themeCustomizerSection = document.getElementById("themeCustomizerSection");

// Beta Features State
let selectedRatingAF = 0;
let selectedRatingTheme = 0;
let previousBetaFeedbackAF = null;
let previousBetaFeedbackTheme = null;

// Botões de segurança
const alterarEmailBtn = document.getElementById("alterarEmailBtn");
const alterarSenhaBtn = document.getElementById("alterarSenhaBtn");

const reauthModal = document.getElementById("reauthModal");
const senhaAtualInput = document.getElementById("senhaAtual");
const confirmarReauthBtn = document.getElementById("confirmarReauthBtn");
const cancelarReauthBtn = document.getElementById("cancelarReauthBtn");

let acaoSeguranca = null; // "email" ou "senha"

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

function abrilModalSeguranca(acao) {
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

// Função para carregar feedback anterior do usuário
async function loadPreviousBetaFeedback(user) {
  try {
    // Carregar feedback do Calcular AF
    const feedbackRefAF = collection(db, "betaFeedback");
    const qAF = query(feedbackRefAF, where("userId", "==", user.uid), where("feature", "==", "calcularAF"));
    const feedbackSnapAF = await getDocs(qAF);

    if (!feedbackSnapAF.empty) {
      previousBetaFeedbackAF = feedbackSnapAF.docs[0].data();
      renderBetaCompactHeaderAF();
    } else {
      betaCompactHeaderAF.style.display = "none";
      betaExpandedContentAF.style.display = "flex";
    }

    // Carregar feedback de Temas
    const feedbackRefTheme = collection(db, "betaFeedback");
    const qTheme = query(feedbackRefTheme, where("userId", "==", user.uid), where("feature", "==", "themes"));
    const feedbackSnapTheme = await getDocs(qTheme);

    if (!feedbackSnapTheme.empty) {
      previousBetaFeedbackTheme = feedbackSnapTheme.docs[0].data();
      renderBetaCompactHeaderTheme();
    } else {
      betaCompactHeaderTheme.style.display = "none";
      betaExpandedContentTheme.style.display = "flex";
    }
  } catch (err) {
    console.error("Erro ao carregar feedback anterior:", err);
    betaExpandedContentAF.style.display = "flex";
    betaExpandedContentTheme.style.display = "flex";
  }
}

function renderBetaCompactHeaderAF() {
  if (!previousBetaFeedbackAF) return;

  const rating = previousBetaFeedbackAF.rating;
  const stars = "⭐".repeat(Math.floor(rating)) + (rating % 1 !== 0 ? "✨" : "");

  compactRatingAF.textContent = stars;
  betaCompactHeaderAF.style.display = "flex";
  betaExpandedContentAF.style.display = "none";
}

function renderBetaCompactHeaderTheme() {
  if (!previousBetaFeedbackTheme) return;

  const rating = previousBetaFeedbackTheme.rating;
  const stars = "⭐".repeat(Math.floor(rating)) + (rating % 1 !== 0 ? "✨" : "");

  compactRatingTheme.textContent = stars;
  betaCompactHeaderTheme.style.display = "flex";
  betaExpandedContentTheme.style.display = "none";
}

function expandBetaFeatureAF() {
  betaCompactHeaderAF.style.display = "none";
  betaExpandedContentAF.style.display = "flex";

  if (previousBetaFeedbackAF) {
    selectedRatingAF = previousBetaFeedbackAF.rating;
    afFeedbackTextarea.value = previousBetaFeedbackAF.feedback || "";
    updateStarDisplayAF();

    const charCountEl = document.getElementById("charCountAF");
    if (charCountEl) {
      charCountEl.textContent = afFeedbackTextarea.value.length;
    }

    toggleFeedbackAF.checked = previousBetaFeedbackAF.feedback ? true : false;
    betaFeedbackBoxAF.style.display = toggleFeedbackAF.checked ? "flex" : "none";
  }
}

function expandBetaFeatureTheme() {
  betaCompactHeaderTheme.style.display = "none";
  betaExpandedContentTheme.style.display = "flex";

  if (previousBetaFeedbackTheme) {
    selectedRatingTheme = previousBetaFeedbackTheme.rating;
    themeFeedbackTextarea.value = previousBetaFeedbackTheme.feedback || "";
    updateStarDisplayTheme();

    const charCountEl = document.getElementById("charCountTheme");
    if (charCountEl) {
      charCountEl.textContent = themeFeedbackTextarea.value.length;
    }

    toggleFeedbackTheme.checked = previousBetaFeedbackTheme.feedback ? true : false;
    betaFeedbackBoxTheme.style.display = toggleFeedbackTheme.checked ? "flex" : "none";
  }
}

// Função para carregar dados
async function carregarDadosUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();

  // Preenche os campos
  usuarioNomeInfo.textContent = data.nome ?? "";
  nomeUsuario.value = data.nome ?? "";
  sobrenomeUsuario.value = data.sobrenome ?? "";
  cursoUsuario.value = data.curso
    ? CURSOS[data.curso]?? "Curso não definido"
    : "Curso não definido";
  mediaMinima.value = data.mediaMinima ?? "5";

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

    if (tipo === "genius_plus") {
      betaFeaturesSection.style.display = "block";
      await loadPreviousBetaFeedback(user);
      mediaMinimaContainer.style.display = "block";
      themeCustomizerSection.style.display = "block";
    } else {
      betaFeaturesSection.style.display = "none";
      mediaMinimaContainer.style.display = "none";
      themeCustomizerSection.style.display = "none";
    }
  } else {
    virarPremiumBtn.style.display = "inline-block";
    virarPremiumBtn.textContent = "Virar Premium";
    virarPremiumBtn.dataset.action = "premium";

    vencimentoEl.textContent = "Plano gratuito";
    betaFeaturesSection.style.display = "none";
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

  const tipo = tipoUsuario.value;

  if (!nomeUsuario.value.trim() || !sobrenomeUsuario.value.trim() || !cursoUsuario.value.trim()) {
    alert("Nome, sobrenome e curso são obrigatórios!");
    return;
  }

  if (tipo === "genius_plus") {
    if (!mediaMinima.value.trim()) {
      alert("Informe a média mínima");
      return;
    }

    const novoValor = parseFloat(mediaMinima.value);
    if (novoValor < 4.76) {
      alert("A média mínima não pode ser menor que 4.76");
      return;
    }
  }

  try {
    const userRef = doc(db, "usuarios", user.uid);

    const payload = {
      nome: nomeUsuario.value.trim(),
      sobrenome: sobrenomeUsuario.value.trim()
    };

    if (tipoUsuario.value === "genius_plus") {
      payload.mediaMinima = Number(parseFloat(mediaMinima.value).toFixed(2));
    }

    await setDoc(userRef, payload, { merge: true});

    usuarioNomeInfo.textContent = payload.nome;

    alert("Informações atualizadas com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar dados:", err);
    alert("Não foi possível atualizar os dados.");
  }
});

if (alterarEmailBtn) {
  alterarEmailBtn.addEventListener("click", () => {
    abrilModalSeguranca("email");
  });
}

if (alterarSenhaBtn) {
  alterarSenhaBtn.addEventListener("click", () => {
    abrilModalSeguranca("senha");
  });
}


if (cancelarReauthBtn) {
  cancelarReauthBtn.addEventListener("click", () => {
    fecharModalSeguranca();
  });
}

if (confirmarReauthBtn) {
  confirmarReauthBtn.addEventListener("click", async () => {
    const senha = senhaAtualInput.value;

    if(!senha) {
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
        console.error("ERRO:", err);
        alert(`${err.code || ""} ${err.message || err}`);
      }
    }
  });
}

// Botão virar premium / gerenciar assinatura
if (virarPremiumBtn) {
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
}

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

// ========== BETA FEATURES RATING ==========
// Toggle info buttons
if (infoBetaBtnAF) {
  infoBetaBtnAF.addEventListener("click", () => {
    if (infoBetaContentAF.style.display === "none") {
      infoBetaContentAF.style.display = "block";
    } else {
      infoBetaContentAF.style.display = "none";
    }
  });
}

if (infoBetaBtnTheme) {
  infoBetaBtnTheme.addEventListener("click", () => {
    if (infoBetaContentTheme.style.display === "none") {
      infoBetaContentTheme.style.display = "block";
    } else {
      infoBetaContentTheme.style.display = "none";
    }
  });
}

// Expand buttons
if (expandBetaBtnAF) {
  expandBetaBtnAF.addEventListener("click", expandBetaFeatureAF);
}

if (expandBetaBtnTheme) {
  expandBetaBtnTheme.addEventListener("click", expandBetaFeatureTheme);
}

// Rating stars for AF
afRatingStars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedRatingAF = parseInt(star.dataset.value);
    updateStarDisplayAF();
  });

  star.addEventListener("mouseover", () => {
    const hoverValue = parseInt(star.dataset.value);
    afRatingStars.forEach((s) => {
      const starValue = parseInt(s.dataset.value);
      s.style.opacity = starValue <= hoverValue ? "1" : "0.3";
    });
  });
});

document.getElementById("afRatingStars").addEventListener("mouseleave", updateStarDisplayAF);

// Rating stars for Theme
themeRatingStars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedRatingTheme = parseInt(star.dataset.value);
    updateStarDisplayTheme();
  });

  star.addEventListener("mouseover", () => {
    const hoverValue = parseInt(star.dataset.value);
    themeRatingStars.forEach((s) => {
      const starValue = parseInt(s.dataset.value);
      s.style.opacity = starValue <= hoverValue ? "1" : "0.3";
    });
  });
});

document.getElementById("themeRatingStars").addEventListener("mouseleave", updateStarDisplayTheme);

function updateStarDisplayAF() {
  afRatingStars.forEach((star) => {
    const starValue = parseInt(star.dataset.value);
    if (starValue <= selectedRatingAF) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function updateStarDisplayTheme() {
  themeRatingStars.forEach((star) => {
    const starValue = parseInt(star.dataset.value);
    if (starValue <= selectedRatingTheme) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

// Toggle feedback boxes
if (toggleFeedbackAF) {
  toggleFeedbackAF.addEventListener("change", () => {
    betaFeedbackBoxAF.style.display = toggleFeedbackAF.checked ? "flex" : "none";
  });
}

if (toggleFeedbackTheme) {
  toggleFeedbackTheme.addEventListener("change", () => {
    betaFeedbackBoxTheme.style.display = toggleFeedbackTheme.checked ? "flex" : "none";
  });
}

// Character counters
const charCountAFEl = document.getElementById("charCountAF");
if (afFeedbackTextarea && charCountAFEl) {
  afFeedbackTextarea.addEventListener("input", () => {
    charCountAFEl.textContent = afFeedbackTextarea.value.length;
  });
}

const charCountThemeEl = document.getElementById("charCountTheme");
if (themeFeedbackTextarea && charCountThemeEl) {
  themeFeedbackTextarea.addEventListener("input", () => {
    charCountThemeEl.textContent = themeFeedbackTextarea.value.length;
  });
}

if (submitAfFeedbackBtn) {
  submitAfFeedbackBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    if (selectedRatingAF === 0) {
      alert("Por favor, selecione uma avaliação.");
      return;
    }

    submitAfFeedbackBtn.disabled = true;
    submitAfFeedbackBtn.textContent = "Enviando...";

    try {
      const feedbackRef = collection(db, "betaFeedback");
      const feedbackDoc = {
        userId: user.uid,
        feature: "calcularAF",
        rating: selectedRatingAF,
        feedback: afFeedbackTextarea.value.trim(),
        timestamp: new Date(),
      };

      const docRef = await getDocs(
        query(feedbackRef, where("userId", "==", user.uid), where("feature", "==", "calcularAF"))
      );

      if (!docRef.empty) {
        const existingDocId = docRef.docs[0].id;
        const docToUpdate = doc(db, "betaFeedback", existingDocId);
        await setDoc(docToUpdate, feedbackDoc, { merge: true });
      } else {
        const newDocRef = doc(collection(db, "betaFeedback"));
        await setDoc(newDocRef, feedbackDoc);
      }

      alert("Obrigado pela avaliação!");

      previousBetaFeedbackAF = {
        rating: selectedRatingAF,
        feedback: afFeedbackTextarea.value.trim()
      };

      selectedRatingAF = 0;
      afFeedbackTextarea.value = "";
      toggleFeedbackAF.checked = false;
      betaFeedbackBoxAF.style.display = "none";
      updateStarDisplayAF();

      renderBetaCompactHeaderAF();
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      alert("Não foi possível enviar sua avaliação.");
    } finally {
      submitAfFeedbackBtn.disabled = false;
      submitAfFeedbackBtn.textContent = "Enviar";
    }
  });
}

if (submitThemeFeedbackBtn) {
  submitThemeFeedbackBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    if (selectedRatingTheme === 0) {
      alert("Por favor, selecione uma avaliação.");
      return;
    }

    submitThemeFeedbackBtn.disabled = true;
    submitThemeFeedbackBtn.textContent = "Enviando...";

    try {
      const feedbackRef = collection(db, "betaFeedback");
      const feedbackDoc = {
        userId: user.uid,
        feature: "themes",
        rating: selectedRatingTheme,
        feedback: themeFeedbackTextarea.value.trim(),
        timestamp: new Date(),
      };

      const docRef = await getDocs(
        query(feedbackRef, where("userId", "==", user.uid), where("feature", "==", "themes"))
      );

      if (!docRef.empty) {
        const existingDocId = docRef.docs[0].id;
        const docToUpdate = doc(db, "betaFeedback", existingDocId);
        await setDoc(docToUpdate, feedbackDoc, { merge: true });
      } else {
        const newDocRef = doc(collection(db, "betaFeedback"));
        await setDoc(newDocRef, feedbackDoc);
      }

      alert("Obrigado pela avaliação!");

      previousBetaFeedbackTheme = {
        rating: selectedRatingTheme,
        feedback: themeFeedbackTextarea.value.trim()
      };

      selectedRatingTheme = 0;
      themeFeedbackTextarea.value = "";
      toggleFeedbackTheme.checked = false;
      betaFeedbackBoxTheme.style.display = "none";
      updateStarDisplayTheme();

      renderBetaCompactHeaderTheme();
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      alert("Não foi possível enviar sua avaliação.");
    } finally {
      submitThemeFeedbackBtn.disabled = false;
      submitThemeFeedbackBtn.textContent = "Enviar";
    }
  });
}