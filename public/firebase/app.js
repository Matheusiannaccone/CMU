import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3TGpzwNjAz7f3NhBOll8e5gxzPbaM1FM",
  authDomain: "calculadora-medias.firebaseapp.com",
  projectId: "calculadora-medias",
  storageBucket: "calculadora-medias.firebasestorage.app",
  messagingSenderId: "800453103423",
  appId: "1:800453103423:web:ba5921cdc7aaa9413e0d8a",
  measurementId: "G-T8E85KH615",
};

const app = initializeApp(firebaseConfig);
const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";
const emulatorHost = location.hostname;

export { app, emulatorHost, isLocalhost };
