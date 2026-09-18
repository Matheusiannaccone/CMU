// firestore/salvarNotas.js
import { auth, db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getSemesterIdForSave } from "./carregarSemestres.js";
import {
  MateriaValidationError,
  validateMateriaElement
} from "../js/materiaForm.js";

// ---------------- ELEMENTOS ----------------
const materiasContainer = document.getElementById("materiasContainer");
const mediaGeralEl = document.getElementById("mediaGeral");
const salvarBtn = document.getElementById("salvarNotasBtn");
const DELETE_BATCH_SIZE = 450;

export function getStaleMateriaIds(existingIds, currentIds) {
  const currentIdSet = new Set(currentIds);
  return existingIds.filter(id => !currentIdSet.has(id));
}

async function deleteStaleMaterias(materiasRef, currentIds) {
  const existingSnap = await getDocs(materiasRef);
  const staleIds = new Set(getStaleMateriaIds(
    existingSnap.docs.map(docSnap => docSnap.id),
    currentIds
  ));
  const staleDocs = existingSnap.docs.filter(docSnap => staleIds.has(docSnap.id));

  for (let start = 0; start < staleDocs.length; start += DELETE_BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = staleDocs.slice(start, start + DELETE_BATCH_SIZE);

    chunk.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }
}

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

  try {
    const materias = materiasContainer.querySelectorAll(".materia");
    const materiasValidadas = Array.from(materias, (materia, position) => ({
      materia,
      index: position + 1,
      data: validateMateriaElement(materia, position + 1),
    }));

    salvarBtn.disabled = true;

    const semestreId = await getSemesterIdForSave();
    const materiasRef = collection(
      db,
      "usuarios",
      user.uid,
      "semestres",
      semestreId,
      "materias"
    );
    const currentMateriaIds = [];

    // ---------- SALVAR MATÉRIAS ----------
    for (const { index, data } of materiasValidadas) {
      const materiaId = `materia${index}`;

      currentMateriaIds.push(materiaId);

      const materiaRef = doc(
        db,
        "usuarios",
        user.uid,
        "semestres",
        semestreId,
        "materias",
        materiaId
      );

      await setDoc(materiaRef, data);
    }

    await deleteStaleMaterias(materiasRef, currentMateriaIds);

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

    if (err instanceof MateriaValidationError) {
      alert(err.message);
    } else if (err.code === "functions/failed-precondition") {
      alert("Esta conta possui mais de um semestre e requer revisão antes de salvar.");
    } else {
      alert(err.message || "Não foi possível salvar as notas.");
    }
  } finally {
    salvarBtn.disabled = false;
  }
}
