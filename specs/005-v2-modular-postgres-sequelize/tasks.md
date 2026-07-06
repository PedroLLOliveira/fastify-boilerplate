# Tarefas — V2 Modular Postgres Sequelize Profile

## Planejamento e Estrutura do Profile
- [ ] T001: Criar template isolado `lib/v2/templates/modular-pg-sequelize` aproveitando a organização semântica estabelecida na arquitetura modular.
- [ ] T002: Adicionar configuração de perfil (`lib/v2/profiles/modular-sequelize.js` ou equivalente) contendo manifesto de dependências rígidas (`sequelize`, `pg`, `sequelize-cli`), desaprovando versões `latest`, e as diretrizes de caminhos de arquivos em disco (sem replace).

## Banco de Dados e Lifecycle
- [ ] T003: Construir inicializador `src/db/database.ts` provendo a factory unificada de conexão do Sequelize que consome obrigatoriamente variáveis tipadas provenientes da chave de `DATABASE_URL`.
- [ ] T004: Desenvolver plugin Fastify wrapper (`src/plugins/db-sequelize.ts`) para verificação de liveness assíncrona na iniciação e execução protetiva do `sequelize.close()` contida em gatilhos `onClose` do pool global.
- [ ] T005: Elaborar `.sequelizerc` compatível com a árvore de módulos proposta e injetar esqueletos padrão para habilitar migrações/seeds geridas inteiramente por `sequelize-cli`.

## Implementação Limpa da Camada de Domínio
- [ ] T006: Criar a definição inicial de Model `User` do Sequelize adaptado estritamente para sintaxe moderna do TS (Data Types, init parameters).
- [ ] T007: Estabelecer arquivo `users.repository.ts`, único local que importa/conhece a classe `User`. Mapear interrupções, como falhas no `SequelizeUniqueConstraintError`, para o lançamento coeso de `DomainConflictError`.
- [ ] T008: Implementar `users.service.ts` e `users.handler.ts`, delegando fluxos HTTP, processamento de schemas e validação nativa sem acoplamento a objetos de persistência.

## Alinhamento aos Runtime Contracts (Spec 004)
- [ ] T009: Inserir e documentar o endpoint de readiness (`/ready` e `/health`), validando o pulso vital via `sequelize.authenticate()` encapsulado para emitir fallback `503` tolerante à paralisação temporal (hang) e quedas de driver.
- [ ] T010: Integrar as respostas HTTP unificadas no `app.ts` (ErrorHandler global) formatando deterministicamente qualquer `DomainConflictError` em respostas JSON padrão `409 Conflict`.

## Testes e Automação CI (Evals)
- [ ] T011: Elaborar o simulador completo `tests/v2/eval-modular-pg-sequelize.test.js`, responsável por engatilhar geração real do sistema, disparar um PostgreSQL limpo efêmero no Docker compose associado, acionar `db:migrate`, build e injetar asserts finais E2E garantindo sucesso funcional e de resiliência HTTP.
- [ ] T012: Atualizar os seletores do CLI (ex: `bin/cli.js` ou parsers) a fim de expor a flag determinística `--profile modular-postgres-sequelize`.
