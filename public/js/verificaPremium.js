// js/verificaPremium.js
import { auth, db } from "../firebase/config.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Cache em memória do plano do usuário
let planoCache = null;

/* Retorna o plano do usuário:
 * "padrao" | "genius" | "genius_plus" */
export async function verificaPremium() {
  // ⚡ Retorno imediato se já estiver em cache
  if (planoCache) return planoCache;

  const user = auth.currentUser;

  // Não logado = padrão
  if (!user) {
    planoCache = "padrao";
    return planoCache;
  }

  try {
    const userRef = doc(db, "usuarios", user.uid);
    const snap = await getDoc(userRef);

    planoCache = snap.exists()
      ? snap.data().tipoUsuario ?? "padrao"
      : "padrao";

    return planoCache;

  } catch (error) {
    console.error("Erro ao verificar plano:", error);
    planoCache = "padrao";
    return planoCache;
  }
}

/* Helper para verificar se o plano é Premium */
export function isPremium(plano) {
  return plano === "genius" || plano === "genius_plus";
}

// 🔁 Limpa o cache sempre que o usuário logar/deslogar
auth.onAuthStateChanged(() => {
  planoCache = null;
});
