# Handoff — Estado atual do fastify-boilerplate

> Documento gerado em 2026-09-09 para consolidar o estado real do projeto antes de uma proposta de refatoração (`main` em `ff8c355` na época), e mantido ao longo das sete fases do roadmap "Primeiro comando" que se seguiram. **Atualizado em 2026-09-10**: o roadmap está completo — `main` em `17ffc42`, `v2.1.0` publicado no npm (ver seção 14). As seções 8–14 documentam cada fase; onde código e docs divergiam em algum ponto, isso está marcado explicitamente no histórico abaixo em vez de reescrito.
>
> As specs `000` a `007`, que documentam a construção incremental da V2, foram movidas para `specs/_archive/` (histórico preservado, fora do caminho ativo). Este documento é o ponto de partida para entender o estado atual do repositório.

## 1. O que o projeto é

Um **gerador de projetos Fastify** (`npx fastify-boilerplate`): CLI interativo ou não-interativo (`--profile`, `--traits`, `--projectName`) que grava no disco um app Node/TypeScript/Fastify pronto para rodar, com arquitetura, dependências fixas, lint e testes já configurados. Não é uma aplicação Fastify — é a ferramenta que gera aplicações Fastify.

## 2. Composição: duas gerações no mesmo repo

### V2 (`lib/v2/`) — é o único motor que o CLI executa hoje
- `core/catalog.js` — versões fixas de dependências (sem `latest`).
- `core/engine.js` — `renderProfile(profile, traits, outDir, projectName)`: funde profile + traits, resolve `package.json`, escreve o manifesto de arquivos.
- `core/compose.js` — `composeProfile({ architecture, baseFiles, baseDependencies, capability, ... })`: monta um `ProfileDefinition` a partir de uma arquitetura-base + uma capability de persistência (ver seção 10, Fase 3).
- `core/types.d.ts` — contratos de tipos (`ProfileDefinition`, `TraitDefinition`, `Capability`).
- `profiles/*.js` — `minimal`, `modular`, `modular-cors`, `modular-pg-kysely`, `modular-postgres-sequelize`, `mvc`, `clean`. Os dois profiles Postgres são "receitas" curtas (`composeProfile(...)`) desde a Fase 3, não manifestos de arquivo por arquivo; `modular-cors` (Fase 5) é montado à mão, reaproveitando os arquivos do `modular`.
- `templates/*/index.js` — conteúdo real dos arquivos gerados por profile (`minimal`, `modular`, `mvc`, `clean` — os dois profiles Postgres e o `modular-cors` não têm `templates/` próprio; reaproveitam `modular`/`modular-persisted`).
- `architectures/modular-persisted.js` — núcleo HTTP compartilhado entre capabilities de persistência da arquitetura modular (error handler, not-found handler, rotas/schema/handler de users, `buildAppTsContent(fragment)`).
- `capabilities/*.js` — `postgres-kysely.js`, `postgres-sequelize.js` (persistência), `postgres-shared.js` (infra comum às duas: `.env.example`, `docker-compose.yml`, `config/env.ts`) e `cors.js` (plataforma, Fase 5 — sem infra nem env própria).
- `traits/*.js` — `linter.js` (ESLint básico/Prettier), `precommit.js` (Husky+lint-staged), `testing.js` (node:test nativo/Vitest) — sistema "à la carte" acoplável a qualquer profile.

### V1 — removida na Fase 6 do roadmap ([ADR-004](docs/adr/ADR-004-remocao-v1.md))
`lib/scaffold/`, `lib/templates/{js,common,ts}` e `lib/examples/` (e os 11 testes que só existiam
para cobri-los) foram apagados do repositório — não havia nenhum caminho em `bin/cli.js` que os
alcançasse desde a reescrita para V2 (commit `6342f1b`). O motor V2 é hoje o único motor que existe
no repositório, não só o único que o CLI executa. Detalhes da decisão e do que foi removido: seção
14 abaixo e o ADR.

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

