// firestore/salvarNotas.js
import { auth, db } from "../firebase/config.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getSemesterIdForSave } from "./carregarSemestres.js";

// ---------------- ELEMENTOS ----------------
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

  salvarBtn.disabled = true;

  try {
    const semestreId = await getSemesterIdForSave();
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

    alert("Notas e média geral salvas com sucesso.");
  } catch (err) {
    console.error("Erro ao salvar notas:", err);

    if (err.code === "functions/failed-precondition") {
      alert("Esta conta possui mais de um semestre e requer revisão antes de salvar.");
    } else {
      alert(err.message || "Não foi possível salvar as notas.");
    }
  } finally {
    salvarBtn.disabled = false;
  }
}
