const { expect, test } = require("./fixtures");
const {
  FUNCTIONS_EMULATOR_URL,
  assertLocalUrl,
  auth,
  createUser,
  db,
  poll,
  signInWithPassword,
  uniqueCredentials,
} = require("./helpers/firebase-emulators");

async function login(page, email, password) {
  await page.goto("/login.html");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#message")).toHaveText("Login realizado com sucesso!");
  await expect(page).toHaveURL(/\/index\.html$/);
}

async function fillMateria(page, index, values = {}) {
  const defaults = { nome: `Matéria ${index}`, ac1: "8", ac2: "7", af: "6", ag: "9", as: "" };
  const data = { ...defaults, ...values };

  await page.locator(`[name="materia${index}_nome"]`).fill(data.nome);
  await page.locator(`[name="materia${index}_nota1"]`).fill(data.ac1);
  await page.locator(`[name="materia${index}_nota2"]`).fill(data.ac2);
  await page.locator(`[name="materia${index}_nota3"]`).fill(data.af);
  await page.locator(`[name="materia${index}_nota4"]`).fill(data.ag);
  if (data.as) await page.locator(`[name="materia${index}_nota5"]`).fill(data.as);
}

async function clickAndAcceptAlert(page, selector, expectedMessage) {
  const handledDialog = new Promise(resolve => {
    page.once("dialog", async dialog => {
      const message = dialog.message();
      await dialog.accept();
      resolve(message);
    });
  });

  await page.locator(selector).click();
  const message = await handledDialog;
  expect(message).toBe(expectedMessage);
}

test("cadastra um usuário e persiste o perfil nos emuladores", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("cadastro");

  await page.goto("/cadastro.html");
  await page.locator("#nome").fill("Cadastro");
  await page.locator("#sobrenome").fill("E2E");
  await page.locator("#nascimento").fill("2000-01-01");
  await page.locator("#area").selectOption("engenharias");
  await page.locator("#curso").selectOption("eng_computacao");
  await page.locator("#email").fill(credentials.email);
  await page.locator("#senha").fill(credentials.password);
  await page.locator("#registerBtn").click();

  await expect(page.locator("#cadastroMessage")).toHaveText("Cadastro realizado com sucesso!");
  const user = await poll(() => auth.getUserByEmail(credentials.email));
  cleanupUids.push(user.uid);

  const profile = await db.collection("usuarios").doc(user.uid).get();
  expect(profile.exists).toBe(true);
  expect(profile.data()).toMatchObject({
    nome: "Cadastro",
    sobrenome: "E2E",
    curso: "eng_computacao",
  });
});

test("faz login com usuário criado no Auth Emulator", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("login");
  const user = await createUser(credentials);
  cleanupUids.push(user.uid);

  await login(page, credentials.email, credentials.password);

  await expect(page.locator("#loginBtn")).toHaveText("Logout");
  await expect(page.locator("#signupBtn")).toHaveText("Usuario");
});

test("cria e reutiliza o semestre único", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("semestre-unico");
  const user = await createUser(credentials);
  cleanupUids.push(user.uid);

  await login(page, credentials.email, credentials.password);
  await fillMateria(page, 1, { nome: "Cálculo I" });
  await clickAndAcceptAlert(
    page,
    "#salvarNotasBtn",
    "Notas e média geral salvas com sucesso."
  );

  const userRef = db.collection("usuarios").doc(user.uid);
  await expect.poll(async () => (await userRef.get()).data()?.semestreUnicoId)
    .toBe("semestre-unico");

  await page.reload();
  await expect(page.locator('[name="materia1_nome"]')).toHaveValue("Cálculo I");

  const semesters = await userRef.collection("semestres").get();
  expect(semesters.size).toBe(1);
  expect(semesters.docs[0].id).toBe("semestre-unico");
});

test("salva matérias e notas no Firestore Emulator", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("salvar-materias");
  const user = await createUser(credentials);
  cleanupUids.push(user.uid);

  await login(page, credentials.email, credentials.password);
  await fillMateria(page, 1, { nome: "Algoritmos", as: "9" });
  await page.locator("#adicionarMateriaBtn").click();
  await fillMateria(page, 2, { nome: "Física" });
  await clickAndAcceptAlert(
    page,
    "#salvarNotasBtn",
    "Notas e média geral salvas com sucesso."
  );

  const materias = await db.collection("usuarios").doc(user.uid)
    .collection("semestres").doc("semestre-unico").collection("materias").get();
  expect(materias.size).toBe(2);
  expect(materias.docs.map(doc => doc.id).sort()).toEqual(["materia1", "materia2"]);
  expect(materias.docs.find(doc => doc.id === "materia1").data()).toMatchObject({
    nome: "Algoritmos",
    ac1: 8,
    ac2: 7,
    af: 6,
    ag: 9,
    as: 9,
  });
});

test("persiste a remoção de matéria após salvar e recarregar", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("remover-materia");
  const user = await createUser(credentials);
  cleanupUids.push(user.uid);

  await login(page, credentials.email, credentials.password);
  await fillMateria(page, 1, { nome: "Mantida" });
  await page.locator("#adicionarMateriaBtn").click();
  await fillMateria(page, 2, { nome: "Removida" });
  await clickAndAcceptAlert(page, "#salvarNotasBtn", "Notas e média geral salvas com sucesso.");

  await page.locator("#removerMateriaBtn").click();
  await clickAndAcceptAlert(page, "#salvarNotasBtn", "Notas e média geral salvas com sucesso.");

  const materiasRef = db.collection("usuarios").doc(user.uid)
    .collection("semestres").doc("semestre-unico").collection("materias");
  expect((await materiasRef.get()).size).toBe(1);
  expect((await materiasRef.doc("materia2").get()).exists).toBe(false);

  await page.reload();
  await expect(page.locator("#materiasContainer .materia")).toHaveCount(1);
  await expect(page.locator('[name="materia1_nome"]')).toHaveValue("Mantida");
});