1. ~~Decidir o destino da V1 (`lib/scaffold/`, `lib/templates/`, seus arquivos de teste): remover de vez ou formalizar remoção via spec/ADR, conforme a própria constituição exige (Art. II).~~ **Resolvido** — ver [ADR-004](docs/adr/ADR-004-remocao-v1.md) e seção 14 (Fase 6).
2. ~~Corrigir `npm test` para incluir `tests/v2/**`, ou dividir scripts (`test:unit`, `test:e2e`).~~ **Resolvido** — ver seção 4.
3. ~~Unificar a fonte de verdade de status por profile.~~ **Resolvido** — ver seção 3.
4. ~~Resolver `mvc`/`clean`: rebaixar `status` para `experimental`, escrever eval E2E e corrigir o `clean` quebrado (TS2307).~~ **Resolvido** — ver seção 10 (Fase 2).
5. ~~Atualizar `README.md` para remover a menção ao fluxo V1 legado, já inexistente.~~ **Resolvido** — ver seção 14 (Fase 6).
6. ~~Decidir o que fazer com os achados de `docs/migration/current-baseline-findings.md`.~~ **Resolvido** — fechado como resolvido-por-remoção, ver seção 14 (Fase 6).

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

## 10. Fase 3 do roadmap — componentização real da engine

Escopo desta rodada, decidido explicitamente com o usuário antes de começar: **só o núcleo da
arquitetura de capabilities + eliminar a duplicação real e medida** entre
`modular-pg-kysely`/`-sequelize`. Ficou de fora, por decisão consciente (não por esquecimento):
persistência para `mvc`/`clean` (o wizard continua avisando "ainda em desenvolvimento" para essas
combinações), validação declarativa de compatibilidade, e o eval que geraria a matriz combinatória
— nenhuma combinação nova foi criada, então não há matriz nova pra validar ainda.

**O que mudou:**

- **Tipo `Capability` introduzido** em `core/types.d.ts`: `{ id, kind, dependencies, files,
  scripts, testFiles, composeServices, appFragment }`. `composeServices` está declarado mas ainda
  não tem lógica de merge real — só existe uma capability de infra por profile hoje, então
  escrever esse merge agora seria especular sem um segundo caso pra validar contra (fica pra
  quando o catálogo crescer, Fase 5).
- **`core/compose.js`**: `composeProfile({ architecture, baseFiles, baseDependencies, capability,
  ... })` monta o `ProfileDefinition` final juntando a arquitetura-base com uma capability. Os
  profiles `modular-pg-kysely.js` e `modular-postgres-sequelize.js` viraram receitas de ~30
  linhas cada — antes eram um manifesto de ~35 entradas de arquivo apontando pra um template de
  400+ linhas cada.
- **Duplicação real eliminada.** Medição antes de tocar em nada:
  `usersRouteContent`/`usersHandlerContent` eram byte-a-byte idênticos entre kysely, sequelize
  **e** o modular puro; `usersSchemaContent`, `envFileContent`, `configEnvContent` e
  `dockerComposeContent` eram idênticos entre kysely e sequelize; `appTsContent` diferia em só 2
  linhas (import + registro do plugin de banco) nos ~60 do arquivo. Esse núcleo agora vive uma
  vez só:
  - `architectures/modular-persisted.js` — error handler, not-found handler, rotas/schema/handler
    de users, e `buildAppTsContent(fragment)` (função, não string fixa: monta o app.ts a partir
    do fragmento que a capability injeta — imports, se precisa de `loadEnv()`, e a linha de
    registro do plugin).
  - `capabilities/postgres-shared.js` — `.env.example`, `docker-compose.yml`, `config/env.ts`.
    Deliberadamente **não** ficou em `architectures/`: são específicos de "que infra a
    persistência precisa", não da arquitetura HTTP. Kysely e Sequelize compartilham porque as
    duas sobem o mesmo Postgres — uma capability de MySQL não reusaria este módulo, traria o
    próprio compose.
  - `lib/v2/templates/modular-pg-kysely/` e `modular-pg-sequelize/` (951 linhas somadas, ~80%
    duplicadas) foram **apagados por completo** — nada mais importa esses caminhos.
