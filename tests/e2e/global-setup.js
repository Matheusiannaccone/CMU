const {
  AUTH_EMULATOR_URL,
  FIRESTORE_EMULATOR_URL,
  FUNCTIONS_EMULATOR_URL,
  HOSTING_URL,
  PROJECT_ID,
  assertLocalUrl,
} = require("./helpers/firebase-emulators");

async function retry(label, operation) {
  const deadline = Date.now() + 30_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  throw new Error(`${label} não ficou disponível: ${lastError?.message}`);
}

async function requireOk(url, options) {
  assertLocalUrl(url);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response;
}

module.exports = async () => {
  await retry("Firebase Hosting Emulator", () =>
    requireOk(`${HOSTING_URL}/index.html`)
  );

  await retry("Firebase Functions Emulator", async () => {
    assertLocalUrl(`${FUNCTIONS_EMULATOR_URL}/syncEmail`);
    const response = await fetch(`${FUNCTIONS_EMULATOR_URL}/syncEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { email: "probe@example.test" } }),
    });

    if (response.status === 404 || response.status >= 500) {
      throw new Error(`status ${response.status}`);
    }
  });

  await retry("Firebase Auth Emulator", () =>
    requireOk(
      `${AUTH_EMULATOR_URL}/emulator/v1/projects/${PROJECT_ID}/accounts`,
      { method: "DELETE" }
    )
  );

  await retry("Cloud Firestore Emulator", () =>
    requireOk(
      `${FIRESTORE_EMULATOR_URL}/emulator/v1/projects/${PROJECT_ID}` +
        "/databases/(default)/documents",
      { method: "DELETE" }
    )
  );
};