test("altera o email e sincroniza usuarios_priv", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("email-antigo");
  const nextCredentials = uniqueCredentials("email-novo");
  const user = await createUser(credentials);
  cleanupUids.push(user.uid);
  await db.collection("usuarios_priv").doc(user.uid).set({ email: credentials.email });

  await login(page, credentials.email, credentials.password);
  await page.goto("/usuario.html");

  const dialogMessages = [];
  page.on("dialog", async dialog => {
    dialogMessages.push(dialog.message());
    await dialog.accept(dialog.type() === "prompt" ? nextCredentials.email : undefined);
  });

  await page.locator("#alterarEmailBtn").click();
  await page.locator("#senhaAtual").fill(credentials.password);
  await page.locator("#confirmarReauthBtn").click();

  await poll(async () => {
    const authUser = await auth.getUser(user.uid);
    const privateData = await db.collection("usuarios_priv").doc(user.uid).get();
    return authUser.email === nextCredentials.email &&
      privateData.data()?.email === nextCredentials.email;
  });
  await expect.poll(() => dialogMessages.includes("Email atualizado com sucesso!"))
    .toBe(true);
});

test("exclui a conta, dados acadêmicos, dados privados e cupons", async ({ cleanupUids }) => {
  const credentials = uniqueCredentials("exclusao");
  const user = await createUser(credentials);
  cleanupUids.push(user.uid);
  const userRef = db.collection("usuarios").doc(user.uid);

  await userRef.collection("semestres").doc("semestre-unico").set({ nome: "Atual" });
  await userRef.collection("semestres").doc("semestre-unico")
    .collection("materias").doc("materia1").set({ nome: "Teste" });
  await userRef.collection("medias").doc("semestre-unico").set({ mediaGeral: 7 });
  await db.collection("usuarios_priv").doc(user.uid).set({ email: credentials.email });
  const couponRef = db.collection("cupons").doc(`e2e-${user.uid}`);
  await couponRef.set({ ownerUid: user.uid });

  const session = await signInWithPassword(credentials.email, credentials.password);
  const deleteUrl = `${FUNCTIONS_EMULATOR_URL}/deleteAccount`;
  assertLocalUrl(deleteUrl);
  const response = await fetch(deleteUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.idToken}` },
  });
  expect(response.ok).toBe(true);

  await poll(async () => {
    try {
      await auth.getUser(user.uid);
      return false;
    } catch (error) {
      return error.code === "auth/user-not-found";
    }
  });

  await poll(async () => {
    const snapshots = await Promise.all([
      userRef.get(),
      userRef.collection("semestres").doc("semestre-unico").get(),
      userRef.collection("semestres").doc("semestre-unico")
        .collection("materias").doc("materia1").get(),
      userRef.collection("medias").doc("semestre-unico").get(),
      db.collection("usuarios_priv").doc(user.uid).get(),
      couponRef.get(),
    ]);
    return snapshots.every(snapshot => !snapshot.exists);
  });
});

test("calcula a AF necessária sem autenticação", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator('[name="materia1_nota1"]').fill("8");
  await page.locator('[name="materia1_nota2"]').fill("7");
  await page.locator('[name="materia1_nota4"]').fill("9");
  await page.locator("#calcularAFBtn").click();

  await expect(page.locator('[name="materia1_afNecessaria"]')).toHaveValue("1.78");
});

test("permite múltiplos semestres somente com a claim multiSemester", async ({ page, cleanupUids }) => {
  const credentials = uniqueCredentials("multi-semestre");
  const user = await createUser({ ...credentials, multiSemester: true });
  cleanupUids.push(user.uid);

  await login(page, credentials.email, credentials.password);
  await expect(page.locator("#semestreSelect")).toBeVisible();
  await expect(page.locator("#semestreSelect")).toBeEnabled();

  page.once("dialog", dialog => dialog.accept("2026/1"));
  await page.locator("#semestreSelect").selectOption("add");
  await expect(page.locator("#semestreSelect option", { hasText: "2026/1" })).toHaveCount(1);
  page.once("dialog", dialog => dialog.accept("2026/2"));
  await page.locator("#semestreSelect").selectOption("add");
  await expect(page.locator("#semestreSelect option", { hasText: "2026/2" })).toHaveCount(1);

  const semesters = await db.collection("usuarios").doc(user.uid).collection("semestres").get();
  expect(semesters.size).toBe(2);

  const selectedSemesterId = await page.locator("#semestreSelect").inputValue();
  await fillMateria(page, 1, { nome: "Multisemestre" });
  await clickAndAcceptAlert(page, "#salvarNotasBtn", "Notas e média geral salvas com sucesso.");

  const saved = await db.collection("usuarios").doc(user.uid)
    .collection("semestres").doc(selectedSemesterId)
    .collection("materias").doc("materia1").get();
  expect(saved.data()?.nome).toBe("Multisemestre");
});
