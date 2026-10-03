import {
  connectAuthEmulator,
  getAuth
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { app, emulatorHost, isLocalhost } from "./app.js";
import "./appCheck.js";

const auth = getAuth(app);

if (isLocalhost) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`);
}

export { auth };
