# Plano — Visão da plataforma v2

## Arquitetura de produto

A v2 separa responsabilidades em quatro camadas:

1. **CLI**: coleta/valida entrada e apresenta UX.
2. **Core**: resolve profile e capabilities, monta árvore e dependências.
3. **Profiles**: definem estruturas e exemplos por arquitetura/persistência.
4. **Evals**: validam o produto gerado em ambiente limpo.

## Sequência de entrega

1. fundação TypeScript e profile `minimal` sem banco;
2. profile `modular` sem banco;
3. `modular + postgres-kysely` como primeiro profile persistente;
4. compatibilidade `postgres-sequelize` se houver demanda comprovada;
5. perfis MVC e Clean após exemplo completo e eval dedicada;
6. deprecação da v1 e publicação estável.

## Decisões de contenção

- Não expor uma opção até a sua eval existir.
- Não usar `latest` no projeto gerado.
- Não suportar matriz cartesiana de arquitetura × ORM × banco; suportar somente combinations nomeadas.
- Manter documentação e exemplos próximos ao profile correspondente, com índice central.
