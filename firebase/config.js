// firebase/config.js
// Importa módulos principais do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  connectAuthEmulator 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { 
  getFirestore, 
  connectFirestoreEmulator 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import {
  getFunctions,
  connectFunctionsEmulator
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app-check.js";

// 🔹 Configuração do Firebase
 const firebaseConfig = {
  apiKey: "AIzaSyA3TGpzwNjAz7f3NhBOll8e5gxzPbaM1FM",
  authDomain: "calculadora-medias.firebaseapp.com",
  projectId: "calculadora-medias",
  storageBucket: "calculadora-medias.firebasestorage.app",
  messagingSenderId: "800453103423",
  appId: "1:800453103423:web:ba5921cdc7aaa9413e0d8a",
  measurementId: "G-T8E85KH615",
};

// 🔹 Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "us-central1");
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Lc0Vz8sAAAAAOUH3njQ74YzthLcezzX1K_y4gi8'),
  isTokenAutoRefreshEnabled: true
});

// 🔹 Conecta aos emuladores se estiver em localhost
const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";


if (isLocalhost) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

// 🔹 Exporta tudo para ser usado em outros arquivos
export { app, auth, db, functions };