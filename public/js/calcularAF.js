// js/calcularAF.js
import { auth, db } from "../firebase/config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let mediaMetaUsuario = 5;

export function calcularAFNecessaria(
    ac1,
    ac2,
    ag,
    mediaMetaUsuario
) {
    if (ac1 == null || ac2 == null) return null;
    
    const parcial =
    (ac1 * 0.15) +
    (ac2 * 0.30) +
    (ag * 0.10);
    
    const afNecessaria =
        (mediaMetaUsuario - parcial) / 0.45;
    
    if (afNecessaria <= 0) return 0;
    if (afNecessaria > 10) return "Impossível";
    
    return afNecessaria.toFixed(2);
}

async function carregarMediaMetaUsuario() {
  const user = auth.currentUser;
  if (!user) {
    mediaMetaUsuario = 5; 
    return;
  }

  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    mediaMetaUsuario = userData.mediaMinima ?? 5;
  }
}

function getNota(container, name) {
  const v = container.querySelector(`input[name="${name}"]`)?.value;
  if (v === "" || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export async function calcularAF() {
  await carregarMediaMetaUsuario();

  const materias =
    document.querySelectorAll(".materia");

  materias.forEach((materia, index) => {
    const i = index + 1;

    const ac1 = getNota(
      materia,
      `materia${i}_nota1`
    );

    const ac2 = getNota(
      materia,
      `materia${i}_nota2`
    );

    const ag = getNota(
      materia,
      `materia${i}_nota4`
    );
    
    const resultado =
    calcularAFNecessaria(
        ac1,
        ac2,
        ag,
        mediaMetaUsuario
    );
    
    const afInput =
      materia.querySelector(
        `input[name="materia${i}_afNecessaria"]`
      );

    if(afInput) {
        afInput.value =
            resultado ?? "";
    }
  });
}