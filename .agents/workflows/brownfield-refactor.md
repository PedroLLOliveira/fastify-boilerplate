# Workflow: refatoração brownfield v1 → v2

> **Status: concluído.** A v1 (`lib/scaffold/`, `lib/templates/{js,common,ts}`, `lib/examples/`) foi
> removida por completo em `v2.1.0` ([ADR-004](../../docs/adr/ADR-004-remocao-v1.md)), seguindo as
> 7 fases abaixo. Mantido como referência de método para uma futura reestruturação equivalente —
> não descreve mais trabalho pendente neste repositório.

## Propósito

Preservar o que funciona enquanto a arquitetura interna muda. A v2 só substitui uma superfície da v1 quando o contrato equivalente estiver validado.

## Fases

1. **Congelar e caracterizar**: registrar comportamento atual, opções realmente disponíveis e defeitos conhecidos.
2. **Criar núcleo paralelo**: introduzir `core`, catálogo de versões e contracts sem reescrever tudo.
3. **Promover um profile de referência**: `minimal` TypeScript sem banco, end-to-end verde.
4. **Promover o profile padrão**: `modular` sem banco e depois `modular + postgres-kysely`.
5. **Migrar compatibilidades**: avaliar Sequelize/MVC/Clean como profiles explicitamente suportados ou removidos.
6. **Virada de chave**: trocar comando padrão/documentação após evals verdes.
7. **Deprecação limpa**: manter guia de migração e remover código antigo somente depois da janela definida.

## Regra de ouro

Não migre uma opção de UI/CLI para v2 antes de existir uma specification, uma eval e documentação correspondente.
