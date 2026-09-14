# **CMU — Calculadora de Médias Universitárias**

Aplicação web desenvolvida para ajudar estudantes universitários a calcular suas médias acadêmicas de forma rápida e automática.

A ferramenta permite inserir notas de avaliações, calcular a média da disciplina e simular a nota necessária para alcançar a média mínima de aprovação.

**Acesse o projeto:**
https://calculadora-medias-universitarias.vercel.app/

---

# *Sobre o Projeto*

A **Calculadora de Médias Universitárias (CMU)** foi criada para simplificar o cálculo de notas durante a graduação.

Muitos estudantes precisam calcular manualmente médias ponderadas entre avaliações como:

* AC1
* AC2
* AF
* AG
* AS

O sistema permite inserir as notas e calcular automaticamente a média com base nos pesos definidos pela aplicação.

Além da calculadora principal, o projeto possui autenticação de usuários, integração com Firebase e recursos para armazenamento de informações acadêmicas.

A implementação atual é a **V3 — Free MVP**, com cálculos gratuitos e salvamento de um semestre por usuário comum.

---

# *Funcionalidades*

Entre as funcionalidades atualmente presentes no projeto estão:

* Inserção de notas das avaliações.
* Cálculo automático da média.
* Cálculo da nota necessária na AF.
* Simulação de desempenho acadêmico.
* Cadastro de usuários.
* Login com Firebase Authentication.
* Armazenamento de dados acadêmicos no Firestore.
* Área do usuário.
* Suporte a tema claro e escuro.
* Interface responsiva para diferentes dispositivos.
* Integrações de backend por meio de Firebase Cloud Functions.

O semestre único é resolvido no backend por `resolveSingleSemester`, com o vínculo `semestreUnicoId` protegido nas regras do Firestore. Contas com a Custom Claim `multiSemester` mantêm o fluxo especial de múltiplos semestres, sem vínculo com pagamento.

Cadastro e login utilizam reCAPTCHA; a configuração web também mantém App Check. O código atual não implementa cobrança nem anúncios. A exclusão de cupons históricos permanece em `deleteUserData`, e o acesso direto do cliente a esses dados continua negado nas regras.

---

# *Tecnologias Utilizadas*

O projeto utiliza:

* **HTML5** — estrutura das páginas.
* **CSS3** — estilização e responsividade.
* **JavaScript** — lógica da aplicação e interação com a interface.
* **Firebase Authentication** — autenticação de usuários.
* **Cloud Firestore** — armazenamento de dados.
* **Firebase Cloud Functions** — execução de lógica no backend.
* **Firebase Hosting / configuração Firebase** — infraestrutura e configuração da aplicação.
* **Node.js** — ambiente utilizado pelas Cloud Functions.
* **Vercel** — deploy utilizado pela versão pública atual.

---

# *Estrutura do Projeto*

A estrutura do repositório foi reorganizada para separar claramente frontend, backend, documentação e configurações do Firebase.

```text
CMU/
│
├── Docs/
│   ├── CMU_V3_Logica_de_Negocio_e_Versionamento.txt
│   └── CMU_V3_Roadmap_de_Alteracoes.txt
│
├── functions/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── public/
│   │
│   ├── firebase/
│   │   └── config.js
│   │
│   ├── firestore/
│   │   ├── carregarSemestres.js
│   │   ├── mediaGlobal.js
│   │   └── salvarNotas.js
│   │
│   ├── images/
│   │   ├── logo.png
│   │   └── usuario.png
│   │
│   ├── js/
│   │   ├── cadastro.js
│   │   ├── config.js
│   │   ├── calcularAF.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── sobre.js
│   │   ├── theme.js
│   │   └── usuario.js
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── login.css
│   │   ├── styles.css
│   │   └── usuario.css
│   │
│   ├── 404.html
│   ├── cadastro.html
│   ├── index.html
│   ├── login.html
│   ├── sobre.html
│   └── usuario.html
│
├── .firebaserc
├── .gitignore
├── AGENTS.md
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── package-lock.json
├── package.json
└── README.md
```

