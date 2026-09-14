const path = require("node:path");
const { createRequire } = require("node:module");
const { randomUUID } = require("node:crypto");

const PROJECT_ID = "calculadora-medias";
const AUTH_EMULATOR_HOST = "127.0.0.1:9099";
const FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
const HOSTING_URL = "http://127.0.0.1:5000";
const FUNCTIONS_EMULATOR_URL =
  `http://127.0.0.1:5001/${PROJECT_ID}/southamerica-east1`;
const AUTH_EMULATOR_URL = `http://${AUTH_EMULATOR_HOST}`;
const FIRESTORE_EMULATOR_URL = `http://${FIRESTORE_EMULATOR_HOST}`;

function assertLocalUrl(value) {
  const url = new URL(value);

  if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
    throw new Error(`O E2E recusou um endereço não local: ${url.origin}`);
  }
}

for (const [name, expected] of [
  ["FIREBASE_AUTH_EMULATOR_HOST", AUTH_EMULATOR_HOST],
  ["FIRESTORE_EMULATOR_HOST", FIRESTORE_EMULATOR_HOST],
]) {
  const configured = process.env[name];
  const localhostVariant = expected.replace("127.0.0.1", "localhost");

  if (configured && ![expected, localhostVariant].includes(configured)) {
    throw new Error(`${name} aponta para um host não autorizado: ${configured}`);
  }

  process.env[name] = expected;
}

process.env.GCLOUD_PROJECT = PROJECT_ID;
process.env.GOOGLE_CLOUD_PROJECT = PROJECT_ID;

const requireFromFunctions = createRequire(
  path.resolve(__dirname, "../../../functions/package.json")
);
const admin = requireFromFunctions("firebase-admin");
const app = admin.apps.find(candidate => candidate.name === "cmu-e2e") ||
  admin.initializeApp({ projectId: PROJECT_ID }, "cmu-e2e");
const auth = app.auth();
const db = app.firestore();

function uniqueCredentials(prefix) {
  const suffix = `${Date.now()}-${process.pid}-${randomUUID().slice(0, 8)}`;
  return {
    email: `${prefix}-${suffix}@example.test`,
    password: "CmuE2e!12345",
  };
}

async function createUser({ email, password, multiSemester = false }) {
  const user = await auth.createUser({ email, password, emailVerified: true });

  if (multiSemester) {
    await auth.setCustomUserClaims(user.uid, { multiSemester: true });
  }

  await db.collection("usuarios").doc(user.uid).set({
    nome: "Usuário",
    sobrenome: "E2E",
    nascimento: "2000-01-01",
    curso: "eng_computacao",
    mediaMinima: "5",
  });

  return user;
}

async function signInWithPassword(email, password) {
  const url = `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/` +
    "accounts:signInWithPassword?key=fake-api-key";
  assertLocalUrl(url);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!response.ok) {
    throw new Error(`Falha no Auth Emulator: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function cleanupUser(uid) {
  if (!uid) return;

  await db.recursiveDelete(db.collection("usuarios").doc(uid));
  await db.collection("usuarios_priv").doc(uid).delete();

  const coupons = await db.collection("cupons").where("ownerUid", "==", uid).get();
  const writer = db.bulkWriter();
  coupons.forEach(doc => writer.delete(doc.ref));
  await writer.close();

  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
  }
}

async function poll(operation, { timeout = 15_000, interval = 200 } = {}) {
  const deadline = Date.now() + timeout;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const result = await operation();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw lastError || new Error("Condição não satisfeita dentro do prazo");
}

module.exports = {
  AUTH_EMULATOR_URL,
  FIRESTORE_EMULATOR_URL,
  FUNCTIONS_EMULATOR_URL,
  HOSTING_URL,
  PROJECT_ID,
  assertLocalUrl,
  auth,
  cleanupUser,
  createUser,
  db,
  poll,
  signInWithPassword,
  uniqueCredentials,
};
