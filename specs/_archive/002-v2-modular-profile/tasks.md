# Tarefas — V2 Modular Profile

## Integração da CLI
- [x] T001: Alterar `bin/cli.js` para mapear o argumento `--profile modular` e direcionar o bypass para `renderProfile(modularProfile)`.

## Definição do Profile e Templates
- [x] T002: Criar arquivo manifesto em `lib/v2/profiles/modular.js` com a lista exata de arquivos da especificação (incluindo dependências).
- [x] T003: Criar diretório `lib/v2/templates/modular/`.
- [x] T004: Implementar template de `src/app.ts` e `src/server.ts` contendo registro estático das rotas.
- [x] T005: Implementar os 4 arquivos do módulo de Usuários (`users.route.ts`, `users.schema.ts`, `users.handler.ts`, `users.service.ts`).
- [x] T006: Implementar os arquivos do módulo de Health (`health.route.ts`, `health.schema.ts`).
- [x] T007: Implementar suite de testes simulando requests ao `/users` e `/health` (`tests/users.test.ts`, `tests/health.test.ts`).

## Verificação e Evals (End-to-End)
- [x] T008: Criar `tests/v2/eval-modular.test.js` utilizando o fluxo de spawn do Node.
- [x] T009: Atualizar documentações e `README.md` incluindo o profile `modular` (suportado).
