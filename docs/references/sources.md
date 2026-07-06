# Catálogo de fontes técnicas

> Data de consulta: 2026-07-06. Fontes primárias devem ser preferidas para comportamento de framework e tooling. Links devem ser revisados em releases maiores.

| ID | Fonte | Uso no projeto |
|---|---|---|
| F-SPECKIT | [GitHub Spec Kit](https://github.com/github/spec-kit) | processo constitution → specify → plan → tasks → implement → converge; artefatos `specs/` |
| F-AGENT-SKILLS | [Agent Skills](https://agentskills.io/home) | formato `SKILL.md`, progressive disclosure, skills portáveis |
| F-FASTIFY-PLUGINS | [Fastify Plugins](https://fastify.dev/docs/latest/Reference/Plugins/) | `register`, encapsulamento, `fastify-plugin`, composição |
| F-FASTIFY-VALIDATION | [Fastify Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) | JSON Schema, validação de request e serialização de resposta |
| F-FASTIFY-TESTING | [Fastify Testing](https://fastify.dev/docs/latest/Guides/Testing/) | `app.inject()` e padrões de teste de aplicação Fastify |
| F-NODE-RELEASES | [Node.js Releases](https://nodejs.org/en/about/previous-releases) | política de usar versões LTS/maintenance LTS em produção |
| F-REPO-V1 | [fastify-boilerplate atual](https://github.com/PedroLLOliveira/fastify-boilerplate) | baseline, migração e rastreabilidade de decisões |

## Regra de atualização

Quando uma mudança depender de API ou versão nova, adicione uma fonte ou atualize a data de consulta. Não promova um comportamento de framework a padrão do boilerplate sem registrar a decisão local em ADR quando existir mais de uma opção válida.
