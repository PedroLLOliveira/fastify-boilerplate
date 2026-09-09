# Tarefas — Spec 006: Dev Tooling Composability

- [ ] **T001**: Definir a interface `TraitDefinition` em `lib/v2/core/types.d.ts` (suporte a dependências, arquivos extras e scripts mutáveis).
- [ ] **T002**: Refatorar `lib/v2/core/engine.js` para receber um array de `traits` além do profile base, fazendo merge seguro de dependências (resolvidas do `catalog.js`) e scripts.
- [ ] **T003**: Criar os Traits de Linter: `eslint-basic.js`, `eslint-prettier.js` (movendo o template correspondente).
- [ ] **T004**: Criar o Trait de Pre-commit: `husky-lint-staged.js` injetando a configuração do shell.
- [ ] **T005**: Criar os Traits de Teste: `node-native-test.js` (baseline atual) e `vitest.js`.
- [ ] **T006**: Adicionar dependências faltantes ao `catalog.js` (husky, lint-staged, prettier, vitest).
- [ ] **T007**: Modificar `bin/cli.js` para adicionar os prompts no fluxo V2 "Customizado" e passar as escolhas como um array de `traits` para a `renderProfile`.
- [ ] **T008**: Validar a composição escrevendo um teste E2E dinâmico ou atualizando os existentes para plugar um trait aleatório e checar o sucesso do build.
