// js/login.js
import { auth } from "../firebase/config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    message.textContent = "Preencha todos os campos.";
    message.style.color = "red";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    message.textContent = "Login realizado com sucesso!";
    message.style.color = "green";

    setTimeout(() => {
      window.location.href = "index.html"; // redirecionar
    }, 1000);

  } catch (error) {
    message.textContent = error.message;
    message.style.color = "red";
  }
});
