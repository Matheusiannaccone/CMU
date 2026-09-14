const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class HttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function loadFunctions(overrides = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", "index.js"), "utf8");
  const calls = {
    recursiveDelete: [],
    authDeleted: [],
    privateWrites: [],
    bulkDeletes: [],
    couponQueryUid: null,
  };

  function createRef(refPath) {
    return {
      path: refPath,
      collection(name) {
        return createRef(`${refPath}/${name}`);
      },
      doc(id) {
        return createRef(`${refPath}/${id}`);
      },
      async set(data, options) {
        calls.privateWrites.push({ path: refPath, data, options });
      },
      where(field, operator, value) {
        calls.couponQueryUid = { field, operator, value };
        return {
          async get() {
            return {
              forEach(callback) {
                for (const ref of overrides.couponRefs || []) {
                  callback({ ref });
                }
              },
            };
          },
        };
      },
    };
  }

  const db = {
    collection: createRef,
    async recursiveDelete(ref) {
      calls.recursiveDelete.push(ref.path);
    },
    bulkWriter() {
      return {
        delete(ref) {
          calls.bulkDeletes.push(ref.path);
        },
        async close() {},
      };
    },
    async runTransaction() {
      throw new Error("not used in these tests");
    },
  };

  const auth = {
    async verifyIdToken() {
      return { uid: overrides.uid || "user-a" };
    },
    async deleteUser(uid) {
      calls.authDeleted.push(uid);
    },
    async getUser(uid) {
      if (overrides.getUserError) throw overrides.getUserError;
      return { uid, email: overrides.authEmail || "new@example.com" };
    },
  };

  const modules = {
    "firebase-functions/v2/https": {
      onCall: (_options, handler) => handler,
      onRequest: (_options, handler) => handler,
      HttpsError,
    },
    "firebase-functions/v1": {
      region: () => ({ auth: { user: () => ({ onCreate: handler => handler }) } }),
    },
    "firebase-functions/firestore": {
      onDocumentDeleted: (_options, handler) => handler,
    },
    "firebase-functions/params": {
      defineSecret: () => ({ value: () => "test-secret" }),
    },
    "firebase-admin/firestore": {
      FieldValue: { serverTimestamp: () => "server-timestamp" },
    },
    "firebase-admin": {
      initializeApp() {},
      firestore: () => db,
      auth: () => auth,
    },
  };

  const context = {
    console: { log() {}, warn() {}, error() {} },
    exports: {},
    fetch: async () => ({ json: async () => ({ success: true, action: "test", score: 1 }) }),
    require(name) {
      assert.ok(modules[name], `unexpected module: ${name}`);
      return modules[name];
    },
  };

  vm.runInNewContext(source, context);
  return { handlers: context.exports, calls };
}

test("deleteAccount recursively deletes only the authenticated user tree", async () => {
  const { handlers, calls } = loadFunctions({ uid: "user-a" });
  const response = { statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, send(body) { this.body = body; } };

  await handlers.deleteAccount(
    { headers: { authorization: "Bearer valid-token" } },
    response
  );

  assert.deepEqual(calls.recursiveDelete, ["usuarios/user-a"]);
  assert.deepEqual(calls.authDeleted, ["user-a"]);
  assert.equal(response.body, "Conta deletada com sucesso");
});

test("deleteAccount rejects requests without an authentication token", async () => {
  const { handlers, calls } = loadFunctions();
  const response = { statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, send(body) { this.body = body; } };

  await handlers.deleteAccount({ headers: {} }, response);

  assert.equal(response.statusCode, 401);
  assert.equal(response.body, "Não autorizado");
  assert.deepEqual(calls.recursiveDelete, []);
  assert.deepEqual(calls.authDeleted, []);
});

