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
| `mvc` | `supported` (promovido na Fase 2) | `eval-mvc.test.js` — verde | Ganhou eval próprio; consistente. |
| `clean` | `supported` (promovido na Fase 2) | `eval-clean.test.js` — verde | TS2307 corrigido (achado 03) e eval próprio adicionado; consistente. |

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
4. ~~Resolver `mvc`/`clean`: rebaixar `status` para `experimental`, escrever eval E2E e corrigir o `clean` quebrado (TS2307).~~ **Resolvido** — ver seção 10 (Fase 2).
5. Atualizar `README.md` para remover a menção ao fluxo V1 legado, já inexistente. Ainda em aberto.
6. Decidir o que fazer com os achados de `docs/migration/current-baseline-findings.md` (fechar como resolvidos-por-remoção da V1, ou mover para uma spec de remoção formal). Ainda em aberto — depende do item 1.

## 8. Fase 1 do roadmap — honrar `npm install && npm run dev`

Implementada nesta sessão (achados 01, 02, 12 do roadmap "Roadmap do primeiro comando"):

- `lib/v2/core/engine.js` agora grava `.env` ao lado de `.env.example` com os mesmos valores de
  dev (mecanismo genérico: qualquer profile que declare `.env.example` ganha `.env` de graça).
  Resolve achado 01 — antes o app quebrava com stack trace no primeiro `npm run dev` porque
  `database.ts` chama `loadEnv()` no topo do módulo e `DATABASE_URL` nunca existia sem cópia manual.
- `ProfileDefinition` ganhou um campo opcional `scripts` (mesclado em `combinedScripts` no
  engine, mesmo mecanismo que já existia para `trait.scripts`). Os profiles `modular-postgres-kysely`
  e `modular-postgres-sequelize` agora declaram `db:migrate`, `db:seed`, `db:reset`, `predev` e
  `dev:no-infra`. Resolve achado 02 — `npm run db:migrate`, que o CLI já mandava rodar, agora existe.
- `predev` sobe o Postgres (`docker compose up -d --wait`), roda a migration e o seed antes do
  `dev` — `npm run dev` é literalmente o único comando, com `dev:no-infra` como escape para quem
  já tem um Postgres próprio.
- `docker-compose.yml` dos dois profiles Postgres ganhou `healthcheck` (`pg_isready`) e volume
  nomeado (resolve achado 12 — antes `docker compose down` sem `-v` já não devia apagar dados, mas
  não havia volume nomeado nenhum, e não havia como o `--wait` do compose saber quando o banco
  estava pronto).
- Novo `src/db/scripts/seed.ts` em cada profile Postgres (idempotente — `ON CONFLICT DO NOTHING`
  no Kysely, `findOrCreate` no Sequelize) garante que o primeiro `GET /users` já tem dado.
- `bin/cli.js` ganhou `--install` (roda o package manager) e `--git` (init + commit inicial).
  Achado de sessão: a primeira implementação usava `spawnSync(..., { shell: true })` para o
  `git commit -m "<mensagem com espaços>"`, e o shell quebrava a mensagem em argumentos soltos
  (`git commit -m chore: scaffold inicial...` virava 4 pathspecs inválidos). Corrigido removendo
  `shell: true` das chamadas `git` (não precisam de shell; só `npm install` continua com
  `shell: true`, necessário no Windows para resolver `npm.cmd`).
- Novo eval `tests/v2/eval-first-command.test.js`: gera cada profile em diretório limpo, roda
  **só** `npm install` e `npm run dev` (processo em background, próprio grupo de processos para
  poder derrubar `predev`/`tsx watch`/node respawnado de uma vez), confere `/health` (todos) e
  `/ready` + `GET /users` com dado seedado (profiles Postgres). Cobre `minimal`, `modular`, `mvc`,
  `modular-postgres-kysely`, `modular-postgres-sequelize` — os 5 profiles que já funcionam.
  `clean` entra como `test(..., { skip: '...' })` explícito, não como lacuna silenciosa: está
  quebrado por um bug não relacionado (achado 03, TS2307), cujo conserto é escopo da Fase 2.
- Os evals antigos `eval-modular-pg.test.js`/`eval-modular-pg-sequelize.test.js` foram atualizados
  para consumir os novos scripts (`npm run db:migrate`, `docker compose up -d --wait`) em vez dos
  workarounds manuais (`cp .env.example .env`, `npx tsx .../migrate.ts`, polling de porta) que
  existiam só porque esses achados ainda não tinham sido corrigidos.

Verificado rodando de ponta a ponta (`npm test` completo, e manualmente com `curl` contra
`/health`, `/ready` e `/users` nos dois profiles Postgres) — sem falhas, sem containers/processos
órfãos após teardown.