- **Verificação de que o refactor preserva comportamento** (não só "parece certo"): gerei os
  dois profiles antes de tocar em qualquer arquivo, guardei a árvore completa, refatorei, gerei
  de novo e rodei `diff -r` recursivo. Única diferença: ordem de chaves em `package.json`
  (`fastify-plugin`/`@types/pg` migraram de posição — o `Set` de dependências agora soma
  arquitetura + capability nessa ordem) e espaços em branco no fim de linha em `app.ts`. Zero
  diferença de comportamento. `npm test` completo depois do refactor: **15 testes, 0 falhas**
  (igual à Fase 2) — incluindo os dois evals com Docker real e o Vitest (`--traits vitest`
  testado manualmente de ponta a ponta nos dois profiles Postgres pós-refactor).

**Critério de saída da Fase 3, avaliado no escopo entregue:** adicionar uma nova capability de
persistência Postgres (ex.: Prisma) agora custa escrever um arquivo em `capabilities/`
reaproveitando `postgres-shared.js` e o núcleo de `architectures/modular-persisted.js` — não mais
um arquivo de 400+ linhas copiado de um dos dois existentes. O que o critério original também
pedia ("matriz combinatória inteira compila em CI") depende de expandir o catálogo de
combinações, que é trabalho da Fase 5 (ou de uma rodada futura desta Fase 3, se o usuário decidir
retomar o escopo "tudo").

## 11. Fase 4 do roadmap — ambiente e contrato da app

Escopo desta rodada, decidido com o usuário antes de começar: **só os consertos de contrato nos 6
profiles já existentes** (achados 09–13). As duas capabilities novas que o roadmap original também
listava nesta fase — Dockerfile multi-stage/`.dockerignore` e devcontainer — ficaram de fora por
serem "catálogo novo", não "conserto de promessa quebrada"; podem entrar numa rodada futura.

**O que mudou:**

- **README gerado por profile (parte do achado 09).** `core/readme.js` monta o `README.md` a
  partir dos **scripts e arquivos finais** já resolvidos (depois de traits e capability
  aplicados) — não é texto fixo por profile. Detecta `/ready` e `/users` pela presença real do
  arquivo (`health.route`/`users.route`), não por `persistence !== 'none'`: `modular` tem os dois
  mesmo sem persistência (CRUD em memória), e isso quase virou um bug no README também.
- **Graceful shutdown (achado 10).** `serverContent` (compartilhado por minimal/modular/mvc, e a
  versão própria do `clean`) ganhou handlers de `SIGTERM`/`SIGINT` que chamam `app.close()` antes
  de `process.exit()`. Como o Fastify já dispara os hooks `onClose` de todo plugin registrado,
  isso também fecha a conexão com o banco nos profiles Postgres — não precisou de nada adicional
  no lado do Sequelize (o plugin já registrava `onClose` corretamente).
- **Achado 13 (dois pools no Kysely) resolvido.** O plugin `db-pool.ts` abria seu próprio
  `pg.Pool` e decorava `fastify.dbPool`, que nenhum repositório usava — todo mundo importa o
  singleton `db` de `database.ts`, que tem seu próprio pool via `PostgresDialect`. Renomeado para
  `db-lifecycle.ts`: agora só referencia o singleton `db`, testa a conexão no boot
  (`sql\`SELECT 1\`.execute(db)`, mesma ideia do `sequelize.authenticate()`) e registra
  `db.destroy()` no `onClose`. Como bônus, `app.ts` não precisa mais de `loadEnv()`/`const env`
  só para passar a connection string pro plugin — o singleton já resolve isso sozinho.
- **Bug real encontrado testando o shutdown, não estava na lista de achados**: o `pg.Pool` do
  Kysely não tinha listener de `'error'`. Quando o Postgres cai com uma conexão ociosa no pool
  (testado derrubando o container com `docker compose stop postgres` com o app de pé), o Node
  tratava isso como um evento `'error'` não capturado e **derrubava o processo inteiro** — via de
  regra o tipo de bug que só aparece em produção, num restart de banco. Corrigido com
  `pool.on('error', ...)` em `database.ts`. Confirmado que o Sequelize não tinha esse problema
  (o pool interno dele já segura esse erro).
- **Achado 11 (`/health` independente de serviço externo) verificado de verdade**, não só lido no
  código: com o app de pé, `docker compose stop postgres`, `/health` continua 200, `/ready`
  degrada pra 503. Isso já era estruturalmente verdade antes desta fase (o handler de `/health`
  nunca faz I/O), mas ficava invisível sem o pool não travar o processo inteiro no meio do
  caminho — os dois achados (11 e 13) estavam mais entrelaçados do que a lista sugeria.
