# ADR-001 — TypeScript como caminho principal da v2

- **Status:** proposto
- **Data:** 2026-07-06

## Contexto

A v1 tenta gerar JavaScript e TypeScript, o que duplica templates, testes e riscos de divergência. A v2 precisa primeiro provar um caminho completo e sustentável.

## Decisão

A v2 terá TypeScript como caminho principal. JavaScript puro não será removido automaticamente, mas não será ampliado até existir uma spec de compatibilidade, uso real e eval equivalente.

## Consequências

- menos duplicação inicial;
- melhor contrato entre schemas e handlers;
- exigência de typecheck em cada profile;
- usuários de JS terão guia de migração ou um profile legado explicitamente marcado.
