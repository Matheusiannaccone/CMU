const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadValidation() {
  const sourcePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "js",
    "materiaForm.js"
  );
  let source = fs.readFileSync(sourcePath, "utf8");
  source = source
    .replaceAll("export const ", "const ")
    .replaceAll("export class ", "class ")
    .replaceAll("export function ", "function ");
  source += "\nglobalThis.testApi = { validateMateriaElement, MateriaValidationError };";

  const context = {};
  vm.runInNewContext(source, context);
  return context.testApi;
}

function materiaElement({ nome = "Cálculo", notas = {}, badInput = {} } = {}) {
  const values = {
    materia1_nome: nome,
    materia1_nota1: notas.ac1 ?? "",
    materia1_nota2: notas.ac2 ?? "",
    materia1_nota3: notas.af ?? "",
    materia1_nota4: notas.ag ?? "",
    materia1_nota5: notas.as ?? "",
  };

  return {
    querySelector(selector) {
      const match = selector.match(/name="([^"]+)"/);
      const name = match?.[1];
      return name ? {
        value: values[name],
        validity: { badInput: badInput[name] === true },
      } : null;
    },
  };
}

const { validateMateriaElement, MateriaValidationError } = loadValidation();

test("valida nome e preserva caracteres especiais literalmente", () => {
  const nome = `\"><script>window.x=1</script>&'`;
  const result = validateMateriaElement(materiaElement({ nome }), 1);

  assert.equal(result.nome, nome);
  assert.deepEqual(
    { ac1: result.ac1, ac2: result.ac2, af: result.af, ag: result.ag, as: result.as },
    { ac1: null, ac2: null, af: null, ag: null, as: null }
  );
});

test("rejeita nome vazio ou acima do limite atual", () => {
  assert.throws(
    () => validateMateriaElement(materiaElement({ nome: "   " }), 1),
    MateriaValidationError
  );
  assert.throws(
    () => validateMateriaElement(materiaElement({ nome: "x".repeat(51) }), 1),
    MateriaValidationError
  );
});

for (const invalidValue of ["-1", "10.01", "999", "NaN", "Infinity", "texto"] ) {
  test(`rejeita nota inválida: ${invalidValue}`, () => {
    assert.throws(
      () => validateMateriaElement(
        materiaElement({ notas: { ac1: invalidValue } }),
        1
      ),
      MateriaValidationError
    );
  });
}

test("rejeita entrada numérica marcada como inválida pelo navegador", () => {
  assert.throws(
    () => validateMateriaElement(materiaElement({
      notas: { ac1: "" },
      badInput: { materia1_nota1: true },
    }), 1),
    MateriaValidationError
  );
});

test("aceita os limites zero e dez", () => {
  const result = validateMateriaElement(materiaElement({
    notas: { ac1: "0", ac2: "10" },
  }), 1);

  assert.equal(result.ac1, 0);
  assert.equal(result.ac2, 10);
});
