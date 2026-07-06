# Eval — documentação e proveniência

## Objetivo

Impedir que README e exemplos anunciem funcionalidades que o produto não suporta ou usem referências inexistentes.

## Assertions

- [ ] todo profile citado como suportado aparece na matriz e no registry;
- [ ] scripts citados nos READMEs gerados existem no manifest do profile;
- [ ] cada ID `[F-*]` usado em `docs/examples/` existe em `docs/references/sources.md`;
- [ ] fontes de framework são primárias quando disponíveis;
- [ ] exemplos indicam se são código didático ou código efetivamente gerado;
- [ ] links para versões antigas não aparecem como “latest” sem justificativa.
