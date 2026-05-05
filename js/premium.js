// js/premium.js
import { auth, functions } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

const PLANS = {
  "btn-genius-mensal": { plan: "genius", interval: "mensal" },
  "btn-genius-semestral": { plan: "genius", interval: "semestral" },
  "btn-geniusplus-mensal": { plan: "plus", interval: "mensal" },
  "btn-geniusplus-semestral": { plan: "plus", interval: "semestral" },
};


function desativarBotoes() {
  document.querySelectorAll(".btn-plano").forEach(btn => {
    btn.disabled = true;
    btn.classList.add("desativado");
    btn.textContent = "Redirecionando...";
  });
}

function reativarBotoes() {
  document.querySelectorAll(".btn-plano").forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("desativado");
    btn.textContent = btn.dataset.originalText;
  });
}

async function subscribe({ plan, interval }) {
  
  if (!currentUser) {
    alert("Você precisa estar logado");
    return;
  }

  desativarBotoes();

  try {
    const createCheckoutSession = httpsCallable(
      functions,
      "createStripeCheckoutSession"
    );

    const result = await createCheckoutSession({ plan, interval });

    // REDIRECIONAMENTO
    window.location.href = result.data.url;

  } catch (error) {
    console.error("Erro Stripe:", error);
    alert("Não foi possível iniciar o pagamento. Tente novamente.");
    console.error("Erro Stripe:", error);

    reativarBotoes();
  }
}

Object.keys(PLANS).forEach((id) => {
  const btn = document.getElementById(id);
  if (!btn) return;

  btn.dataset.originalText = btn.textContent;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    subscribe(PLANS[id]);
  });
});

// --- Lógica de Flip dos Cards ---

// Mapeamento: ID do botão -> ID do card (pai) que deve virar
const FLIP_MAP = {
  // Botoes de IDA
  "flip-card-free": "card-free",
  "flip-card-genius": "card-genius", // Certifique-se de adicionar id="card-genius" no HTML do plano Genius
  "flip-card-geniusplus": "card-geniusplus", // Certifique-se de adicionar id="card-geniusplus" no HTML do plano Genius+
  
  // Botoes de VOLTA
  "flip-card-free-back": "card-free",
  "flip-card-genius-back": "card-genius",
  "flip-card-geniusplus-back": "card-geniusplus"
};

// Adiciona o evento de clique para cada botão de flip
Object.keys(FLIP_MAP).forEach((btnId) => {
  const btn = document.getElementById(btnId);
  const cardId = FLIP_MAP[btnId];
  const cardElement = document.querySelector(`#${cardId} .card-inner`);

  if (btn && cardElement) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cardElement.classList.toggle("flipped");
    });
  }
});

const INFO_MAP = {
  "info-free": "card-free",
  "info-genius": "card-genius",
  "info-geniusplus": "card-geniusplus"
};

Object.keys(INFO_MAP).forEach((btnId) => {
  const btn = document.getElementById(btnId);
  const cardId = INFO_MAP[btnId];

  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .getElementById(cardId)
        .querySelector(".card-inner")
        .classList.toggle("flipped");
    });
  }
});

const INFO_BACK_MAP = {
  "info-free-back": "card-free",
  "info-genius-back": "card-genius",
  "info-geniusplus-back": "card-geniusplus"
};

Object.keys(INFO_BACK_MAP).forEach((btnId) => {
  const btn = document.getElementById(btnId);
  const cardId = INFO_BACK_MAP[btnId];

  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .getElementById(cardId)
        .querySelector(".card-inner")
        .classList.toggle("flipped");
    });
  }
});