- **Eval estendido, não duplicado**: em vez de um eval novo só pra "contrato", o
  `eval-first-command.test.js` da Fase 1 ganhou as asserções desta fase (é literalmente o cenário
  onde elas importam): checagem README ↔ `package.json` (todo script real documentado),
  `docker compose stop postgres` + `/health` ainda 200 (profiles Postgres), e confirmação de que o
  processo morre sozinho com SIGTERM dentro de 10s (sem cair no SIGKILL de força do teardown) —
  para os 6 profiles.

**Deliberadamente fora desta rodada:** `.env` por ambiente (dev/test/ci) com o eval usando um
banco isolado. Investigando a implementação, virou uma feature de verdade — precisaria de um
segundo banco Postgres criado via init script do compose, uma `TEST_DATABASE_URL` distinta, e um
hook `pretest` migrando esse segundo banco antes da suíte rodar (hoje `npm test` e `npm run dev`
apontam pro mesmo `fastify_dev`, então rodar os dois ao mesmo tempo localmente faria os testes
apagarem dado de dev via `TRUNCATE`/`DELETE`). Não é um "conserto de promessa quebrada" do
tamanho dos outros itens desta fase — fica registrado aqui como dívida conhecida, não escondido.

Verificado com `npm test` completo: **15 testes, 0 falhas** (igual à Fase 3), incluindo as novas
asserções de contrato nos 6 profiles.

## 12. Fase 5 do roadmap — expandir o catálogo selecionável

Escopo desta rodada, decidido com o usuário antes de começar: o roadmap original juntava cinco
frentes bem diferentes nesta fase (persistência nova — Prisma/Drizzle/MySQL/MongoDB —, plugins de
plataforma, auth JWT, Redis, observabilidade), cada uma exigindo o contrato completo do
`AGENTS.md` (`input de CLI → validação → capabilities → dependências → árvore de arquivos →
comportamento de runtime → documentação/exemplo → eval`). Em vez de abrir várias ao mesmo tempo,
esta rodada entrega **uma única capability nova, de ponta a ponta** — prova de que o modelo de
`Capability` desenhado na Fase 3 (pensado para persistência) se estende a um tipo diferente de
capability sem custo extra na engine, que era exatamente o critério de saída que a Fase 3 tinha
deixado em aberto.

**Capability escolhida: `@fastify/cors`, como `kind: 'platform'`.** Critério de escolha: zero
serviço de infra (sem `docker-compose.yml`, sem variável de ambiente própria) e zero acoplamento
com persistência — isso isola a prova no que ela precisa provar (o mecanismo de composição), sem
reabrir a complexidade de repositório/serviço que uma capability de banco (Redis, por exemplo)
traria numa arquitetura hoje pensada só para "banco ou nenhum".

**O que mudou:**

- **`Capability.kind` ganhou um terceiro valor**, `'platform'`, em `core/types.d.ts` (antes só
  `'persistence' | 'infra'`).
- **`templates/modular/index.js`**: `appContent` (string fixa) virou `buildAppTsContent(fragment =
  {})` — mesma ideia de `architectures/modular-persisted.js::buildAppTsContent`, mas para a
  variante sem persistência. Chamada sem argumento (perfil `modular` original) gera exatamente o
  mesmo `app.ts` de antes — verificado gerando os dois (antes/depois do refactor) e rodando `diff
  -r`: única diferença foi um espaço em branco no fim de uma linha, mesmo tipo de diferença
  cosmética já aceita na verificação da Fase 3.
- **`capabilities/cors.js`** (novo): a capability em si — só `dependencies.runtime:
  ['@fastify/cors']` e um `appFragment` com o import e `await app.register(cors)`. Sem arquivos,
  sem scripts, sem `composeServices`.
