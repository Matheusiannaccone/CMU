import {
  connectFunctionsEmulator,
  getFunctions
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";
import { app, emulatorHost, isLocalhost } from "./app.js";
import "./appCheck.js";

const functions = getFunctions(app, "southamerica-east1");

if (isLocalhost) {
  connectFunctionsEmulator(functions, emulatorHost, 5001);
}

export { functions };
