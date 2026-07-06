# ADR-002 — Profiles nomeados em vez de matriz cartesiana

- **Status:** proposto
- **Data:** 2026-07-06

## Contexto

Arquitetura × ORM × banco × query builder cria muitas combinações. A v1 já demonstra como opções parcialmente integradas podem quebrar imports, dependências ou runtime.

## Decisão

Publicar profiles nomeados e avaliados, como `minimal`, `modular` e `modular-postgres-kysely`. O CLI só exibe combinations com contrato completo.

## Consequências

- menos opções aparentes, mais confiança real;
- cada profile tem docs e eval próprios;
- extensão futura acontece por profile/adapter, não por condições espalhadas;
- decisões de expansão precisam de spec e custo de manutenção explícito.
