export const MATERIA_NAME_MAX_LENGTH = 50;
export const NOTA_MIN = 0;
export const NOTA_MAX = 10;

const NOTAS = [
  { field: "ac1", number: 1, label: "AC1" },
  { field: "ac2", number: 2, label: "AC2" },
  { field: "af", number: 3, label: "AF" },
  { field: "ag", number: 4, label: "AG" },
  { field: "as", number: 5, label: "AS" },
];

export class MateriaValidationError extends Error {}

function createInput(attributes) {
  const input = document.createElement("input");

  Object.entries(attributes).forEach(([name, value]) => {
    if (name === "className") {
      input.className = value;
    } else if (name === "value") {
      input.value = value ?? "";
    } else if (typeof value === "boolean") {
      if (value) input.setAttribute(name, "");
    } else {
      input.setAttribute(name, value);
    }
  });

  return input;
}

export function createMateriaElement(index, materia = {}) {
  const div = document.createElement("div");
  div.className = "materia visible";
  div.id = `materia${index}`;

  const titulo = document.createElement("h2");
  titulo.textContent = `Matéria ${index}`;

  const nomeContainer = document.createElement("div");
  nomeContainer.className = "materia-nome-container";
  nomeContainer.appendChild(createInput({
    type: "text",
    name: `materia${index}_nome`,
    placeholder: "Nome da matéria",
    maxlength: String(MATERIA_NAME_MAX_LENGTH),
    required: true,
    "aria-label": `Nome da matéria ${index}`,
    value: materia.nome ?? "",
  }));

  const notasContainer = document.createElement("div");
  notasContainer.className = "notas";

  NOTAS.forEach(({ field, number, label }) => {
    notasContainer.appendChild(createInput({
      type: "number",
      name: `materia${index}_nota${number}`,
      placeholder: label,
      min: String(NOTA_MIN),
      max: String(NOTA_MAX),
      step: "0.01",
      "aria-label": `Nota ${label} da matéria ${index}`,
      value: materia[field] ?? "",
    }));
  });

  notasContainer.appendChild(createInput({
    type: "text",
    name: `materia${index}_media`,
    className: "media",
    placeholder: "Média",
    readonly: true,
    "aria-label": `Média da matéria ${index}`,
  }));
  notasContainer.appendChild(createInput({
    type: "text",
    name: `materia${index}_afNecessaria`,
    className: "afNecessaria",
    placeholder: "AF Necessária",
    readonly: true,
    "aria-label": `AF necessária para atingir a média mínima da matéria ${index}`,
  }));

  div.append(titulo, nomeContainer, notasContainer);
  return div;
}

export function validateMateriaElement(materia, index) {
  const nomeInput = materia.querySelector(`input[name="materia${index}_nome"]`);
  const nome = nomeInput?.value ?? "";

  if (!nome.trim()) {
    throw new MateriaValidationError(`Informe o nome da Matéria ${index}.`);
  }

  if (nome.length > MATERIA_NAME_MAX_LENGTH) {
    throw new MateriaValidationError(
      `O nome da Matéria ${index} deve ter no máximo ${MATERIA_NAME_MAX_LENGTH} caracteres.`
    );
  }

  const result = { nome };

  NOTAS.forEach(({ field, number, label }) => {
    const input = materia.querySelector(`input[name="materia${index}_nota${number}"]`);
    const rawValue = input?.value ?? "";

    if (input?.validity?.badInput) {
      throw new MateriaValidationError(
        `A nota ${label} da Matéria ${index} deve ser um número entre 0 e 10.`
      );
    }

    if (rawValue.trim() === "") {
      result[field] = null;
      return;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < NOTA_MIN || value > NOTA_MAX) {
      throw new MateriaValidationError(
        `A nota ${label} da Matéria ${index} deve ser um número entre 0 e 10.`
      );
    }

    result[field] = value;
  });

  return result;
}