- **`profiles/modular-cors.js`** (novo): perfil montado à mão (não via `compose.js`) — reaproveita
  os mesmos arquivos do perfil `modular` (rotas, schemas, handler, service in-memory, inalterados)
  e monta o `app.ts` chamando `buildAppTsContent(corsCapability.appFragment)`. Não usei
  `composeProfile` porque ele foi desenhado para a família "modular + persistência", onde a
  capability é dona de todo `testFiles` (o banco substitui as rotas inteiras); aqui a capability só
  *acrescenta* um teste aos que o `modular` já tem, e mesclar as duas listas à mão é mais simples e
  mais honesto do que generalizar `compose.js` para um caso sem um segundo exemplo real ainda.
- **CLI**: novo profile `modular-cors` no menu rápido do wizard (`bin/cli.js`) e na lista
  `v2Profiles`; selecionável via `--profile modular-cors`.
- **`scripts/generate-support-matrix.js`**: nova linha na matriz.
- **Eval novo** (`tests/v2/eval-modular-cors.test.js`), no mesmo formato dos outros evals de
  profile (gerar → `npm install` → lint → build → `npm test`), mais uma checagem com servidor real
  de pé: `npm run dev`, requisição HTTP de verdade com header `Origin`, e confirmação de que
  `/health` responde com `access-control-allow-origin` (config padrão do `@fastify/cors`, sem
  allowlist, por isso `*` — não o eco do Origin, que exigiria `{ origin: true }` explícito).
- Suíte gerada ganhou `tests/cors.test.ts` (preflight `OPTIONS` + header em requisição normal),
  nas duas sintaxes (`node:test` e Vitest).

**Deliberadamente fora desta rodada** (fica no roadmap para uma rodada futura de Fase 5, não
escondido): as outras quatro frentes do roadmap original — persistência nova (Prisma/Drizzle/
MySQL/MongoDB), Redis como capability de infra (que exigiria a lógica de merge de
`composeServices` — hoje ainda só existe uma capability de infra por profile, a mesma limitação
que a Fase 3 já tinha documentado como dívida — já que Redis teria `docker-compose.yml` próprio
para combinar com o do Postgres), auth JWT, e observabilidade (log correlacionado + `/metrics`).
Cada uma delas ainda precisa do contrato completo do `AGENTS.md`, não só de uma capability.

Verificado com `npm test` completo: **16 testes, 0 falhas** (15 da Fase 4 + o novo eval de
`modular-cors`), mais `npm run docs:support-matrix:check` e `npm run test:unit` (59 testes, V1
inalterada) isoladamente.

## 13. Fase 6 do roadmap — remover a V1 e publicar

Última fase do roadmap "Primeiro comando". Escopo entregue nesta rodada: **tudo, exceto o
`npm publish` em si** — por instrução explícita do usuário, o pacote não foi publicado no npm; o
`package.json` foi preparado (versão `2.1.0`) mas a publicação fica para quando o usuário decidir.

**O que mudou:**

- **V1 removida por completo** ([ADR-004](docs/adr/ADR-004-remocao-v1.md)): `lib/scaffold/`
  (4 arquivos), `lib/templates/{js,common,ts}` (não confundir com `lib/v2/templates/`, que
  continua existindo), `lib/examples/` (todos os exemplos MVC/Modular/Clean em JS e TS do fluxo
  antigo), o script manual `test-generation.js` na raiz, `TESTING.md` (documentava só a cobertura
  do V1) e os 11 arquivos de teste que só cobriam esse código (`tests/deps.test.js`,
  `tests/writeBaseFiles.test.js`, `tests/writeBaseFilesExtended.test.js`, `tests/pkgjson.test.js`,
  `tests/makeFolders.test.js`, `tests/dbPlugin.test.js`, `tests/devcontainer.test.js`,
  `tests/eslintConfig.test.js`, `tests/fastifyDbTypes.test.js`, `tests/prismaSchema.test.js`,
  `tests/routeTemplates.test.js`). Nenhum caminho em `bin/cli.js` importava esse código desde a
  reescrita para V2 (commit `6342f1b`) — confirmado de novo antes de apagar, com grep recursivo por
  `lib/scaffold`, `lib/examples` e os três subdiretórios do `lib/templates` antigo.
- **`docs/migration/current-baseline-findings.md` fechado como resolvido-por-remoção**: ganhou um
  aviso no topo apontando para o ADR-004; o conteúdo original (o baseline que originou a migração
  V1 → V2) permanece como histórico, não foi apagado.
