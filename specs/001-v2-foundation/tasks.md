# Tarefas — Fundação v2: profile minimal TypeScript

## Contratos e núcleo v2

- [ ] T001: Implementar tipos `ProfileDefinition`, `CapabilitySet`, `FileManifest` e `DependencyManifest` em um novo pacote/scaffold no diretório de core v2.
- [ ] T002: Criar catálogo central de versões fixas para Node (>=20), Fastify (^5) e TS (^5.5), extirpando o uso de tags `"latest"`.
- [ ] T003: Alterar CLI (`bin/cli.js`) para suportar captura e repasse não-interativo do `--profile minimal` e `--projectName`, direcionando a execução para a engine v2.

## Template e Aplicação Gerada (Profile Minimal)

- [ ] T010: Desenvolver e renderizar arquivos base do "minimal" sem depender do motor v1 antigo.
- [ ] T011: Configurar adequadamente o motor TypeScript para ESM puro no projeto gerado (`type: "module"` + `moduleResolution: "NodeNext"`).
- [ ] T012: Criar composição estática de inicialização `src/app.ts` (registrando plugins) e listener `src/server.ts` (sem depender de replace condicional com Regex em arquivos).
- [ ] T013: Criar rotas `/health` e `/hello` com schemas JSON (entrada e saída) em TS puro.
- [ ] T014: Criar diretório `tests/` dentro da app gerada, portando script nativo via `node --test` e injetando a aplicação (`app.inject()`).

## Documentação e Limpeza de Produto

- [ ] T020: Remover ou classificar explicitamente as promessas irreais do README base atual (arquiteturas indisponíveis, TypeORM, Prisma, MVC) indicando o profile Minimal como "suportado".
- [ ] T021: Adequar a definição de testes e scripts expostos no `.env.example` e documentações da root.

## Verificação e Evals (End-to-End)

- [ ] T030: Implementar script isolado de eval E2E (gera pasta temporária do app CLI e interage via spawn).
- [ ] T031: A eval deve conseguir executar um loop perfeito de `npm install`, `npm run lint`, `npm run build` e o `npm test` gerado nativamente da aplicação em pasta tmp.
- [ ] T032: Validar o funcionamento perfeito sem conflito `node10`/ESM.
- [ ] T033: Preencher checklist consolidada no `acceptance.md`.
