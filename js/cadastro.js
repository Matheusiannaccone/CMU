// js/cadastro.js
import { auth, db, functions } from "../firebase/config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";

const registerBtn = document.getElementById("registerBtn");
const msg = document.getElementById("cadastroMessage");

const SITE_KEY = "6Lc0Vz8sAAAAAOUH3njQ74YzthLcezzX1K_y4gi8";

const areaSelect = document.getElementById("area");
const cursoSelect = document.getElementById("curso");
const nasc = document.getElementById("nascimento");

const cursosPorArea = {
  engenharias: [
    { id: "eng_civil", nome: "Engenharia Civil" },
    { id: "eng_computacao", nome: "Engenharia da Computação" },
    { id: "eng_eletrica", nome: "Engenharia Elétrica" },
    { id: "eng_mecanica", nome: "Engenharia Mecânica" },
    { id: "eng_mecatronica", nome: "Engenharia Mecatrônica" },
    { id: "eng_producao", nome: "Engenharia de Produção" },
    { id: "eng_quimica", nome: "Engenharia Química" },
    { id: "eng_agronomica", nome: "Engenharia Agronômica" }
  ],
  tecnologos: [
    { id: "tec_jogos", nome: "Tecnologia em Jogos Digitais" },
    { id: "tec_sistemas", nome: "Análise e Desenvolvimento de Sistemas" },
    { id: "tec_gestao", nome: "Gestão da Tecnologia da Informação" }
  ],
  saude: [
    { id: "medicina", nome: "Medicina" },
    { id: "odonto", nome: "Odontologia" },
    { id: "biomedicina", nome: "Biomedicina" },
    { id: "psicologia", nome: "Psicologia" },
    { id: "enfermagem", nome: "Enfermagem" },
    { id: "med_veterinaria", nome: "Medicina Veterinária" }
  ]
};

areaSelect.addEventListener("change", () => {
  const area = areaSelect.value;
  
  cursoSelect.innerHTML = `<option value="">Selecione o curso</option>`;
  cursoSelect.disabled = !area;
  
  if (!area) return;
  
  cursosPorArea[area].forEach(curso => {
    const option = document.createElement("option");
    option.value = curso.id;
    option.textContent = curso.nome;
    cursoSelect.appendChild(option);
  });
});

function dataLimite(idade){
  const hoje = new Date();
  return new Date(hoje.getFullYear() - idade, hoje.getMonth(), hoje.getDate());
}

const dataMax = dataLimite(18);
const DataMin = dataLimite(60);

nasc.max = dataMax.toISOString().split("T")[0];
nasc.min = DataMin.toISOString().split("T")[0];

registerBtn.addEventListener("click", async () => {
  
  const nome = document.getElementById("nome").value.trim();
  const sobrenome = document.getElementById("sobrenome").value.trim();
  const nasc = document.getElementById("nascimento").value;
  const curso = document.getElementById("curso").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !sobrenome || !nasc || !curso || !email || !senha) {
    msg.textContent = "Preencha todos os campos.";
    msg.style.color = "red";
    return;
  }

  function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  const idade = calcularIdade(nasc);

  if (idade < 18 || idade > 60) {
    msg.textContent = "Você deve ter entre 18 e 60 anos para se cadastrar.";
    msg.style.color = "red";
    return;
  }

  registerBtn.disabled = true;

  try {
    const token = await grecaptcha.execute(SITE_KEY, { 
      action: 'signup'
    }); 

    const verifyRecaptcha = httpsCallable(functions, 'verifyRecaptcha');

    await verifyRecaptcha({ token, action: 'signup' });
  
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nome,
      sobrenome,
      nascimento: nasc,
      curso,
      tipoUsuario: "padrao",
      mediaMinima: "5",
    });

    msg.textContent = "Cadastro realizado com sucesso!";
    msg.style.color = "green";

    // ✨ MOSTRAR BANNER DE CUPOM AO INVÉS DE REDIRECIONAR
    setTimeout(() => {
      registerBtn.style.display = "none";
      const form = document.querySelector(".auth-container");

      // Criar banner de cupom
      const cupomBanner = document.createElement("div");
      cupomBanner.id = "bannerCupom";
      cupomBanner.style.cssText = `
        margin-top: 30px;
        padding: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;

      cupomBanner.innerHTML = `
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">✨ Você possui um cupom?</h3>
        <p style="margin: 0 0 20px 0; font-size: 14px;">Se alguém te indicou ou você recebeu um cupom especial, use agora para obter descontos!</p>
        <div style="display: flex; gap: 10px;">
          <button id="btnTemCupom" style="
            flex: 1;
            padding: 12px;
            background: white;
            color: #4CAF50;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
          ">Sim, tenho cupom</button>
          <button id="btnSemCupom" style="
            flex: 1;
            padding: 12px;
            background: transparent;
            color: white;
            border: 2px solid white;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
          ">Não, continuar</button>
        </div>
      `;

      form.appendChild(cupomBanner);

      // Event listeners
      document.getElementById("btnTemCupom").addEventListener("click", () => {
        window.location.href = "coupon.html";
      });

      document.getElementById("btnSemCupom").addEventListener("click", () => {
        window.location.href = "index.html";
      });

      // Hover effects
      document.getElementById("btnTemCupom").addEventListener("mouseover", (e) => {
        e.target.style.transform = "scale(1.05)";
      });
      document.getElementById("btnTemCupom").addEventListener("mouseout", (e) => {
        e.target.style.transform = "scale(1)";
      });

      document.getElementById("btnSemCupom").addEventListener("mouseover", (e) => {
        e.target.style.background = "rgba(255,255,255,0.1)";
      });
      document.getElementById("btnSemCupom").addEventListener("mouseout", (e) => {
        e.target.style.background = "transparent";
      });
    }, 1500);

  } catch (error) {
    msg.textContent = error.message;
    msg.style.color = "red";
  } finally {
    registerBtn.disabled = false;
  }
});