test("deleteUserData cleans descendants, private data and only owned coupons", async () => {
  const couponRefs = [{ path: "cupons/a" }, { path: "cupons/b" }];
  const { handlers, calls } = loadFunctions({ couponRefs });

  await handlers.deleteUserData({ params: { uid: "user-a" } });

  assert.deepEqual(calls.recursiveDelete, ["usuarios/user-a"]);
  assert.deepEqual(calls.couponQueryUid, {
    field: "ownerUid",
    operator: "==",
    value: "user-a",
  });
  assert.deepEqual(calls.bulkDeletes, [
    "usuarios_priv/user-a",
    "cupons/a",
    "cupons/b",
  ]);
});

test("syncEmail requires authentication and a valid email argument", async () => {
  const { handlers } = loadFunctions();

  await assert.rejects(() => handlers.syncEmail({ data: { email: "new@example.com" } }), {
    code: "unauthenticated",
  });
  await assert.rejects(() => handlers.syncEmail({ auth: { uid: "user-a" }, data: {} }), {
    code: "invalid-argument",
  });
});

test("syncEmail writes the canonical Auth email under request.auth.uid", async () => {
  const { handlers, calls } = loadFunctions({ authEmail: "New@Example.com" });

  const result = await handlers.syncEmail({
    auth: { uid: "user-a" },
    data: { uid: "user-b", email: "new@example.com" },
  });

  assert.equal(result.success, true);
  assert.equal(calls.privateWrites.length, 1);
  assert.equal(calls.privateWrites[0].path, "usuarios_priv/user-a");
  assert.equal(calls.privateWrites[0].data.email, "New@Example.com");
  assert.equal(calls.privateWrites[0].data.updatedAt, "server-timestamp");
  assert.equal(calls.privateWrites[0].options.merge, true);
});

test("syncEmail rejects an email that differs from Firebase Auth", async () => {
  const { handlers } = loadFunctions({ authEmail: "canonical@example.com" });

  await assert.rejects(() => handlers.syncEmail({
    auth: { uid: "user-a" },
    data: { email: "other@example.com" },
  }), { code: "invalid-argument" });
});

test("syncEmail converts unexpected backend failures to an internal error", async () => {
  const { handlers } = loadFunctions({ getUserError: new Error("backend failure") });

  await assert.rejects(() => handlers.syncEmail({
    auth: { uid: "user-a" },
    data: { email: "new@example.com" },
  }), { code: "internal" });
});

test("stale subject deletion is chunked and keeps current document ids", async () => {
  const sourcePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "firestore",
    "salvarNotas.js"
  );
  let source = fs.readFileSync(sourcePath, "utf8");
  source = source.replace(/^import[\s\S]*?;\r?\n/gm, "");
  source = source.replace("export function getStaleMateriaIds", "function getStaleMateriaIds");
  source += "\nglobalThis.testApi = { getStaleMateriaIds, deleteStaleMaterias };";

  const docs = Array.from({ length: 903 }, (_, index) => ({
    id: `materia${index + 1}`,
    ref: { path: `materias/materia${index + 1}` },
  }));
  const commits = [];
  const context = {
    auth: { currentUser: null },
    db: {},
    document: { getElementById: () => null },
    getDocs: async () => ({ docs }),
    writeBatch: () => {
      const deleted = [];
      return {
        delete(ref) { deleted.push(ref.path); },
        async commit() { commits.push(deleted); },
      };
    },
    console,
  };

  vm.runInNewContext(source, context);
  assert.deepEqual(
    Array.from(context.testApi.getStaleMateriaIds(
      ["materia1", "materia2", "legacy"],
      ["materia1", "materia2"]
    )),
    ["legacy"]
  );

  await context.testApi.deleteStaleMaterias({}, ["materia1", "materia2"]);

  assert.equal(commits.length, 3);
  assert.deepEqual(commits.map(chunk => chunk.length), [450, 450, 1]);
  assert.ok(commits.flat().every(pathname => ![
    "materias/materia1",
    "materias/materia2",
  ].includes(pathname)));
});
