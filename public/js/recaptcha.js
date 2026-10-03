const RECAPTCHA_LOAD_TIMEOUT_MS = 15_000;

function waitForRecaptchaApi() {
  return new Promise((resolve, reject) => {
    let timeoutId = null;
    const script = document.querySelector("script[data-recaptcha-api]");

    const cleanup = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };

    const handleReady = () => {
      cleanup();
      globalThis.grecaptcha.ready(resolve);
    };

    function handleLoad() {
      if (typeof globalThis.grecaptcha === "undefined") {
        handleError();
        return;
      }

      handleReady();
    }

    function handleError() {
      cleanup();
      reject(new Error("Não foi possível carregar a verificação de segurança."));
    }

    if (typeof globalThis.grecaptcha !== "undefined") {
      handleReady();
      return;
    }

    if (!script) {
      handleError();
      return;
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    timeoutId = setTimeout(handleError, RECAPTCHA_LOAD_TIMEOUT_MS);
  });
}

export async function executeRecaptcha(siteKey, action) {
  await waitForRecaptchaApi();
  return globalThis.grecaptcha.execute(siteKey, { action });
}
