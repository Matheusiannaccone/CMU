import { auth, db } from "../firebase/config.js";
import { 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const registerBtn = document.getElementById("registerBtn");
const msg = document.getElementById("cadastroMessage");

registerBtn.addEventListener("click", async () => {

  const nome = document.getElementById("nome").value.trim();
  const sobrenome = document.getElementById("sobrenome").value.trim();
  const nasc = document.getElementById("nascimento").value;
  const curso = document.getElementById("curso").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nome,
      sobrenome,
      nascimento: nasc,
      curso,
      email,
      tipo: "padrao",
    });

    msg.textContent = "Cadastro realizado com sucesso!";
    msg.style.color = "green";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (error) {
    msg.textContent = error.message;
    msg.style.color = "red";
  }
});
