# ADR-003 — Proveniência obrigatória para exemplos

- **Status:** proposto
- **Data:** 2026-07-06

## Contexto

Boilerplates frequentemente acumulam snippets sem explicação de origem, versão ou intenção. Isso dificulta atualizações e leva agentes a reproduzirem padrões obsoletos.

## Decisão

Todo exemplo técnico publicado deve indicar fontes primárias por ID em `docs/references/sources.md` e distinguir comportamento de framework de decisão local do boilerplate.

## Consequências

- maior esforço ao criar exemplos;
- menor risco de documentação inventada ou desatualizada;
- revisão de versão mais objetiva;
- melhor contexto para agentes e contribuidores.
