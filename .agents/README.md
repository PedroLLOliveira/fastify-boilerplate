# Biblioteca de skills e workflows

As skills usam o formato aberto `SKILL.md`: uma pasta com metadados, instruções, referências e, quando necessário, scripts ou assets. Elas existem para concentrar conhecimento procedimental do repositório, carregar apenas quando relevantes e serem reutilizáveis em outros agentes compatíveis.

## Skills

| Skill | Quando ativar |
|---|---|
| `spec-driven-delivery` | qualquer mudança funcional, feature, refactor ou bug relevante |
| `generator-contract` | CLI, dependências, templates, opções e árvore gerada |
| `fastify-architecture` | definição de perfil minimal, modular, MVC ou clean |
| `example-provenance` | exemplos, documentação técnica e fontes |
| `quality-evals` | testes, snapshots, smoke tests e gates de release |
| `security-release` | dependências, publicação, CI, secrets e supply chain |

## Workflows

Use `feature-lifecycle.md` para evoluções normais. `brownfield-refactor.md` documenta o processo usado na migração v1 → v2 (concluída em `v2.1.0`, [ADR-004](../docs/adr/ADR-004-remocao-v1.md)) — mantido como referência de método para uma futura reestruturação equivalente, não como trabalho em aberto.
