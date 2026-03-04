// js/premium.js
import { auth, functions } from "../firebase/config.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

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
  const user = auth.currentUser;
  if (!user) {
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
