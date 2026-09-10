# ADR-004 — Remover o motor V1 (`lib/scaffold`, `lib/templates`, `lib/examples`)

- **Status:** aceita
- **Data:** 2026-09-10

## Contexto

Desde a reescrita que introduziu o motor V2 (commit `6342f1b`), `bin/cli.js` não importa mais nada
de `lib/scaffold/`, `lib/templates/` (as pastas `ts/`, `common/`, `js/` — não confundir com
`lib/v2/templates/`) ou `lib/examples/`. Ainda assim essas ~2.000 linhas continuavam versionadas e
cobertas por 11 arquivos de teste próprios, e o `README.md` anunciava um "fluxo interativo legado
(V1)" que não existe mais em nenhum caminho alcançável pelo CLI.

A remoção foi deliberadamente adiada até agora (roadmap "Primeiro comando", Fase 6 — ver
`HANDOFF.md`): enquanto os evals E2E do V2 estavam vermelhos e fora do `npm test` padrão (Fase 0),
a V1 era a única suíte que de fato rodava e passava, mesmo cobrindo um caminho que o usuário final
nunca alcança. Depois da Fase 0 (evals V2 no `npm test`, CI publicado) ela virou só peso morto: a
Constituição do repositório, Artigo II ("Contratos antes de opções"), já não permitiria anunciar
essas opções hoje — nenhuma delas tem o contrato completo (capabilities, dependências, arquivos,
runtime, exemplo, eval) que o próprio artigo exige.

## Decisão

Remover completamente:

- `lib/scaffold/` (4 arquivos);
- `lib/templates/` — as subpastas `ts/`, `common/`, `js/` (V1); `lib/v2/templates/` não é afetado;
- `lib/examples/` (todos os exemplos de MVC/Modular/Clean em JS e TS gerados pelo fluxo antigo);
- `test-generation.js` (script manual de smoke test do V1, na raiz do repo);
- `TESTING.md` (documentava exclusivamente a cobertura do V1, já desatualizado mesmo antes desta
  remoção);
- os 11 arquivos de teste que só existiam para cobrir essas pastas: `tests/deps.test.js`,
  `tests/writeBaseFiles.test.js`, `tests/writeBaseFilesExtended.test.js`, `tests/pkgjson.test.js`,
  `tests/makeFolders.test.js`, `tests/dbPlugin.test.js`, `tests/devcontainer.test.js`,
  `tests/eslintConfig.test.js`, `tests/fastifyDbTypes.test.js`, `tests/prismaSchema.test.js`,
  `tests/routeTemplates.test.js`.

`docs/migration/current-baseline-findings.md` (o baseline que originou a migração V1 → V2) é
fechado como resolvido-por-remoção, não apagado — os achados que registra deixam de ter código
correspondente, mas o histórico da decisão permanece rastreável.

## Consequências

- O único motor que o CLI executa (`lib/v2/`) passa a ser o único motor que existe no repositório —
  não há mais nenhuma ambiguidade entre o que é anunciado e o que é gerado.
- `npm test` (`test:unit` + `test:e2e`) fica menor e 100% relevante: nada mais testa um caminho
  inalcançável.
- `README.md` perde a seção "Fluxo Interativo Legado (V1)" e é reescrito para descrever só os
  profiles reais do V2 (`minimal`, `modular`, `modular-cors`, `modular-postgres-kysely`,
  `modular-postgres-sequelize`, `mvc`, `clean`).
- Dependências do `package.json` que só o V1 usava (`chalk`, `ejs`, `fs-extra`, e a dependência
  `path` — que nunca fazia efeito, já que o módulo nativo `node:path` sempre tem precedência sobre
  um pacote npm de mesmo nome) saem do manifesto.
- Não há impacto adicional para quem consome a versão publicada atual: `2.0.0` (a mais recente no
  npm, `npm view fastify-boilerplate versions`) já reescreveu `bin/cli.js` para usar só o motor V2 —
  o wizard V1 era alcançável em versões publicadas anteriores (`1.0.4-beta.0` a `1.0.5-beta.6`), mas
  ninguém instalando a versão atual do pacote consegue chegar nele há muito tempo. Esta remoção
  apaga o código-fonte morto; não muda o comportamento de nenhuma versão já publicada.
