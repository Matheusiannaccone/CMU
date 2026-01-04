// js/cadastro.js
import { auth, db, functions } from "../firebase/config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

const registerBtn = document.getElementById("registerBtn");
const msg = document.getElementById("cadastroMessage");

const SITE_KEY = "6Lc0Vz8sAAAAAOUH3njQ74YzthLcezzX1K_y4gi8";

registerBtn.addEventListener("click", async () => {

  const nome = document.getElementById("nome").value.trim();
  const sobrenome = document.getElementById("sobrenome").value.trim();
  const nasc = document.getElementById("nascimento").value;
  const curso = document.getElementById("curso").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !sobrenome || !nasc || !curso || !email || !senha) {
    msg.textContent = "Preencha todos os campos.";
    msg.style.color = "red";
    return;
  }

  registerBtn.disable = true;

  try {
    const token = await grecaptcha.execute(SITE_KEY, { 
      action: 'signup'
    }); 

    const verifyRecaptcha = httpsCallable(functions, 'verifyRecaptcha');

    await verifyRecaptcha({ token, action: 'signup' });
  
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nome,
      sobrenome,
      nascimento: nasc,
      curso,
      email,
      tipoUsuario: "padrao",
      criado: new Date()
    });

    msg.textContent = "Cadastro realizado com sucesso!";
    msg.style.color = "green";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (error) {
    msg.textContent = error.message;
    msg.style.color = "red";
  } finally {
    registerBtn.disable = false;
  }
});
