// firestore/mediaGlobal.js
import { verificaPremium, isPremium } from "../js/verificaPremium.js";
import { auth, db } from "../firebase/config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const mediaGlobalEl = document.getElementById("mediaGlobal");

// Função para calcular Média Global
export async function calcularMediaGlobal() {
  const user = auth.currentUser;
  if (!user) return;

  const plano = await verificaPremium();

  if (!isPremium(plano)) {
    mediaGlobalEl.textContent = "🔒 Premium";
    return;
  }

  try {
    const mediasRef = collection(db, "usuarios", user.uid, "medias");
    const snap = await getDocs(mediasRef);

    if (snap.empty) {
      mediaGlobalEl.textContent = "-";
      return;
    }

    let soma = 0;
    let total = 0;

    snap.forEach(doc => {
      const data = doc.data();
      if (data.mediaGeral !== undefined && data.mediaGeral !== null) {
        soma += Number(data.mediaGeral);
        total++;
      }
    });

    const mediaGlobal = total > 0 ? (soma / total).toFixed(2) : "-";
    mediaGlobalEl.textContent = mediaGlobal;

  } catch (err) {
    console.error("Erro ao calcular média global:", err);
    mediaGlobalEl.textContent = "-";
  }
}

// 🔹 Atualiza a Média Global sempre que as médias são recalculadas
document.addEventListener("recalcularMedias", () => {
  calcularMediaGlobal();
});

// 🔹 Calcula ao carregar a página, caso usuário já esteja logado
auth.onAuthStateChanged(user => {
  if (user) calcularMediaGlobal();
});
