---
name: spec-driven-delivery
description: Use para transformar uma ideia, bug ou refatoração de fastify-boilerplate em uma especificação, plano, tarefas, implementação verificável e convergência final.
---

# Entrega guiada por especificação

## Objetivo

Evitar alterações por impulso em um gerador que possui muitas combinações. O agente deve transformar intenção em critérios verificáveis antes de alterar código.

## Processo

1. Criar `specs/<nnn>-<slug>/spec.md` a partir do template.
2. Declarar o problema, usuários, escopo, fora de escopo, cenários e critérios de aceite observáveis.
3. Registrar ambiguidades e resolvê-las antes do plano quando afetarem interface, contrato ou compatibilidade.
4. Criar `plan.md` com decisões, arquivos, migração, impacto de matriz e estratégia de teste.
5. Criar `tasks.md` com unidades pequenas e ordenadas.
6. Implementar uma tarefa de cada vez.
7. Atualizar `acceptance.md` com evidências.
8. Executar convergência: comparar comportamento real, spec, plano, tarefas, docs e evals.

## Regras de qualidade

- Specs descrevem **o quê** e **por quê**; detalhes de implementação pertencem ao plano.
- Critérios de aceite devem ser observáveis por usuário, CLI, arquivo gerado ou teste.
- Cada tarefa precisa mencionar o contrato ou critério que satisfaz.
- Tarefas que mudam código gerado exigem uma eval de projeto temporário.
- Não iniciar implementação com decisão arquitetural em aberto.

## Saída mínima

- `spec.md`
- `plan.md`
- `tasks.md`
- `acceptance.md`
- links para ADRs, fontes e evals relevantes
