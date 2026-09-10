# Handoff — Estado atual do fastify-boilerplate

> Documento gerado em 2026-09-09 para consolidar o estado real do projeto antes de uma proposta de refatoração. Todas as afirmações abaixo foram verificadas lendo o código em `main` (commit `ff8c355`), não apenas a documentação — onde código e docs divergem, isso está marcado explicitamente.
>
> As specs `000` a `007`, que documentam a construção incremental da V2, foram movidas para `specs/_archive/` (histórico preservado, fora do caminho ativo). Este documento é o novo ponto de partida.

## 1. O que o projeto é

Um **gerador de projetos Fastify** (`npx fastify-boilerplate`): CLI interativo ou não-interativo (`--profile`, `--traits`, `--projectName`) que grava no disco um app Node/TypeScript/Fastify pronto para rodar, com arquitetura, dependências fixas, lint e testes já configurados. Não é uma aplicação Fastify — é a ferramenta que gera aplicações Fastify.

## 2. Composição: duas gerações no mesmo repo

### V2 (`lib/v2/`) — é o único motor que o CLI executa hoje
- `core/catalog.js` — versões fixas de dependências (sem `latest`).
- `core/engine.js` — `renderProfile(profile, traits, outDir, projectName)`: funde profile + traits, resolve `package.json`, escreve o manifesto de arquivos.
- `core/types.d.ts` — contratos de tipos (`ProfileDefinition`, `TraitDefinition`).
- `profiles/*.js` — `minimal`, `modular`, `modular-pg-kysely`, `modular-postgres-sequelize`, `mvc`, `clean`.
- `templates/*/index.js` — conteúdo real dos arquivos gerados por profile.
- `traits/*.js` — `linter.js` (ESLint básico/Prettier), `precommit.js` (Husky+lint-staged), `testing.js` (node:test nativo/Vitest) — sistema "à la carte" acoplável a qualquer profile.

### V1 (`lib/scaffold/`, `lib/templates/`) — código morto, não desligado
- Confirmado por leitura de `bin/cli.js` e pelo diff do commit `6342f1b` (que reescreveu o CLI inteiro para V2): **nada em `bin/cli.js` importa `lib/scaffold` ou `lib/templates`**.
- Ainda assim, é mantido e testado isoladamente (`tests/deps.test.js`, `tests/writeBaseFiles*.test.js`, `tests/pkgjson.test.js`, `tests/makeFolders.test.js`, `tests/dbPlugin.test.js`, `tests/devcontainer.test.js`, `tests/eslintConfig.test.js`, `tests/fastifyDbTypes.test.js`, `tests/prismaSchema.test.js`, `tests/routeTemplates.test.js`, `tests/cli.test.js`) — 59 testes passando, mas exercitando um caminho que o usuário final nunca alcança.
- O `README.md` promete um "fluxo interativo legado (V1)" acessível via `npx fastify-boilerplate` para Sequelize/Knex/MVC — **isso não existe mais no `bin/cli.js` atual**. Todo o wizard interativo (incluindo o menu "🛠️ Personalizado") já é 100% V2.

## 3. Matriz real de profiles (verificado no código, não só na doc)

> **Atualizado — Fase 0 do roadmap concluída.** `docs/product/support-matrix.md` agora é
> *gerado* por `npm run docs:support-matrix` a partir do campo `status` de cada
> `lib/v2/profiles/*.js` (ver `scripts/generate-support-matrix.js`); as duas fontes não podem
> mais divergir sem que `npm run docs:support-matrix:check` (rodado em CI) quebre o build.

| Profile ID | `status` no arquivo do profile | Eval E2E existe? (`tests/v2/`) e verde | Observação |
|---|---|---|---|
| `minimal` | `supported` | `eval-minimal.test.js` — verde | Consistente. |
| `modular` | `supported` | `eval-modular.test.js` — verde | Consistente. |
| `modular-postgres-kysely` | `supported` | `eval-modular-pg.test.js` — verde | Consistente. |
| `modular-postgres-sequelize` | `supported` | `eval-modular-pg-sequelize.test.js` — verde | Consistente. |
| `mvc` | `experimental` (rebaixado nesta sessão) | **não existe** | Sem eval ainda — corrigir na Fase 2 (escrever eval e só então promover a `supported`). |
| `clean` | `experimental` (rebaixado nesta sessão) | **não existe** | Idem `mvc`. Além disso o profile está quebrado (TS2307 — ver achado 03 do roadmap); não deve ser promovido antes da Fase 2. |

`mvc` e `clean` também só geram um endpoint `/health` (sem CRUD de exemplo, sem persistência) — escopo bem menor que os profiles modulares.

## 4. Lacuna de execução de testes

