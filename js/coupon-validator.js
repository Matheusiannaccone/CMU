import { auth, functions } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

const validateCouponFn = httpsCallable(functions, "validateCoupon");

const couponInput = document.getElementById("couponInput");
const validateBtn = document.getElementById("validateBtn");
const messageArea = document.getElementById("messageArea");
const loading = document.getElementById("loading");

let currentUser = null;

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
});

// Limpar mensagens ao começar a digitar
couponInput.addEventListener("input", () => {
  messageArea.innerHTML = "";
  messageArea.className = "";
});

// Enter key para validar
couponInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    validateCoupon();
  }
});

// Validar cupom
validateBtn.addEventListener("click", validateCoupon);

async function validateCoupon() {
  const couponCode = couponInput.value.trim().toUpperCase();

  if (!couponCode) {
    showError("Digite um código de cupom");
    return;
  }

  if (couponCode.length < 2) {
    showError("Código muito curto");
    return;
  }

  if (!currentUser) {
    showError("Você precisa estar autenticado");
    window.location.href = "login.html";
    return;
  }

  // Desabilitar botão e mostrar loading
  validateBtn.disabled = true;
  loading.classList.add("active");
  messageArea.className = "";

  try {
    const result = await validateCouponFn({ couponCode });

    if (result.data.valid) {
      showSuccess(`✓ Cupom validado com sucesso! (${result.data.type})`);

      // Redirecionar para premium após 1.5 segundos
      setTimeout(() => {
        window.location.href = "premium.html";
      }, 1500);
    } else {
      showError(result.data.error || "Cupom inválido");
    }
  } catch (error) {
    console.error("Erro ao validar cupom:", error);

    // Extrair mensagem de erro
    let errorMsg = "Erro ao validar cupom";
    if (error.message) {
      errorMsg = error.message;
    }

    showError(errorMsg);
  } finally {
    validateBtn.disabled = false;
    loading.classList.remove("active");
  }
}

function showSuccess(message) {
  messageArea.className = "success";
  messageArea.innerHTML = `<strong>✓ Sucesso!</strong><p>${message}</p>`;
}

function showError(message) {
  messageArea.className = "error";
  messageArea.innerHTML = `<strong>✗ Erro</strong><p>${message}</p>`;
}
