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

O projeto está atualmente em processo de evolução para a **V3**, que reorganiza a experiência gratuita da plataforma e simplifica sua lógica de negócio.

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

Algumas funcionalidades da versão anterior relacionadas ao Premium, Stripe, cupons e assinaturas permanecem no código durante o processo de migração para a V3, podendo ser modificadas ou removidas conforme o roadmap do projeto.

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
* **Stripe** — integração de pagamentos presente na versão anterior do modelo Premium.
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
│   │   ├── anuncios.js
│   │   ├── cadastro.js
│   │   ├── calcularAF.js
│   │   ├── coupon-validator.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── premium.js
│   │   ├── theme.js
│   │   ├── usuario.js
│   │   └── verificaPremium.js
│   │
│   ├── styles/
│   │   ├── anuncios.css
│   │   ├── coupon.css
│   │   ├── index.css
│   │   ├── login.css
│   │   ├── premium.css
│   │   ├── styles.css
│   │   └── usuario.css
│   │
│   ├── 404.html
│   ├── cadastro.html
│   ├── coupon.html
│   ├── index.html
│   ├── login.html
│   ├── premium.html
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

Responsável pelo carregamento dos semestres e informações acadêmicas armazenadas para o usuário.

### `mediaGlobal.js`

Responsável pela lógica relacionada ao cálculo da média global considerando os dados acadêmicos armazenados.

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

### `anuncios.js`

Contém lógica relacionada à exibição de anúncios presente na implementação anterior do projeto.

### `cadastro.js`

Controla o processo de criação de contas e integração do cadastro com o Firebase Authentication.

### `calcularAF.js`

Responsável pela lógica utilizada para calcular a nota necessária na AF.

### `coupon-validator.js`

Contém a lógica de validação de cupons implementada na versão anterior do modelo comercial.

### `index.js`

Script principal da calculadora e das interações da página inicial.

### `login.js`

Controla o processo de autenticação dos usuários.

### `premium.js`

Contém lógica relacionada ao sistema Premium da versão anterior.

### `theme.js`

Controla as preferências de aparência da interface, incluindo modo claro e escuro.

### `usuario.js`

Gerencia interações e funcionalidades da área do usuário.

### `verificaPremium.js`

Contém verificações de acesso relacionadas à implementação Premium anterior.

---

## 📁 `public/styles`

Contém os estilos da interface.

### `anuncios.css`

Estilos relacionados aos componentes de anúncios.

### `coupon.css`

Estilos utilizados pela interface de cupons.

### `index.css`

Estilos específicos da página principal.

### `login.css`

Estilos utilizados nas páginas de autenticação.

### `premium.css`

Estilos relacionados à interface Premium existente na versão anterior.

### `styles.css`

Contém estilos compartilhados e globais da aplicação.

### `usuario.css`

Estilos utilizados na área do usuário.

---

## 📁 `functions`

Contém as **Firebase Cloud Functions** utilizadas pelo projeto.

Essa camada concentra lógica executada no backend e integrações que não devem depender exclusivamente do navegador.

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

## `premium.html`

Página relacionada ao modelo Premium da versão anterior, atualmente sujeita a revisão durante o desenvolvimento da V3.

## `coupon.html`

Página associada ao sistema de cupons implementado na versão anterior.

## `sobre.html`

Página institucional com informações sobre o projeto.

## `404.html`

Página apresentada quando uma rota solicitada não é encontrada.

---

# *Roadmap Atual*

O CMU está entrando em uma nova etapa de desenvolvimento com a **V3**.

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

# *Segurança*

Informações sensíveis não devem ser armazenadas no repositório.

Arquivos e credenciais privadas, como:

```text
.env
functions/.env
service account keys
Stripe Secret Keys
webhook secrets
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
