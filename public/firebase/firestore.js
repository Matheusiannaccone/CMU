import {
  connectFirestoreEmulator,
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { app, emulatorHost, isLocalhost } from "./app.js";
import "./appCheck.js";

const db = getFirestore(app);

if (isLocalhost) {
  connectFirestoreEmulator(db, emulatorHost, 8080);
}

export { db };