**Em aberto ao final da Fase 1, resolvido na Fase 2 (seção 9 abaixo):** `mvc`/`clean` continuavam
`experimental` — o eval desta fase provava que o "primeiro comando" funcionava para `mvc`, mas não
substituía o eval completo (lint+build+test+contrato) nem cobria `clean`, que estava quebrado.

## 9. Fase 2 do roadmap — consertar o que está quebrado

Implementada nesta sessão (achados 03, 04, 14, 16 do roadmap "Roadmap do primeiro comando"):

- **`clean` corrigido (achado 03).** Dois bugs de import, não um: (1) `app.ts` vive em
  `src/infrastructure/web/fastify/app.ts`, mas importava `healthRoutes` de
  `'./infrastructure/web/routes/health.route.js'` — um caminho que só faria sentido se `app.ts`
  estivesse em `src/`; corrigido para `'../routes/health.route.js'` (routes/ e fastify/ são irmãos
  sob web/). (2) `server.ts` era herdado do `minimal` e importava `buildApp` de `'./app.js'`
  (mesmo diretório), mas o `app.ts` do `clean` não está em `src/`; `clean` ganhou seu próprio
  `serverContent` com o import correto (`'./infrastructure/web/fastify/app.js'`). `npm run build`
  agora passa sem TS2307.
- **Evals novos `tests/v2/eval-mvc.test.js` e `tests/v2/eval-clean.test.js`** (mesmo padrão dos
  evals existentes: gerar → install → lint → build → test). Ambos verdes — `mvc` e `clean`
  promovidos de volta a `status: 'supported'` em `lib/v2/profiles/*.js`, e
  `docs/product/support-matrix.md` regenerado (`npm run docs:support-matrix`) refletindo isso.
- **Achado 04 (Vitest quebrava a suíte) resolvido de verdade, não só contornado.** Causa raiz: os
  arquivos `tests/*.test.ts` eram fixos por profile e sempre escritos em sintaxe `node:test`,
  independente do trait de teste escolhido — trocar para Vitest trocava só o *runner*, não o
  conteúdo dos testes. `ProfileDefinition` ganhou um campo `testFiles: Record<traitId,
  FileManifest[]>`; a engine agora escolhe o conjunto certo (`node-native-test` ou `vitest`)
  conforme o trait ativo, e escreve nenhum arquivo de teste se nenhum trait de teste estiver
  ativo. Os 8 arquivos de teste dos 6 profiles ganharam uma versão Vitest irmã (subtestes
  `t.test()` do node:test viraram `describe`/`test` com `beforeAll`/`afterAll` no Vitest).
  Verificado de ponta a ponta com `--traits vitest` nos profiles `modular`,
  `modular-postgres-kysely` e `modular-postgres-sequelize` (este último com Docker real): todos os
  testes (incluindo os que dependem de ordem de execução, como o fluxo de CRUD de usuários)
  passam.
- **Achado 16 (Husky sem `+x`) resolvido.** `FileManifest` ganhou um campo opcional `mode`; a
  engine aplica `fsp.chmod` depois de escrever o arquivo. O hook `.husky/pre-commit` agora nasce
  `-rwxr-xr-x` (confirmado gerando um projeto com o trait `husky-lint-staged`).
- **Achado 14 (logs de produção poluindo `npm test`) resolvido.** Os scripts `test` dos traits
  `node-native-test` e `vitest` agora começam com `NODE_ENV=test` — antes `buildApp()` só desligava
  o logger com `NODE_ENV !== 'test'`, mas nada definia essa variável no script gerado.
- **"Nenhum" agora desliga o default da categoria (parte do achado sobre traits).** No wizard
  customizado, escolher "Nenhum" para linter ou framework de testes empurrava `selectedTraits`
  sem nada — mas o `Set` de traits finais começava com `profile.defaultTraits` (que sempre inclui
  `eslint-basic` e `node-native-test`) e nada removia esses defaults. Agora "Nenhum" empurra um
  sentinel (`disable:eslint` / `disable:test`) que a resolução de traits usa para de fato remover
  o default da categoria antes de aplicar a escolha do usuário. Confirmado via `--traits
  disable:eslint,disable:test`: `package.json` gerado sem `lint`/`test` e sem a pasta `tests/`.

Verificado com `npm test` completo: **15 testes, 0 falhas, 0 skips** (antes: 1 skip documentado
para `clean`) — a matriz dos 6 profiles × lint/build/test está toda verde, cumprindo o critério de
saída da Fase 2.

## 10. Ambiente de teste verificado nesta sessão

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
