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

// 🔹 Conecta aos emuladores se estiver em localhost
if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}

// 🔹 Exporta tudo para ser usado em outros arquivos
export { app, auth, db };