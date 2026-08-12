# CMU — Codex Instructions

## Project

CMU (Calculadora de Médias Universitárias) is a Firebase web application.

Current development target:
V3 — Free MVP.

Before making changes, read:

- Docs/CMU_V3_Roadmap_de_Alteracoes.txt
- Docs/CMU_V3_Logica_de_Negocio_e_Versionamento.txt

These documents define the product scope and have priority over assumptions about
the previous V2 implementation.

## Current architecture

Frontend:
- public/

Firebase Cloud Functions:
- functions/

Firestore security:
- firestore.rules

Firestore indexes:
- firestore.indexes.json

Firebase configuration:
- firebase.json

## Source of truth

The frontend source of truth is:

public/

Do not use another duplicated frontend directory as a source.

## Current V3 scope

Implement only the V3 Free MVP.

Main objectives:

- remove the previous Premium presentation and restrictions;
- preserve useful existing free features;
- make AF calculation available to free users;
- preserve registration and login;
- allow a registered user to save up to one semester;
- allow that semester to be viewed and edited;
- enforce the one-semester limit consistently in UI, application logic and
  Firestore security.

## Out of scope

Do NOT implement yet:

- Google AdSense;
- V3.1 features;
- new Premium subscription;
- V3.2 features;
- V3.3 features;
- new pricing models;
- new Stripe checkout flows.

Legacy Premium/Stripe code may be removed or disabled when required by the V3
roadmap, but do not redesign the future Premium system.

## Safety

Never expose, print, commit or modify secrets unnecessarily.

Do not read or expose:
- .env
- functions/.env

Never hardcode secret keys.

## Ignored/generated directories

Do not inspect or modify unless explicitly requested:

- node_modules/
- functions/node_modules/
- .git/
- Backup/
- .firebase/
- log files

## Working rules

Before making a large or architectural change:

1. inspect the affected code;
2. explain the current behavior;
3. identify the files that need modification;
4. prefer small and isolated changes;
5. preserve unrelated existing behavior.

Do not rewrite entire files when a targeted modification is sufficient.

After meaningful changes, check for:
- JavaScript errors;
- broken imports;
- authentication regressions;
- Firestore permission problems;
- responsive layout regressions.