- **`README.md` reescrito por completo**: sem nenhuma menção ao fluxo V1/"legado". Descreve os 7
  profiles reais (incluindo `modular-cors` da Fase 5), aponta `docs/product/support-matrix.md`
  como fonte oficial, documenta `--install`/`--git`/`--force` e explica que o README de cada
  projeto gerado é dinâmico (Fase 4), não uma cópia deste.
- **Guarda de diretório não vazio (achado 15)**: `bin/cli.js` agora recusa gerar sobre um diretório
  que já existe e não está vazio, a menos que `--force` seja passado explicitamente. Antes, gerar
  `mvc` por cima de um `minimal` já instalado misturava as duas árvores em silêncio.
- **Slug do nome do projeto (achado 18)**: `core/slug.js` (novo) exporta `toPackageName(name)`,
  usado só para o campo `name` do `package.json` gerado — `"Meu Projeto!!"` agora vira
  `"meu-projeto"` em vez de ser gravado como está. O nome de pasta e o título do README continuam
  usando o texto original digitado pelo usuário; só o `package.json` precisa de um nome válido.
- **`--packageManager` removido (achado 17)**: a flag só trocava o texto impresso ao final —
  não gerava `.npmrc`, workspace, nem travava lockfile para pnpm/yarn, então prometia mais suporte
  do que existia. Como implementar isso de verdade é uma feature própria (não um conserto), a
  flag foi removida e `npm` passou a ser hardcoded nos pontos que a usavam — a mesma escolha que o
  roadmap já sugeria ("ou implementa, ou sai do CLI").
- **Limpeza de `bin/cli.js`**: a cadeia de 6 `if/else` que resolvia o profile selecionado virou um
  registro declarativo (`PROFILE_LOADERS`, um objeto `id -> loader`); `v2Profiles` (a lista usada
  para validar a flag `--profile`) passou a ser derivada desse registro (`Object.keys(...)`) em vez
  de mantida à mão em paralelo — não existe mais como as duas listas divergirem. Os imports `fs`
  e `fsp`, que estavam mortos (achado 16 já tinha sido resolvido na Fase 2, mas os imports
  continuavam órfãos), voltaram a ter uso real na guarda de diretório acima.
- **Bug encontrado e corrigido no caminho, fora da lista de achados**: `bin/cli.js` imprimia
  `create-fastify-team` como nome do produto na primeira linha, mas o pacote publicado é
  `fastify-boilerplate` (`npx fastify-boilerplate`, como o próprio README sempre instruiu) — a
  constante `PKG` estava desatualizada de uma versão anterior do projeto. Corrigida para
  `fastify-boilerplate`.
- **`package.json`**: `chalk`, `ejs`, `fs-extra` (só o V1 usava — confirmado por grep, zero
  ocorrências no código que sobrou) e a dependência `path` (nunca fazia efeito: o módulo nativo
  `node:path` sempre tem precedência sobre um pacote npm de mesmo nome em `import`/`require`, então
  essa entrada no `package.json` nunca foi resolvida por ninguém) saíram de `dependencies`. Campo
  `main: "index.js"` removido — apontava para um arquivo que nunca existiu no repositório (o pacote
  é consumido como CLI via `bin`, não como biblioteca via `require`/`import`). Versão bump para
  `2.1.0`. `npm install` rodado depois: 17 pacotes a menos, zero erro de resolução.

**Verificação:** `npm test` completo (16 testes, 0 falhas — inalterado, a V1 não fazia parte desse
número desde que virou `test:unit` apontando só para `tests/*.test.js`, que agora tem 1 teste
trivial em vez de 60) e `npm run docs:support-matrix:check`. Testado manualmente: gerar em
diretório vazio (ok), gerar em diretório não vazio sem `--force` (recusa com a mensagem certa),
gerar com `--force` por cima (permite), e `toPackageName` com nomes com espaço/maiúscula/pontuação.
Nenhum container Docker órfão depois da suíte completa.