---

# *Descrição das Principais Partes*

## 📁 `public`

Contém o frontend da aplicação e representa a principal fonte dos arquivos servidos ao usuário.

A configuração do Firebase Hosting utiliza essa pasta como diretório público da aplicação.

---

## 📁 `public/firebase`

Contém a configuração utilizada pelo frontend para conexão com os serviços Firebase.

### `config.js`

Responsável pela inicialização do Firebase no navegador e disponibilização dos serviços utilizados pela aplicação, como autenticação e Firestore.

---

## 📁 `public/firestore`

Contém scripts responsáveis pela interação entre o frontend e o Cloud Firestore.

### `carregarSemestres.js`

Resolve e carrega o semestre único do usuário comum e mantém o fluxo de seleção e criação de semestres para contas com a claim `multiSemester`.

### `mediaGlobal.js`

Calcula a média global a partir das médias salvas. O módulo permanece carregado, mas seu painel está oculto na interface atual.

### `salvarNotas.js`

Responsável pelo armazenamento das notas e informações acadêmicas do usuário no Firestore.

---

## 📁 `public/images`

Contém recursos visuais utilizados pela interface.

### `logo.png`

Logotipo utilizado pela aplicação.

### `usuario.png`

Imagem utilizada na área do usuário.

---

## 📁 `public/js`

Contém os scripts responsáveis pela lógica do frontend.

### `cadastro.js`

Controla o processo de criação de contas e integração do cadastro com o Firebase Authentication.

### `calcularAF.js`

Responsável pela lógica utilizada para calcular a nota necessária na AF.

### `index.js`

Script principal da calculadora e das interações da página inicial.

### `login.js`

Controla o processo de autenticação dos usuários.

### `config.js`

Define a versão atual da aplicação.

### `sobre.js`

Aplica a versão no rodapé da página institucional.

### `theme.js`

Controla as preferências de aparência da interface, incluindo modo claro e escuro.

### `usuario.js`

Gerencia interações e funcionalidades da área do usuário.

---

## 📁 `public/styles`

Contém os estilos da interface.

### `index.css`

Estilos específicos da página principal.

### `login.css`

Estilos utilizados nas páginas de autenticação.

### `styles.css`

Contém estilos compartilhados e globais da aplicação.

### `usuario.css`

Estilos utilizados na área do usuário.

---

## 📁 `functions`

Contém as **Firebase Cloud Functions** utilizadas pelo projeto.

As funções exportadas são `resolveSingleSemester`, `verifyRecaptcha`, `onUserCreated`, `deleteAccount` e `deleteUserData`. Elas mantêm o controle do semestre único, a verificação de reCAPTCHA, a criação de dados privados do cadastro e a exclusão de conta e dados, com as limitações registradas abaixo.

Arquivos de ambiente e credenciais locais, como `.env`, não são versionados no repositório.

---

## 📁 `Docs`

Contém a documentação técnica e de produto relacionada à evolução do CMU.

Atualmente inclui os documentos que definem a estratégia da V3:

### `CMU_V3_Logica_de_Negocio_e_Versionamento.txt`

Define a nova lógica de negócio, a experiência gratuita, a futura estratégia Premium e o modelo de versionamento da V3.

### `CMU_V3_Roadmap_de_Alteracoes.txt`

Define a ordem de execução das versões e fases planejadas para evolução do projeto.

---

# *Arquivos de Configuração*

## `.firebaserc`

Define os projetos Firebase associados ao ambiente de desenvolvimento e deploy.

---

## `.gitignore`

Define arquivos e diretórios que não devem ser adicionados ao Git, incluindo dependências, logs e arquivos de ambiente com informações sensíveis.

---

## `AGENTS.md`

Contém instruções específicas para agentes de desenvolvimento assistido por IA que trabalham no repositório.

O documento define o escopo atual da V3, arquivos relevantes, restrições e regras para alterações no código.

---

## `firebase.json`

