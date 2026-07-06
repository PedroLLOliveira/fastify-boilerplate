# Evals do fastify-boilerplate

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