> **Atualizado — Fase 0 concluída.** `package.json` agora divide os scripts:
> ```json
> "test": "npm run test:unit && npm run test:e2e",
> "test:unit": "node --test tests/*.test.js",
> "test:e2e": "node --test tests/v2"
> ```
> `node --test tests/v2` descobre recursivamente todos os arquivos de teste em `tests/v2/**`
> (confirmado — Node 18/20/22 fazem discovery recursivo de diretório passado a `--test`), então
> `npm test` agora roda os 59 testes do V1 morto **e** os 5 arquivos de `tests/v2/` (`core.test.js`
> + os 4 evals E2E). Os 4 evals estavam vermelhos por uma causa raiz identificada e corrigida: o
> `node --test` do processo pai injeta `NODE_TEST_CONTEXT=child-v8` no ambiente, e o `spawn()` de
> `runCommand` em cada eval herdava essa variável para o `npm test` do projeto gerado, trocando a
> saída TAP esperada por saída serializada V8 e quebrando o `assert` que procurava o texto do
> teste. Fix: cada `runCommand` agora remove `NODE_TEST_CONTEXT` do `env` passado ao `spawn`. Os
> 4 evals (`minimal`, `modular`, `modular-postgres-kysely` via Docker, `modular-postgres-sequelize`
> via Docker) foram executados de ponta a ponta nesta sessão e passam.
>
> Também existe agora `.github/workflows/ci.yml` (matriz Node 20/22, `npm ci` → check da
> support-matrix → `test:unit` → `test:e2e`) — antes não havia CI nenhum no repo.

## 5. Outras divergências doc vs. código

- `README.md` anuncia o fluxo V1 legado — não existe mais (ver seção 2).
- ~~`docs/product/support-matrix.md` marca `modular-postgres-kysely`/`-sequelize` como "compatibilidade" e `mvc`/`clean` como "experimental", mas os arquivos de profile em `lib/v2/profiles/` marcam todos como `status: 'supported'` — não há um único enum sendo respeitado nos dois lugares.~~ Resolvido na Fase 0: a matriz agora é gerada a partir do campo `status` (ver seção 3).
- `docs/migration/current-baseline-findings.md` documenta achados da V1 (imports inconsistentes de Knex, Kysely não registrado, `latest` gravado no projeto gerado, etc.) — como a V1 está morta no fluxo real, esses achados só importam se a V1 for reativada ou formalmente removida; hoje ficam pendurados sem dono.

## 6. Processo do repositório (spec-driven, ainda vigente)

- `AGENTS.md` e `.specify/memory/constitution.md` definem regras rígidas: nenhuma opção aparece no CLI sem contrato completo (CLI input → validação → capabilities → dependências → arquivos → runtime → docs/exemplo → eval); nada de `latest`; specs antes de implementação.
- `START-HERE.md` define a ordem de leitura para agentes: `AGENTS.md` → constituição → baseline → support-matrix → skill aplicável → spec ativa.
- As specs `000`–`007` (agora em `specs/_archive/`) registram a trajetória incremental da V2. Seus checklists de tarefas (`tasks.md`) estão majoritariamente **desmarcados** (`- [ ]`) mesmo para trabalho comprovadamente implementado (ex.: spec 001 e 003 têm profile/engine/templates funcionando no código, mas a maioria dos itens segue sem check) — **não use os checkboxes dessas specs como indicador de progresso**; o código é a fonte de verdade.

## 7. Riscos/decisões em aberto para a refatoração

1. Decidir o destino da V1 (`lib/scaffold/`, `lib/templates/`, seus 10 arquivos de teste): remover de vez ou formalizar remoção via spec/ADR, conforme a própria constituição exige (Art. II) — hoje é ambiguidade não resolvida. Deliberadamente adiado para a Fase 6 do roadmap: enquanto os evals do V2 estavam vermelhos, a V1 era a única rede de segurança do repo.
2. ~~Corrigir `npm test` para incluir `tests/v2/**`, ou dividir scripts (`test:unit`, `test:e2e`).~~ **Resolvido** — ver seção 4.
3. ~~Unificar a fonte de verdade de status por profile.~~ **Resolvido** — ver seção 3.
4. ~~Resolver `mvc`/`clean`: rebaixar `status` para `experimental`.~~ **Resolvido** nesta sessão. Falta ainda escrever os evals E2E de `mvc`/`clean` e corrigir o `clean` quebrado (TS2307) antes de promovê-los de volta a `supported` — isso é a Fase 2 do roadmap, não a Fase 0.
5. Atualizar `README.md` para remover a menção ao fluxo V1 legado, já inexistente. Ainda em aberto.
6. Decidir o que fazer com os achados de `docs/migration/current-baseline-findings.md` (fechar como resolvidos-por-remoção da V1, ou mover para uma spec de remoção formal). Ainda em aberto — depende do item 1.

## 8. Ambiente de teste verificado nesta sessão

Estado anterior (referência histórica):
```
$ npm test
# 59 testes, todos passando (apenas cobre lib/scaffold — V1 morta)
```
Os evals `tests/v2/*.test.js` não eram executados como parte do `npm test` padrão.

**Estado atual, após a Fase 0 do roadmap** (`docs` do artefato "Roadmap do primeiro comando"):
```
$ npm run test:unit   # 59 testes, V1 morta — inalterado
$ npm run test:e2e    # tests/v2/core.test.js + 4 evals E2E, todos verdes
```
Os 4 evals foram executados de ponta a ponta nesta sessão (incluindo os dois que sobem
Postgres via `docker compose`) e passam. `npm test` agora roda os dois grupos em sequência.
`.github/workflows/ci.yml` reproduz isso em CI (Node 20 e 22) e também falha se
`docs/product/support-matrix.md` ficar desatualizado em relação ao campo `status` dos profiles.
