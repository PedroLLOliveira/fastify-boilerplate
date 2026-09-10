# Evals do fastify-boilerplate

> **Nota sobre este diretório**: os arquivos em `cases/` são specs de caso em Markdown, escritas
> antes da implementação — algumas descrevem comportamento que já existe (ex.:
> `cli-invalid-selection.md` item 4, "diretório destino não vazio sem `--force`", implementado na
> Fase 6 do roadmap "Primeiro comando"), outras ainda não (ex.: `cli-create-modular-postgres.md`
> cita uma "spec futura"). Não confunda com a suíte que **de fato roda**: os evals automatizados e
> executáveis vivem em `tests/v2/eval-*.test.js` (rodados por `npm run test:e2e`), um por profile
> publicado em `lib/v2/profiles/`. A sintaxe de CLI usada nos exemplos abaixo (`create-fastify-boilerplate
> sample-api --profile minimal --no-interactive`) também não corresponde à interface real
> (`node bin/cli.js --profile minimal --projectName sample-api`, ou `npx fastify-boilerplate ...`
> depois de publicado) — os arquivos aqui nunca foram atualizados para a sintaxe real do `bin/cli.js`.

As evals verificam que o CLI gera um projeto funcional. Elas são o gate para declarar um profile como suportado.

## Classificação

- `cases/cli-*`: comportamento do CLI e projeto temporário.
- `cases/documentation-*`: consistência de documentação/referências.
- futuramente `profiles/`: fixtures completas por profile.

## Evidência mínima por profile

1. comando não interativo;
2. diretório criado;
3. árvore esperada;
4. `package.json` coerente;
5. instalação e scripts;
6. typecheck/build/test;
7. endpoint `/health`;
8. rota de exemplo;
9. limpeza de recursos.