Contém as configurações utilizadas pelo Firebase CLI, incluindo configuração de Hosting, Functions e outros serviços utilizados pelo projeto.

---

## `firestore.rules`

Contém as regras de segurança do Cloud Firestore.

Essas regras controlam quais dados podem ser lidos ou modificados por cada usuário e fazem parte da camada de segurança da aplicação.

---

## `firestore.indexes.json`

Contém a configuração dos índices utilizados pelo Firestore.

---

## `package.json`

Define dependências, scripts e configurações Node.js utilizadas pelo projeto.

---

# *Páginas HTML*

## `index.html`

Página principal da aplicação e da calculadora de médias.

## `login.html`

Página utilizada para autenticação de usuários.

## `cadastro.html`

Página para criação de novas contas.

## `usuario.html`

Área destinada aos usuários autenticados e às informações acadêmicas armazenadas.

## `sobre.html`

Página institucional com informações sobre o projeto.

## `404.html`

Página apresentada quando uma rota solicitada não é encontrada.

---

# *Roadmap Atual*

A implementação atual é a **V3 — Free MVP**. As etapas posteriores abaixo são planejamento e não estão implementadas.

A estratégia definida para as próximas versões é:

### **V3 — MVP Gratuito**

Reformular a experiência gratuita do CMU, removendo a lógica comercial anterior e disponibilizando as principais funcionalidades acadêmicas.

Entre os objetivos estão:

* manter a calculadora gratuita;
* disponibilizar o cálculo da AF;
* permitir cadastro e login;
* permitir que usuários cadastrados salvem até um semestre;
* revisar e remover dependências desnecessárias do antigo sistema Premium.

### **V3.1 — AdSense**

Revisar o site para adequação às diretrizes do Google AdSense e implementar a monetização por anúncios.

### **V3.1.X — Revisões do AdSense**

Realizar as alterações necessárias até a aprovação do site pela plataforma.

### **V3.2 — Premium Simplificado**

Reintroduzir uma assinatura Premium somente após estabilização da experiência gratuita e aprovação do AdSense.

A nova proposta deverá utilizar apenas um plano mensal e preservar a utilidade do produto gratuito.

### **V3.3 — Premium Orientado por Dados**

Evoluir o Premium utilizando dados reais de utilização e pesquisas com usuários cadastrados para identificar necessidades pelas quais exista disposição real para pagar.

---

# *Desenvolvimento*

O desenvolvimento da V3 segue alguns princípios:

* preservar uma experiência gratuita realmente útil;
* evitar complexidade técnica e comercial sem necessidade;
* utilizar dados reais antes de expandir a oferta Premium;
* manter regras de segurança também no backend e no Firestore;
* documentar alterações relevantes de arquitetura e produto;
* separar claramente funcionalidades atuais de funcionalidades planejadas.

---

# *Pendências conhecidas*

Estas pendências preexistentes não foram alteradas na limpeza técnica da V3:

* A exclusão de conta ainda não percorre semestres, matérias e médias armazenados em subcoleções.
* A troca de e-mail chama `syncEmail`, que não está exportada no backend local.
* A remoção de matérias na interface não exclui os documentos excedentes no próximo salvamento.

---

# *Segurança*

Informações sensíveis não devem ser armazenadas no repositório.

Arquivos e credenciais privadas, como:

```text
.env
functions/.env
service account keys
segredos de serviços
tokens privados
```

devem permanecer apenas nos ambientes apropriados.

As configurações públicas utilizadas pelo SDK web do Firebase não devem ser consideradas a camada de segurança da aplicação. O controle de acesso deve ser implementado por autenticação, regras do Firestore e validações no backend quando necessário.

---

# *Licença*

Copyright (c) 2026 Matheus Iannaccone

All Rights Reserved.

Este repositório é público apenas para fins de visualização.

Nenhuma parte deste código pode ser copiada, modificada, distribuída ou utilizada sem autorização explícita do autor.

---

# *Autor*

**Matheus Iannaccone**