**Atualização — publicado em sessão seguinte, por instrução explícita do usuário:** as sete PRs
aninhadas (#20–#26) foram mergeadas em `main`, a tag `v2.1.0` foi criada, uma GitHub Release foi
publicada e `npm publish` rodou — `fastify-boilerplate@2.1.0` está em produção no registry como
`latest`. Detalhes na seção 14 abaixo.

## 14. Merge, tag, release e publish em npm (fechando o roadmap)

Depois das sete PRs aninhadas abertas (achado organizacional desta sessão: nenhuma delas tinha CI
verde de verdade ainda — os evals só tinham sido verificados localmente), o usuário pediu para
mergear tudo em `main`, criar tag/release e publicar no npm. Dois bugs reais e um comportamento do
GitHub não documentado na sessão anterior apareceram no caminho:

- **CI nunca tinha passado de verdade.** `PR #20` (Fase 0, a que introduziu `.github/workflows/ci.yml`)
  estava com CI vermelho havia 19h sem que ninguém notasse — os evals tinham só sido rodados
  localmente. Duas causas, as duas por eu nunca ter verificado a execução real no GitHub antes:
  1. `actions/setup-node@v4` com `cache: npm` + `npm ci` exigem um lockfile no checkout, mas
     `package-lock.json` está no `.gitignore` deste repo — o job falhava no segundo passo, antes
     de qualquer teste rodar. Fix: `npm install` sem cache de dependências.
  2. Com o lockfile corrigido, o job do Node 20 passou mas o do Node 22 falhou especificamente no
     `test:e2e`, com `Cannot find module '.../tests/v2'` — `node --test <diretório>` resolve de
     forma diferente entre as duas versões do test runner. Fix: glob explícito
     (`tests/v2/*.test.js`) em vez de apontar para o diretório bare; o shell expande antes do Node
     decidir o que fazer com o argumento, então a diferença de versão deixa de importar.
  3. As duas correções foram feitas na branch da Fase 0 (`roadmap/v2.1-primeiro-comando`) e
     cascatearam limpo pelas branches seguintes, porque nenhuma delas jamais tocou
     `.github/workflows/ci.yml` ou o script `test:e2e` depois da Fase 0 — um merge três-vias sem
     conflito em cada uma.
- **GitHub fecha PRs órfãs, não retargeta.** Ao mergear a PR #20 com `--delete-branch`, a PR #21
  (base = `roadmap/v2.1-primeiro-comando`, a branch recém-apagada) foi **fechada automaticamente**
  pelo GitHub — não retargetada para `main`, como eu esperava por analogia com outras ferramentas.
  GitHub também recusa reabrir uma PR cuja base foi apagada (`"state cannot be changed. The ...
  branch has been deleted."`). Recuperação: abri uma PR nova (#27) do mesmo branch
  (`roadmap/fase-1-primeiro-comando`) direto para `main`, comentei em #21 apontando para ela, e
  mudei de estratégia para o resto da pilha — retargetar cada PR ainda aberta para `main`
  (`gh api -X PATCH .../pulls/N -f base=main`, já que `gh pr edit --base` retornava um erro de
  GraphQL não relacionado, sobre depreciação do Projects Classic, sem aplicar a mudança) **antes**
  de mergear, e só apagar as branches no final, depois que nenhuma PR mais dependia delas como
  base.
- **Verificação final**: depois do último merge (#26), a run de CI disparada pelo `push` em `main`
  rodou verde nos dois Node (20 e 22) — essa é a primeira vez que o pipeline completo passou de
  ponta a ponta no ambiente real do GitHub, não só localmente. `npm test` local na tip de `main`
  também: 16/16.
- **Tag `v2.1.0`, GitHub Release e `npm publish`**: nessa ordem, depois do merge e da verificação
  acima. `npm publish --dry-run` primeiro (conferiu os 50 arquivos do tarball — nenhum resquício de
  V1, nenhum `.env`, nenhum segredo) e só depois o publish real.

Estado final: `main` em `17ffc42` (histórico linear das 7 fases + os 2 fixes de CI + a PR de
recuperação #27), tag `v2.1.0`, [release no GitHub](https://github.com/PedroLLOliveira/fastify-boilerplate/releases/tag/v2.1.0),
`fastify-boilerplate@2.1.0` publicado como `latest` no npm. Todas as branches de fase foram
apagadas depois do merge.

## 15. Ambiente de teste verificado nesta sessão

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
