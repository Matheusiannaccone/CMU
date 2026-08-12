// firestore/salvarNotas.js
import { verificaPremium, isPremium } from "../js/verificaPremium.js";
import { auth, db } from "../firebase/config.js";
import {
  collection,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ---------------- ELEMENTOS ----------------
const semestreSelect = document.getElementById("semestreSelect");
const materiasContainer = document.getElementById("materiasContainer");
const mediaGeralEl = document.getElementById("mediaGeral");
const salvarBtn = document.getElementById("salvarNotasBtn");

// ---------------- EVENTO ----------------
if (salvarBtn) {
  salvarBtn.addEventListener("click", salvarNotas);
}

// ---------------- FUNÇÃO PRINCIPAL ----------------
async function salvarNotas() {
  const user = auth.currentUser;
  if (!user) {
    alert("Você precisa estar logado para salvar.");
    return;
  }

  const plano = await verificaPremium();
  if (!isPremium(plano)) {
    alert("🔒 Apenas usuários Premium podem salvar dados.");
    return;
  }

  const semestreId = semestreSelect.value;
  if (!semestreId || semestreId === "add") {
    alert("Selecione um semestre válido.");
    return;
  }

  const materias = materiasContainer.querySelectorAll(".materia");

  // ---------- SALVAR MATÉRIAS ----------
  for (let i = 0; i < materias.length; i++) {
    const index = i + 1;
    const materia = materias[i];

    const nome =
      materia.querySelector(`input[name="materia${index}_nome"]`)?.value || "";

    const getNota = (n) => {
      const v = materia.querySelector(
        `input[name="materia${index}_nota${n}"]`
      )?.value;
      return v === "" ? null : Number(v);
    };

    const materiaRef = doc(
      db,
      "usuarios",
      user.uid,
      "semestres",
      semestreId,
      "materias",
      `materia${index}`
    );

    await setDoc(materiaRef, {
      nome,
      ac1: getNota(1),
      ac2: getNota(2),
      af: getNota(3),
      ag: getNota(4),
      as: getNota(5),
    });
  }

  // ---------- SALVAR MÉDIA GERAL ----------
  const mediaGeral = mediaGeralEl.textContent;

  if (mediaGeral && mediaGeral !== "-") {
    const mediaRef = doc(
      db,
      "usuarios",
      user.uid,
      "medias",
      semestreId
    );

    await setDoc(mediaRef, {
      semestre: semestreId,
      mediaGeral: Number(mediaGeral)
    });
  }

  document.dispatchEvent(new Event("recalcularMedias"));

  alert("Notas e média geral salvas com sucesso.");
}
