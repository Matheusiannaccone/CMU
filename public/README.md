# __CMU — Calculadora de Médias Universitárias__

**Versão atual:** V3

Aplicação web desenvolvida para ajudar estudantes universitários a calcular suas médias acadêmicas de forma rápida e automática.
A ferramenta permite inserir notas de avaliações e descobrir imediatamente se o aluno está aprovado ou quanto precisa tirar para alcançar a média mínima.

**Acesse o projeto:**
https://calculadora-medias-universitarias.vercel.app/

---

# _Sobre o Projeto_
A **Calculadora de Médias Universitárias (CMU)** foi criada para simplificar o cálculo de notas durante a graduação.

Muitos estudantes precisam calcular manualmente médias ponderadas entre avaliações como:

- AC1
- AC2
- AF
- AG
- AS

O sistema permite inserir as notas e automaticamente calcular a média com base nos pesos definidos pelas universidades.
Ferramentas desse tipo ajudam estudantes a entender rapidamente quanto precisam tirar para atingir a média necessária para aprovação.

---

# _Funcionalidades_
- Inserção de notas das avaliações.
- Cálculo automático da média final.
- Simulação de nota necessária para aprovação.
- Interface simples e rápida.
- Funciona diretamente no navegador.
- Sem necessidade de login para o cálculo.
- Notas salvas no Firestore para (somente com login).

---

# _Tecnologias Utilizadas_
O projeto foi desenvolvido utilizando tecnologias web fundamentais:

- **HTML5** — Estrutura da aplicação
- **CSS3** — Estilização da interface
- **JavaScript** — Lógica de cálculo das médias
- **Firebase** — Banco de dados e autenticação de usuário
- **Vercel** — Deploy da aplicação

---

# _Estrutura do Projeto_
```
CMU
│
├── firebase
│   └── config.js
│
├── firestore
│   ├── carregarSemestres.js
│   ├── mediaGlobal.js
│   └── salvarNotas.js
│
├── images
│   ├── logo.png
│   └── usuario.png
│
├── js
│   ├── cadastro.js
│   ├── calcularAF.js
│   ├── config.js
│   ├── index.js
│   ├── login.js
│   ├── sobre.js
│   ├── theme.js
│   └── usuario.js
│
├── styles
│   ├── index.css
│   ├── login.css
│   ├── styles.css
│   └── usuario.css
│
├── 404.html
├── cadastro.html
├── index.html
├── login.html
├── sobre.html
├── usuario.html
│
└── README.md
```

---

# _Descrição das Principais Partes_
## 📁 firebase
Contém a configuração de conexão com o Firebase, responsável pela autenticação de usuários e armazenamento de dados.

**config.js** 
Configuração e inicialização do Firebase, incluindo autenticação e conexão com o Firestore.


## 📁 firestore
Scripts responsáveis pela interação com o banco de dados Firestore, incluindo leitura e gravação das informações do usuário.

**carregarSemestres.js** 
Carrega do Firestore os semestres e matérias salvos pelo usuário.

**mediaGlobal.js**
Calcula a média geral do usuário considerando todas as disciplinas registradas.

**salvarNotas.js**
Salva as notas inseridas pelo usuário organizadas na estrutura:
usuário → semestre → matéria → nota.

## 📁 images
Armazena os recursos visuais utilizados na interface da aplicação.

**logo.png**
Logotipo da aplicação exibido no site.

**usuario.png**
Imagem ou ícone padrão utilizado na área do usuário.

## 📁 js
Contém os scripts principais da aplicação, responsáveis pela lógica de funcionamento da interface e das funcionalidades do sistema.

**cadastro.js**
Controla o processo de cadastro de novos usuários utilizando Firebase Authentication.

**calcularAF.js**
Função para calcular a nota mínima necessária para atingir a média definida pelo usuário (média padrão 5).

**config.js**
Configura a versão atual do site para evitar campos de versionamento desatualizados.

**index.js**
Script principal da página inicial, responsável pelas funcionalidades da calculadora de médias.

**login.js**
Responsável pela autenticação e login dos usuários no sistema.

**sobre.js**
Responsável por aplicar a versão atual no rodapé da página.

**theme.js**
Controla o tema da interface, como modo claro e modo escuro.

**usuario.js**
Gerencia as informações e interações da área do usuário.

## 📁 styles
Arquivos responsáveis pela estilização visual da aplicação.

**index.css**
Estilização da página principal do site.

**login.css**
Estilização das páginas de login e autenticação.

**styles.css**
Arquivo de estilos globais da aplicação.

**usuario.css**
Estilos da área de perfil e painel do usuário.

## 📄 Páginas HTML
Arquivos responsáveis pela estrutura das páginas do site.

**index.html**
Página principal da calculadora de médias.

**login.html**
Página de login para acesso dos usuários.

**cadastro.html**
Página para criação de novas contas.

**usuario.html**
Área do usuário com acesso às suas informações e dados salvos.

**sobre.html**
Página institucional com informações sobre o projeto.

**404.html**
Página exibida quando uma rota não é encontrada.

---

# _Melhorias Futuras_
Algumas melhorias planejadas para o projeto:

- Foto de perfil personalizada;
- Sistema de suporte ao usuário;
- Suporte para múltiplas universidades;
- Histórico de desempenho e recursos para análise de longo prazo;
- Melhorias de navegação e experiência geral do usuário;
- Desenvolvimento de funcionalidades avançadas com base no uso real e no feedback dos usuários;
- Expansão gradual do suporte para diferentes necessidades e contextos acadêmicos.

---
# _Licença_ 
Copyright (c) 2026 Matheus Iannaccone da Rosa

All Rights Reserved.

Este repositório é público apenas para fins de visualização.
Nenhuma parte deste código pode ser copiada, modificada, distribuída ou utilizada sem autorização explícita do autor.

---

# _Autor_
Matheus Iannaccone da Rosa