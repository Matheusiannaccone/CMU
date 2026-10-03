import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app-check.js";
import { app, isLocalhost } from "./app.js";

const appCheck = isLocalhost
  ? null
  : initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        "6Lc0Vz8sAAAAAOUH3njQ74YzthLcezzX1K_y4gi8"
      ),
      isTokenAutoRefreshEnabled: true
    });

export { appCheck };
