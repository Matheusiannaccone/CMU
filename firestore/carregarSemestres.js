// firestore/carregarSemestres.js
// ---------------- FIRESTORE (CDN) ----------------
import { verificaPremium, isPremium } from "../js/verificaPremium.js";
import { auth, db } from "../firebase/config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ---------------- ELEMENTOS ----------------
const semestreSelect = document.getElementById("semestreSelect");
const materiasContainer = document.getElementById("materiasContainer");

// CARREGAR SEMESTRES
export async function getSemesters() {
  const user = auth.currentUser;
  if (!user) return [];

  const plano = await verificaPremium();
  if (!isPremium(plano)) return [];

  const semestresRef = collection(db, "usuarios", user.uid, "semestres");
  const q = query(semestresRef, orderBy("nome"));
  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    nome: doc.data().nome
  }));
}

// ADICIONAR SEMESTRE

export async function addSemester(nome) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const plano = await verificaPremium();
  if (!isPremium(plano)) {
    throw new Error("Apenas usuários Premium podem criar semestres.");
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

  await carregarMaterias(semestreId);
});

// CARREGAR MATÉRIAS DO SEMESTRE
async function carregarMaterias(semestreId) {
  const user = auth.currentUser;
  if (!user) return;

  const plano = await verificaPremium();
  if (!isPremium(plano)) {
    materiasContainer.innerHTML = "";
    return;
  }

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
    materiasContainer.innerHTML = "";

    let index = 1;

    snap.forEach(doc => {
      const m = doc.data();

      const div = document.createElement("div");
      div.classList.add("materia", "visible");
      div.id = `materia${index}`;

      div.innerHTML = `
        <h2>Matéria ${index}</h2>

        <div class="materia-nome-container">
          <input type="text"
            name="materia${index}_nome"
            value="${m.nome ?? ""}"
            placeholder="Nome da matéria">
        </div>

        <div class="notas">
          <input type="number" name="materia${index}_nota1" placeholder="AC1" value="${m.ac1 ?? ""}">
          <input type="number" name="materia${index}_nota2" placeholder="AC2" value="${m.ac2 ?? ""}">
          <input type="number" name="materia${index}_nota3" placeholder="AF"  value="${m.af ?? ""}">
          <input type="number" name="materia${index}_nota4" placeholder="AG"  value="${m.ag ?? ""}">
          <input type="number" name="materia${index}_nota5" placeholder="AS"  value="${m.as ?? ""}">
          <input type="text" name="materia${index}_media" class="media" placeholder="Média" readonly>
          <input type="text" name="materia${index}_afNecessaria" class="afNecessaria" placeholder="AF Necessária" readonly aria-label="AF necessária para média 5 da matéria ${index}">
        </div>
      `;

      materiasContainer.appendChild(div);
      index++;
    });

    // 🔹 dispara recálculo das médias (se existir outro script)
    if (typeof window.calcularTudo === "function") {
      calcularTudo();
    }


  } catch (err) {
    console.error("Erro ao carregar matérias:", err);
  }
}

function criarMateriaVazia() {
  materiasContainer.innerHTML = "";

  const div = document.createElement("div");
  div.classList.add("materia", "visible");
  div.id = "materia1";

  div.innerHTML = `
    <h2>Matéria 1</h2>

    <div class="materia-nome-container">
      <input type="text"
        name="materia1_nome"
        placeholder="Nome da matéria">
    </div>

    <div class="notas">
      <input type="number" name="materia1_nota1" placeholder="AC1" min="0" step="0.01">
      <input type="number" name="materia1_nota2" placeholder="AC2" min="0" step="0.01">
      <input type="number" name="materia1_nota3" placeholder="AF"  min="0" step="0.01">
      <input type="number" name="materia1_nota4" placeholder="AG"  min="0" step="0.01">
      <input type="number" name="materia1_nota5" placeholder="AS"  min="0" step="0.01">
      <input type="text" name="materia1_media" class="media" placeholder="Média" readonly>
      <input type="text" name="materia1_afNecessaria" class="afNecessaria" placeholder="AF Necessária" readonly aria-label="AF necessária para média 5 da matéria 1">
    </div>
  `;

  materiasContainer.appendChild(div);

  if (typeof window.calcularTudo === "function") {
    window.calcularTudo();
  }
}
