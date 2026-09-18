# **CMU — Calculadora de Médias Universitárias**

Aplicação web desenvolvida para ajudar estudantes universitários a calcular, acompanhar e entender suas médias acadêmicas ao longo do semestre.

**Versão atual:** V3.1  
**Site:** https://calculadora-medias-universitarias.vercel.app/

---

## Sobre o projeto

O CMU permite organizar matérias, inserir notas e calcular automaticamente:

- média de cada matéria;
- média geral do semestre;
- nota necessária na AF;
- impacto da AS sobre a média.

A calculadora pode ser utilizada sem cadastro.

Usuários autenticados também podem salvar e editar um semestre para acompanhar suas notas posteriormente.

O CMU é um projeto independente desenvolvido por **Matheus Iannaccone** e não representa oficialmente a Facens ou outras instituições de ensino.

---

## Funcionalidades

### Calculadora

- Inserção de até 8 matérias.
- Notas entre 0 e 10.
- Cálculo automático da média.
- Cálculo da AF necessária.
- Aplicação automática da AS quando ela melhora o resultado.
- Média geral das matérias do semestre.
- Funcionamento sem necessidade de login.

### Conta do usuário

- Cadastro.
- Login e logout.
- Edição de nome e sobrenome.
- Configuração da média mínima.
- Alteração de e-mail.
- Alteração de senha.
- Salvamento e edição de um semestre.

Usuários comuns possuem acesso a um único semestre.

Contas autorizadas pela Custom Claim `multiSemester` podem utilizar o fluxo especial de múltiplos semestres.

---

## Regras de cálculo

A média utilizada atualmente pelo CMU segue:

```text
Média =
(AC1 × 0,15) +
(AC2 × 0,30) +
(AF  × 0,45) +
(AG  × 0,10)
```

Pesos:

| Avaliação | Peso |
| --- | ---: |
| AC1 | 15% |
| AC2 | 30% |
| AF | 45% |
| AG | 10% |

A AS não possui peso próprio.

Quando preenchida, o CMU testa sua substituição em cada uma das notas já existentes e mantém apenas a alternativa que produzir a maior média.

Notas não preenchidas não redistribuem seus pesos.

### AF necessária

O cálculo da AF necessária utiliza:

```text
AF necessária =
[meta − (AC1 × 0,15 + AC2 × 0,30 + AG × 0,10)] ÷ 0,45
```

AC1 e AC2 precisam estar preenchidas.

Se AG estiver vazia, sua contribuição é considerada zero.

---

## V3.1

A V3.1 concentra a reformulação da experiência pública do CMU e a preparação para Google AdSense.

Entre as principais alterações estão:

- nova navegação pública;
- página de Contato;
- Política de Privacidade;
- revisão da página Sobre;
- página 404 própria;
- conteúdo explicativo sobre os cálculos;
- melhorias de acessibilidade;
- melhorias de responsividade;
- SEO técnico;
- `robots.txt`;
- `sitemap.xml`;
- metadados Open Graph;
- integração com Google Search Console;
- integração inicial com Google AdSense;
- `ads.txt`;
- preparação para gerenciamento de consentimento.

A presença da integração do AdSense não significa que anúncios serão necessariamente exibidos em todas as visitas. A veiculação depende das configurações e da aprovação do Google.

---

## Páginas

### Públicas e indexáveis

- `index.html` — calculadora e conteúdo explicativo;
- `sobre.html` — informações sobre o projeto;
- `contato.html` — canal oficial de contato;
- `privacidade.html` — Política de Privacidade.

### Operacionais

- `login.html`;
- `cadastro.html`;
- `usuario.html`;
- `404.html`.

As páginas operacionais não fazem parte do conteúdo principal destinado à indexação.

---

## Tecnologias

### Front-end

- HTML5
- CSS3
- JavaScript ES Modules

### Backend e dados

- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- Firebase App Check
- Google reCAPTCHA

### Infraestrutura

- Vercel
- Firebase CLI
- Firebase Emulator Suite

### Testes

- Playwright
- Node.js

### Serviços externos

- Google Search Console
- Google AdSense

---

## Estrutura do projeto

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
│   └── ...
│
├── public/
│   │
│   ├── firebase/
│   ├── firestore/
│   ├── images/
│   ├── js/
│   ├── styles/
│   ├── 404.html
│   ├── ads.txt
│   ├── cadastro.html
│   ├── contato.html
│   ├── index.html
│   ├── login.html
│   ├── privacidade.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── sobre.html
│   └── usuario.html
│
├── tests/
│   └── e2e/
│
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── playwright.config.js
└── README.md
```

---

## Backend

As Firebase Cloud Functions mantêm operações que não devem depender apenas do cliente, incluindo:

- resolução do semestre único;
- validação do reCAPTCHA;
- sincronização segura do e-mail;
- criação de dados privados da conta;
- exclusão de conta;
- exclusão dos dados associados.

As regras do Firestore controlam o acesso aos dados e preservam o fluxo especial das contas com `multiSemester`.

---

## Testes E2E

Os testes E2E utilizam os emuladores de:

- Authentication;
- Firestore;
- Functions;
- Hosting.

---

## Segurança

Credenciais privadas não devem ser armazenadas no repositório.

Exemplos:

```text
.env
functions/.env
service account keys
tokens privados
segredos de serviços
```

As configurações públicas do Firebase Web SDK não são utilizadas como mecanismo de segurança.

O controle de acesso depende de:

- Firebase Authentication;
- Firestore Security Rules;
- validações no backend;
- App Check;
- reCAPTCHA.

---

## Privacidade e publicidade

O CMU possui uma Política de Privacidade pública descrevendo os dados tratados pela aplicação e os serviços externos utilizados.

A homepage possui integração técnica com Google AdSense.

O projeto também possui:

```text
public/ads.txt
```

com a identificação oficial da conta utilizada para publicidade.

Configurações relacionadas a consentimento e mensagens regulatórias são gerenciadas separadamente pelo Google AdSense.

---

## Documentação

A pasta `Docs/` contém os documentos principais de produto e evolução:

### `CMU_V3_Logica_de_Negocio_e_Versionamento.txt`

Define:

- lógica de negócio da V3;
- experiência gratuita;
- estratégia futura de monetização;
- estratégia de versionamento.

### `CMU_V3_Roadmap_de_Alteracoes.txt`

Define:

- ordem das versões;
- dependências entre etapas;
- objetivos de cada fase;
- critérios gerais de evolução do projeto.

---

## Licença

Copyright (c) 2026 Matheus Iannaccone

All Rights Reserved.

Este repositório é público apenas para fins de visualização.

Nenhuma parte deste código pode ser copiada, modificada, distribuída ou utilizada sem autorização explícita do autor.

---

## Autor

**Matheus Iannaccone**
