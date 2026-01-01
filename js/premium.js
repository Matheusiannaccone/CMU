import { auth, functions } from "../firebase/config.js";
import {
  httpsCallable
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

const PLANS = {
  "btn-genius-mensal": "price_1SkZQb02lWLdmet21MpNcJaQ",
  "btn-genius-semestral": "price_1SkZRK02lWLdmet2uTlpWEOc",
  "btn-geniusplus-mensal": "price_1SkZSv02lWLdmet2A7ll5FSP",
  "btn-geniusplus-semestral": "price_1SkZSv02lWLdmet2Ienf8R3j",
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

async function subscribe(priceId) {
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

    const result = await createCheckoutSession({ priceId });

    // REDIRECIONAMENTO
    window.location.href = result.data.url;

  } catch (error) {
    console.error("Erro Stripe:", error);
    alert(error.message || "Erro ao iniciar pagamento");

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
