let materiasAdicionadas = 1;

function adicionarMateria() {
  if (materiasAdicionadas >= 8) {
    alert("Limite de 8 matérias atingido.");
    return;
  }
  materiasAdicionadas++;

  const container = document.getElementById('materiasContainer');

  const novaMateria = document.createElement('div');
  novaMateria.className = 'materia visible';
  novaMateria.id = 'materia' + materiasAdicionadas;

  novaMateria.innerHTML = `
    <h2>Matéria ${materiasAdicionadas}</h2>
    <input type="text" name="materia${materiasAdicionadas}_nome" placeholder="Nome da matéria" required>
    <div class="notas">
      <input type="number" name="materia${materiasAdicionadas}_nota1" placeholder="AC1" min="0" max="10" oninput="calcularMedia(this)" required>
      <input type="number" name="materia${materiasAdicionadas}_nota2" placeholder="AC2" min="0" max="10" oninput="calcularMedia(this)" required>
      <input type="number" name="materia${materiasAdicionadas}_nota3" placeholder="AF" min="0" max="10" oninput="calcularMedia(this)" required>
      <input type="number" name="materia${materiasAdicionadas}_nota4" placeholder="AG" min="0" max="10" oninput="calcularMedia(this)" required>
      <input type="number" name="materia${materiasAdicionadas}_nota5" placeholder="AS" min="0" max="10" oninput="calcularMedia(this)">
      <input type="text" name="materia${materiasAdicionadas}_media" class="media" placeholder="Média" readonly>
    </div>
  `;

  container.appendChild(novaMateria);
}

function removerMateria() {
    if (materiasAdicionadas <= 1) {
        alert("Não há mais matérias para remover.");
        return;
    }
    const container = document.getElementById('materiasContainer');
    const ultimaMateria = document.getElementById('materia' + materiasAdicionadas);
    if (ultimaMateria) {
        container.removeChild(ultimaMateria);
        materiasAdicionadas--;
        calcularMedias(); // recalcula médias após remoção
    }
}

function limitarNota(input) {
    let valor = parseFloat(input.value);
    if (isNaN(valor) || valor < 0) input.value = 0;
    else if (valor > 10) input.value = 10;
}

function calcularMedia(input) {
  const notasDiv = input.closest(".notas");
  const inputs = notasDiv.querySelectorAll('input[type="number"]');
  const pesos = [1.5, 3, 4.5, 1];

  const notas = [];
  for (let i = 0; i < 4; i++) {
    let val = parseFloat(inputs[i].value);
    if (isNaN(val)) val = 0;
    notas.push(val);
  }

  let nota5 = parseFloat(inputs[4].value);
  if (isNaN(nota5)) nota5 = 0;

  let melhorGanho = 0;
  let melhorIndex = -1;

  for (let i = 0; i < 4; i++) {
    const impactoOriginal = notas[i] * pesos[i];
    const impactoNovo = nota5 * pesos[i];
    const ganho = impactoNovo - impactoOriginal;

    if (ganho > melhorGanho) {
      melhorGanho = ganho;
      melhorIndex = i;
    }
  }

  if (melhorIndex >= 0) {
    notas[melhorIndex] = nota5;
  }

  let somaPonderada = 0;
  let somaPesos = 0;

  for (let i = 0; i < 4; i++) {
    somaPonderada += notas[i] * pesos[i];
    somaPesos += pesos[i];
  }

  const media = (somaPonderada / somaPesos).toFixed(2);
  notasDiv.querySelector(".media").value = media;

  atualizarMediaGeral();
}

function atualizarMediaGeral() {
  const medias = document.querySelectorAll(".materia.visible .media");
  let soma = 0;
  let count = 0;

  medias.forEach(el => {
    const val = parseFloat(el.value);
    if (!isNaN(val)) {
      soma += val;
      count++;
    }
  });

  const mediaGeral = count > 0 ? (soma / count).toFixed(2) : "-";
  document.getElementById("mediaGeral").textContent = mediaGeral;
}

function fecharPopup() {
  const popup = document.getElementById("popupAd");
  if (popup) popup.style.display = "none";
}
