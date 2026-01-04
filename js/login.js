// js/login.js
import { auth } from "../firebase/config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

const SITE_KEY = "6Lc0Vz8sAAAAAOUH3njQ74YzthLcezzX1K_y4gi8";

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    message.textContent = "Preencha todos os campos.";
    message.style.color = "red";
    return;
  }

  loginBtn.disabled = true;

  try {
    const token = await grecaptcha.execute(SITE_KEY, { 
      action: 'login'
    });

    const verifyRecaptcha = httpsCallable(functions, 'verifyRecaptcha');

    await verifyRecaptcha({ token, action: 'login' });

    await signInWithEmailAndPassword(auth, email, password);
    message.textContent = "Login realizado com sucesso!";
    message.style.color = "green";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    message.textContent = error.message;
    message.style.color = "red";
  } finally {
    loginBtn.disabled = false;
  }
});
