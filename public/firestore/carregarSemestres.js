// firestore/carregarSemestres.js
// ---------------- FIRESTORE (CDN) ----------------
import { auth, db, functions } from "../firebase/config.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getIdTokenResult } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";
import { createMateriaElement } from "../js/materiaForm.js";


// ---------------- ELEMENTOS ----------------
const semestreSelect = document.getElementById("semestreSelect");
const materiasContainer = document.getElementById("materiasContainer");
const resolveSingleSemester = httpsCallable(functions, "resolveSingleSemester");

let activeSingleSemester = null;

export async function hasMultiSemesterAccess(
  user = auth.currentUser,
  forceRefresh = false
) {
  if (!user) return false;

  const tokenResult = await getIdTokenResult(user, forceRefresh);
  return tokenResult.claims.multiSemester === true;
}

async function resolveUserSingleSemester(createIfMissing) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const result = await resolveSingleSemester({ createIfMissing });
  const semesterId = result.data?.semesterId ?? null;

  activeSingleSemester = semesterId
    ? { uid: user.uid, semesterId }
    : null;

  return semesterId;
}

export async function initializeSingleSemester() {
  const semesterId = await resolveUserSingleSemester(false);

  if (semesterId) {
    await carregarMaterias(semesterId);
  }

  return semesterId;
}

export async function getSemesterIdForSave() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  if (await hasMultiSemesterAccess(user)) {
    const semesterId = semestreSelect?.value;

    if (!semesterId || semesterId === "add") {
      throw new Error("Selecione um semestre válido.");
    }

    return semesterId;
  }

  if (activeSingleSemester?.uid === user.uid) {
    return activeSingleSemester.semesterId;
  }

  return resolveUserSingleSemester(true);
}

// CARREGAR SEMESTRES
export async function getSemesters() {
  const user = auth.currentUser;
  if (!user) return [];

  if (!await hasMultiSemesterAccess(user)) {
    throw new Error("Conta sem autorização para múltiplos semestres.");
  }

  const semestresRef = collection(db, "usuarios", user.uid, "semestres");
  const snap = await getDocs(semestresRef);

  return snap.docs.map(doc => ({
    id: doc.id,
    nome: doc.data().nome ?? "Semestre sem nome"
  })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

// ADICIONAR SEMESTRE

export async function addSemester(nome) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  if (!await hasMultiSemesterAccess(user)) {
    throw new Error("Conta sem autorização para múltiplos semestres.");
  }

  const ref = collection(db, "usuarios", user.uid, "semestres");

  const docRef = await addDoc(ref, {
    nome,
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

// TROCAR SEMESTRE
semestreSelect?.addEventListener("change", async () => {
  const semestreId = semestreSelect.value;
  if (!semestreId || semestreId === "add") return;

  if (!await hasMultiSemesterAccess()) return;

  await carregarMaterias(semestreId);
});

// CARREGAR MATÉRIAS DO SEMESTRE
export async function carregarMaterias(semestreId) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const materiasRef = collection(
      db,
      "usuarios",
      user.uid,
      "semestres",
      semestreId,
      "materias"
    );

    const snap = await getDocs(materiasRef);

    // 🔹 se não existir nada salvo, ignora
    if (snap.empty) {
      criarMateriaVazia();
      return;
    }

    // limpa matérias atuais
    materiasContainer.replaceChildren();

    let index = 1;

    snap.forEach(doc => {
      const m = doc.data();

      const div = createMateriaElement(index, m);

      materiasContainer.appendChild(div);
      index++;
    });

    // 🔹 dispara recálculo das médias (se existir outro script)
    if (typeof window.calcularTudo === "function") {
      window.calcularTudo();
    }


  } catch (err) {
    console.error("Erro ao carregar matérias:", err);
  }
}

function criarMateriaVazia() {
  materiasContainer.replaceChildren();

  const div = createMateriaElement(1);

  materiasContainer.appendChild(div);

  if (typeof window.calcularTudo === "function") {
    window.calcularTudo();
  }
}
