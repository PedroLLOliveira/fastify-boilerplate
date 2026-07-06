---
name: example-provenance
description: Use ao criar, revisar ou publicar exemplos de código, guias de uso, snippets ou referências técnicas no fastify-boilerplate.
---

# Proveniência de exemplos

## Objetivo

Todo exemplo gerado pelo boilerplate deve ser ensinável, executável e rastreável. O agente não deve apresentar padrões inventados como se fossem comportamento oficial de uma biblioteca.

## Regras

1. Usar fontes primárias sempre que existirem: Fastify, Node.js, especificação JSON Schema e documentação oficial do pacote envolvido.
2. Registrar a fonte em `docs/references/sources.md` com ID estável, URL, tópico e data de consulta.
3. Em cada exemplo, indicar quais fontes sustentam APIs ou comportamentos relevantes.
4. Separar claramente:
   - **Fato de framework**: documentado pela fonte;
   - **Decisão do boilerplate**: decisão local, registrada em ADR ou profile;
   - **Exemplo didático**: código reduzido para explicar o padrão.
5. Cada exemplo deve ter uma forma de validação: teste, eval ou comando documentado.

## Não fazer

- Não copiar blocos extensos de documentação de terceiros.
- Não usar links aleatórios de blog como única base de um padrão central.
- Não atualizar versões em exemplos sem atualizar a política de compatibilidade.
